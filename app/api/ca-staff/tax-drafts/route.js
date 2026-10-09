import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CAStaff from "@/models/CAStaff";
import TaxDraft from "@/models/TaxDraft";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    
    let caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    let query = {};

    if (isStaff) {
      let assignedIds = decoded.assignedCompanies || [];
      if (!assignedIds.length) {
        const staffMember = await CAStaff.findById(decoded.userId).lean();
        if (staffMember?.caFirmId) caFirmId = staffMember.caFirmId;
        assignedIds = (staffMember?.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember?.assignedClients || [])).map(id => id.toString());
      }

      if (!assignedIds || assignedIds.length === 0) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }
      query = { caFirmId, clientId: { $in: assignedIds } };
    } else {
      query = { caFirmId };
    }

    const drafts = await TaxDraft.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: drafts }, { status: 200 });

  } catch (error) {
    console.error("GET Tax Drafts Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { clientId, clientName, month, outputTax, itc, liability } = body;

    if (!clientId || outputTax === undefined || itc === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    let caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (staffMember?.caFirmId) caFirmId = staffMember.caFirmId;
      const assignedIds = (staffMember?.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember?.assignedClients || [])).map(id => id.toString());
      if (!assignedIds.includes(clientId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
      }
    }

    const newDraft = await TaxDraft.create({
      caFirmId,
      companyId: clientId,
      clientId,
      clientName,
      month,
      outputTax,
      itc,
      liability,
      status: "Draft",
      createdBy: decoded.userId
    });

    return NextResponse.json({ success: true, data: newDraft }, { status: 201 });

  } catch (error) {
    console.error("POST Tax Draft Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id, status } = await request.json();

    const updatedDraft = await TaxDraft.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedDraft }, { status: 200 });

  } catch (error) {
    console.error("PATCH Tax Draft Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}