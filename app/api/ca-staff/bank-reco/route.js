import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";
import BankReco from "@/models/BankReco";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff =
      decoded.role === "CAStaff" ||
      decoded.role === "CA-Employee" ||
      decoded.role === "CA_STAFF" ||
      decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff && !decoded.isSuperAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || searchParams.get("companyId");

    await connectDB();

    const query = {};
    if (clientId) {
      const isObjectId = mongoose.isValidObjectId(clientId);
      query.$or = [
        { clientId: clientId.toString() },
        ...(isObjectId ? [{ companyId: new mongoose.Types.ObjectId(clientId) }] : [])
      ];
    }

    const recoData = await BankReco.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: recoData }, { status: 200 });
  } catch (error) {
    console.error("GET Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { companyId, clientId, desc, date, bankAmt, match, bookAmt, fileUrl, filename, status } = body;

    const targetId = companyId || clientId;
    if (!targetId || !desc || bankAmt === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const newRecoEntry = await BankReco.create({
      clientId: targetId.toString(),
      companyId: mongoose.isValidObjectId(targetId) ? new mongoose.Types.ObjectId(targetId) : null,
      caStaffId: mongoose.isValidObjectId(decoded.userId) ? new mongoose.Types.ObjectId(decoded.userId) : null,
      desc,
      date: date || new Date().toLocaleDateString("en-IN"),
      bankAmt: Number(bankAmt),
      match: match || false,
      bookAmt: bookAmt !== undefined && bookAmt !== null ? Number(bookAmt) : null,
      fileUrl: fileUrl || "",
      filename: filename || "",
      status: status || "PENDING"
    });

    return NextResponse.json({ success: true, data: newRecoEntry }, { status: 201 });
  } catch (error) {
    console.error("POST Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { id, status, match, bookAmt } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Item ID is required" }, { status: 400 });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (match !== undefined) updateFields.match = match;
    if (bookAmt !== undefined) updateFields.bookAmt = bookAmt;

    const updated = await BankReco.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated, message: "Status updated successfully." });
  } catch (error) {
    console.error("PATCH Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}