import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getSessionUser } from "@/lib/rbac";
import Transaction from "@/models/Transaction";
import BankReco from "@/models/BankReco";
import Owner from "@/models/Owner";
import CA from "@/models/CA";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { user, error, status } = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error }, { status: status || 401 });
    }

    const isCA =
      user.role === "CA" ||
      user.role === "CA-Employee" ||
      user.role === "CAStaff" ||
      user.role === "CA_STAFF" ||
      user.normalizedRole === "CA" ||
      user.normalizedRole === "CA_STAFF";

    const isOwner = user.role === "Owner" || user.role === "OWNER" || user.isSuperAdmin;

    if (!isCA && !isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Accessible only by Chartered Accountants and SME Owners." },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const requestedCompanyId = searchParams.get("companyId");

    let targetCompanyIds = [];

    if (isOwner) {
      const compId = user.companyId || user.userId;
      if (compId) targetCompanyIds = [new mongoose.Types.ObjectId(compId)];
    } else if (isCA) {
      if (requestedCompanyId) {
        targetCompanyIds = [new mongoose.Types.ObjectId(requestedCompanyId)];
      } else {
        const caFirmId = user.caFirmId || user.companyId || user.userId;
        const caFirm = await CA.findById(caFirmId).lean();
        const connectedOwners = await Owner.find({
          $or: [
            { linkedCA: caFirm?._id, dataSharingStatus: "CONNECTED" },
            { _id: { $in: caFirm?.clientCompanies || [] } },
            { _id: { $in: caFirm?.clients || [] } }
          ]
        }).select("_id");
        targetCompanyIds = connectedOwners.map((o) => o._id);
      }
    }

    if (targetCompanyIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          taxSummary: {
            totalGrossSales: 0,
            totalOutputTax: 0,
            totalGrossExpenses: 0,
            totalInputTaxCredit: 0,
            netTaxPayable: 0,
            pendingAuditCount: 0
          },
          incomeTable: [],
          expensesTable: [],
          reconciliationsTable: []
        }
      });
    }

    // STRICT FUNNEL: Only query Finance and Sales departments.
    // ZERO operational stocks, warehouse goods, or HR attendance/leaves queried.
    const query = {
      companyId: { $in: targetCompanyIds },
      department: { $in: ["FINANCE", "SALES"] }
    };

    // Parallel fetch of transactions and bank reco data
    const [transactions, bankRecos] = await Promise.all([
      Transaction.find(query).sort({ transactionDate: -1, createdAt: -1 }).limit(100).lean(),
      BankReco.find({ companyId: { $in: targetCompanyIds } }).sort({ date: -1 }).limit(50).lean().catch(() => [])
    ]);

    // Separate into tax-ready Income Table vs Expense Table
    const incomeTable = [];
    const expensesTable = [];

    let totalGrossSales = 0;
    let totalOutputTax = 0;
    let totalGrossExpenses = 0;
    let totalInputTaxCredit = 0;
    let pendingAuditCount = 0;

    transactions.forEach((tx) => {
      const amount = tx.totalAmount ?? tx.amount ?? 0;
      const taxAmt = tx.taxAmount || Math.round(amount * 0.18 / 1.18); // Default 18% GST estimate if not itemized
      const baseAmt = Math.max(0, amount - taxAmt);

      const isSalesType = [
        "SALES",
        "INCOME",
        "ADVANCE_RECEIVED",
        "COLLECTION",
        "PAYMENT_IN"
      ].includes((tx.type || "").toUpperCase());

      if (tx.status === "PENDING_CA_REVIEW" || tx.status === "QUERY_RAISED") {
        pendingAuditCount++;
      }

      if (isSalesType) {
        totalGrossSales += amount;
        totalOutputTax += taxAmt;
        incomeTable.push({
          id: tx._id.toString(),
          invoiceNumber: tx.metadata?.invoiceNumber || tx.receiptNumber || `INV-${tx._id.toString().slice(-6)}`,
          customerName: tx.metadata?.customerName || tx.metadata?.vendorName || "Retail Client",
          gstin: tx.metadata?.gstin || "URP (Unregistered)",
          date: tx.transactionDate || tx.createdAt,
          baseAmount: baseAmt,
          taxAmount: taxAmt,
          totalAmount: amount,
          paymentMode: tx.paymentMethod || tx.metadata?.paymentMode || "Bank / UPI",
          status: tx.status || "APPROVED",
          department: "SALES"
        });
      } else {
        totalGrossExpenses += amount;
        totalInputTaxCredit += taxAmt;
        expensesTable.push({
          id: tx._id.toString(),
          receiptNumber: tx.receiptNumber || tx.metadata?.receiptNumber || `VCH-${tx._id.toString().slice(-6)}`,
          vendorName: tx.metadata?.vendorName || tx.metadata?.payeeName || "General Vendor",
          category: tx.metadata?.category || tx.type || "Operational Expense",
          gstin: tx.metadata?.gstin || "URP (Unregistered)",
          date: tx.transactionDate || tx.createdAt,
          baseAmount: baseAmt,
          taxAmount: taxAmt,
          totalAmount: amount,
          paymentMode: tx.paymentMethod || tx.metadata?.paymentMode || "Bank / Cash",
          status: tx.status || "APPROVED",
          department: "FINANCE"
        });
      }
    });

    // Format reconciliations table
    const reconciliationsTable = (bankRecos || []).map((r) => ({
      id: r._id.toString(),
      accountName: r.bankAccountName || r.bankName || "Primary Current Account",
      statementDate: r.date || r.createdAt,
      reconciliationStatus: r.status || "MATCHED",
      closingBalance: r.closingBalance || 0,
      unreconciledDifference: r.difference || 0,
      notes: r.remarks || "No variances detected"
    }));

    const netTaxPayable = Math.max(0, totalOutputTax - totalInputTaxCredit);

    return NextResponse.json({
      success: true,
      data: {
        taxSummary: {
          totalGrossSales,
          totalOutputTax,
          totalGrossExpenses,
          totalInputTaxCredit,
          netTaxPayable,
          pendingAuditCount,
          reportingStandard: "GST Compliant Double-Entry (GSTR-1 & 3B Ready)",
          funneledDepartments: ["SALES", "FINANCE"],
          excludedDepartments: ["OPERATIONS", "HR"]
        },
        incomeTable,
        expensesTable,
        reconciliationsTable
      }
    });
  } catch (err) {
    console.error("GET /api/ca/financial-summary Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate financial summary." },
      { status: 500 }
    );
  }
}
