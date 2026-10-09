import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";
import Owner from "@/models/Owner";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden: Staff access only" }, { status: 403 });
    }

    await connectDB();
    const { clientId, period, format } = await request.json();

    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
    }

    // 1. Authorization: Ensure CA Firm or Staff is assigned to manage this client
    if (isStaff) {
      let assignedIds = decoded.assignedCompanies || [];
      if (!assignedIds.length) {
        const staffMember = await CAStaff.findById(decoded.userId).lean();
        assignedIds = (staffMember?.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember?.assignedClients || [])).map(id => id.toString());
      }
      if (!assignedIds.includes(clientId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access: Client company is not assigned to your staff account." }, { status: 403 });
      }
    } else {
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      const allIds = (caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : []).map(id => id.toString());
      if (!allIds.includes(clientId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
      }
    }

    // Fetch the client to get the business name for the filename
    const client = await Owner.findById(clientId);
    const companyName = client?.companyName || "Unknown_Client";

    // Zero-Trust Vault API-level Blocking (allow if dataSharingStatus === 'CONNECTED' or Unlocked)
    const latestUnlockLog = await AuditLog.findOne({
      entityId: clientId.toString(),
      action: { $in: ["VAULT_UNLOCKED", "DATA_SYNC_DISPATCHED"] }
    }).sort({ createdAt: -1 });

    const isVaultUnlocked = (client && (client.vaultStatus === "Unlocked" || client.dataSharingStatus === "CONNECTED")) || !!latestUnlockLog;
    if (!isVaultUnlocked) {
      return NextResponse.json({ 
        success: false,
        error: "Zero-Trust Vault Locked: Data export blocked. The SME Owner must explicitly unlock the Data Vault for this period." 
      }, { status: 423 });
    }

    // 2. Build Date Filters based on period
    const now = new Date();
    let startDate, endDate;

    if (period === "Current Month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (period === "Previous Month") {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === "Q2 2026") {
        startDate = new Date("2026-07-01T00:00:00.000Z");
        endDate = new Date("2026-09-30T23:59:59.999Z");
    } else {
        // Fallback to all time if not recognized
        startDate = new Date("2000-01-01");
        endDate = new Date();
    }

    // 3. Fetch ONLY Approved or previously Exported transactions
    const exportData = await Transaction.find({
        companyId: clientId,
        status: { $in: ["APPROVED", "EXPORTED"] },
        transactionDate: { $gte: startDate,$lte: endDate }
    }).sort({ transactionDate: 1 });

    if (exportData.length === 0) {
        return NextResponse.json({ success: false, error: `No verified entries found for ${period}` }, { status: 404 });
    }

    // 4. Construct CSV File String
    const headers = ["Date", "Type", "Party Name", "Amount", "GSTIN", "Invoice Number", "Payment Mode", "Description", "Status"];
    
    const csvRows = [
        headers.join(","),
        ...exportData.map(item => {
            const date = item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-IN') : "";
            const meta = item.metadata || {};
            const party = (meta.vendorName || meta.customerName || meta.payeeName || "").replace(/,/g, ''); // Remove commas to preserve CSV structure
            const desc = (meta.description || "").replace(/,/g, '');
            
            return `"${date}","${item.type}","${party}","${item.totalAmount}","${meta.gstin || ''}","${meta.invoiceNumber || ''}","${meta.paymentMode || ''}","${desc}","${item.status}"`;
        })
    ].join("\n");

    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `FineOps_${sanitizedCompanyName}_${period.replace(/\s+/g, '_')}.csv`;

    return NextResponse.json({ 
        success: true, 
        fileData: csvRows, 
        filename 
    }, { status: 200 });

  } catch (error) {
    console.error("POST Export Data Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}