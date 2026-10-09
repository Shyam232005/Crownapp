import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import CRMDeal from "@/models/CRMDeal";
import Employee from "@/models/Employee";
import Owner from "@/models/Owner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ZERO CA ACCESS: CRM pipeline is hidden from CA
    const isCA =
      decoded.role === "CA" ||
      decoded.role === "CA-Employee" ||
      decoded.role === "CA_STAFF" ||
      decoded.role === "CAStaff";

    if (isCA) {
      return NextResponse.json(
        { success: false, error: "Forbidden: CRM Deal pipeline is internal to SME operations and inaccessible to CA." },
        { status: 403 }
      );
    }

    await connectDB();
    const companyId = decoded.companyId || decoded.userId;
    if (!companyId) {
      return NextResponse.json({ success: false, error: "Company context missing." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const dealType = searchParams.get("type");
    const status = searchParams.get("status");

    const query = { companyId: new mongoose.Types.ObjectId(companyId) };
    if (dealType) query.dealType = dealType.toUpperCase();
    if (status) query.status = status.toUpperCase();

    const deals = await CRMDeal.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: deals
    });
  } catch (error) {
    console.error("GET CRM Deals Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CRM deals." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ZERO CA ACCESS
    const isCA =
      decoded.role === "CA" ||
      decoded.role === "CA-Employee" ||
      decoded.role === "CA_STAFF" ||
      decoded.role === "CAStaff";

    if (isCA) {
      return NextResponse.json(
        { success: false, error: "Forbidden: CRM Deal pipeline is internal to SME operations." },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await request.json();

    const companyId = decoded.companyId || decoded.userId;
    const employeeId = decoded.role === "Employee" ? decoded.userId : body.employeeId || decoded.userId;

    const { customerName, customerEmail, customerPhone, dealType, title, amount, items, validUntil, notes } = body;

    if (!customerName || !title || !amount) {
      return NextResponse.json(
        { success: false, error: "Customer name, title, and total amount are required." },
        { status: 400 }
      );
    }

    // Lookup employee name if applicable
    let employeeName = "Staff";
    if (decoded.role === "Employee") {
      const emp = await Employee.findById(employeeId).select("name");
      if (emp) employeeName = emp.name;
    } else {
      const owner = await Owner.findById(companyId).select("name");
      if (owner) employeeName = owner.name;
    }

    const newDeal = new CRMDeal({
      companyId: new mongoose.Types.ObjectId(companyId),
      employeeId: new mongoose.Types.ObjectId(employeeId),
      employeeName,
      customerName: customerName.trim(),
      customerEmail: (customerEmail || "").trim(),
      customerPhone: (customerPhone || "").trim(),
      dealType: (dealType || "QUOTE").toUpperCase(),
      title: title.trim(),
      amount: Number(amount),
      status: "SENT",
      items: items && Array.isArray(items) ? items : [
        { name: title.trim(), quantity: 1, rate: Number(amount), amount: Number(amount) }
      ],
      validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      notes: notes || ""
    });

    await newDeal.save();

    return NextResponse.json(
      {
        success: true,
        data: newDeal,
        message: `${newDeal.dealType} generated and recorded successfully.`
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST CRM Deal Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create CRM deal." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Deal ID and new status are required." }, { status: 400 });
    }

    const companyId = decoded.companyId || decoded.userId;
    const updatedDeal = await CRMDeal.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), companyId: new mongoose.Types.ObjectId(companyId) },
      { $set: { status: status.toUpperCase() } },
      { new: true }
    );

    if (!updatedDeal) {
      return NextResponse.json({ success: false, error: "Deal not found or access denied." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedDeal,
      message: `Deal status updated to ${status}.`
    });
  } catch (error) {
    console.error("PATCH CRM Deal Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update deal status." },
      { status: 500 }
    );
  }
}
