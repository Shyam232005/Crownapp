import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getSessionUser, checkDepartmentAccess } from "@/lib/rbac";
import Transaction from "@/models/Transaction";
import CRMDeal from "@/models/CRMDeal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/sales
 * Strict RBAC: Accessible only by SALES department employees, Owner, or Admin.
 * Operations employees calling this will receive a 403 Forbidden status.
 */
export async function GET(request) {
  try {
    const { user, error, status } = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error }, { status: status || 401 });
    }

    // Enforce SALES department access
    const access = checkDepartmentAccess(user, ["SALES"]);
    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: access.error || "Forbidden: Only Sales department personnel can access this endpoint.",
          code: "DEPARTMENT_FORBIDDEN",
          currentDepartment: access.userDepartment,
          requiredDepartment: "SALES"
        },
        { status: 403 }
      );
    }

    await connectDB();
    const companyId = user.companyId || user.userId;
    if (!companyId) {
      return NextResponse.json({ success: false, error: "Company context missing." }, { status: 400 });
    }

    const compObjectId = new mongoose.Types.ObjectId(companyId);

    // Fetch sales data
    const [salesTransactions, deals] = await Promise.all([
      Transaction.find({
        companyId: compObjectId,
        department: "SALES"
      })
        .sort({ transactionDate: -1, createdAt: -1 })
        .limit(50)
        .lean(),
      CRMDeal.find({
        companyId: compObjectId
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    ]);

    // Calculate quick sales totals
    const totalSalesRevenue = salesTransactions.reduce((acc, curr) => acc + (curr.totalAmount || curr.amount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalSalesRevenue,
        transactionsCount: salesTransactions.length,
        dealsCount: deals.length,
        salesTransactions,
        deals
      }
    });
  } catch (err) {
    console.error("GET /api/sales Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to retrieve sales data." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sales
 * Strict RBAC: Operations employees cannot create sales records.
 */
export async function POST(request) {
  try {
    const { user, error, status } = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error }, { status: status || 401 });
    }

    const access = checkDepartmentAccess(user, ["SALES"]);
    if (!access.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: access.error || "Forbidden: Operations employees cannot post to Sales API.",
          code: "DEPARTMENT_FORBIDDEN",
          currentDepartment: access.userDepartment,
          requiredDepartment: "SALES"
        },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();
    const companyId = user.companyId || user.userId;

    const amount = Number(body.amount || body.totalAmount || 0);
    if (!amount) {
      return NextResponse.json({ success: false, error: "Valid amount is required." }, { status: 400 });
    }

    const newTxn = await Transaction.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      createdBy: new mongoose.Types.ObjectId(user.userId),
      department: "SALES",
      type: body.type ? body.type.toUpperCase() : "SALES",
      amount,
      totalAmount: amount,
      paymentMethod: body.paymentMethod || "UPI",
      receiptNumber: body.receiptNumber || `INV-${Date.now()}`,
      metadata: {
        customerName: body.customerName || "Walk-in Customer",
        invoiceNumber: body.invoiceNumber || `INV-${Date.now()}`,
        description: body.description || "Direct sales entry",
        category: "Sales Revenue"
      }
    });

    return NextResponse.json({
      success: true,
      message: "Sales record created successfully.",
      data: newTxn
    }, { status: 201 });
  } catch (err) {
    console.error("POST /api/sales Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create sales record." },
      { status: 500 }
    );
  }
}
