import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CAStaff from "@/models/CAStaff"; // Ensure this model exists

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

import bcrypt from "bcryptjs";
import CA from "@/models/CA";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    if (!isCA) {
      return NextResponse.json({ success: false, error: "Forbidden: CA Firm Owner access only" }, { status: 403 });
    }

    await connectDB();
    
    const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    // Fetch all staff assigned to this CA Firm
    const staffMembers = await CAStaff.find({ 
      $or: [
        { caFirmId: new mongoose.Types.ObjectId(caFirmId) },
        { caId: new mongoose.Types.ObjectId(caFirmId) }
      ]
    })
    .populate({
      path: 'assignedCompanies',
      select: 'name companyName gstin'
    })
    .sort({ createdAt: -1 });

    const formattedStaff = staffMembers.map(s => {
      const staffObj = s.toObject();
      staffObj.clientsCount = staffObj.assignedCompanies?.length || staffObj.assignedClients?.length || 0;
      delete staffObj.password;
      return staffObj;
    });

    return NextResponse.json({ success: true, data: formattedStaff }, { status: 200 });

  } catch (error) {
    console.error("GET CA Staff Error:", error);
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
    if (!isCA) {
      return NextResponse.json({ success: false, error: "Forbidden: CA Firm Owner access only" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { name, email, phoneNumber, role, assignedCompanies } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and email are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Check if staff email already exists
    const existingStaff = await CAStaff.findOne({ email: cleanEmail });
    if (existingStaff) {
      return NextResponse.json({ success: false, error: "A staff member with this email already exists" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = body.password || "StaffPass@123";
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    const phone = phoneNumber || `91${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const validCompanyIds = (Array.isArray(assignedCompanies) ? assignedCompanies : [])
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    // Create the new CA Staff member
    const newStaff = await CAStaff.create({
      caFirmId: new mongoose.Types.ObjectId(caFirmId),
      caId: new mongoose.Types.ObjectId(caFirmId),
      name: name.trim(),
      email: cleanEmail,
      phoneNumber: phone,
      role: "CA_STAFF",
      roleInFirm: role || "Junior Auditor",
      assignedCompanies: validCompanyIds,
      assignedClients: validCompanyIds,
      password: hashedPassword,
    });

    await CA.findByIdAndUpdate(caFirmId, {
      $addToSet: { staff: newStaff._id }
    });

    const staffResponse = newStaff.toObject();
    staffResponse.clientsCount = validCompanyIds.length;
    delete staffResponse.password;

    return NextResponse.json({ success: true, data: staffResponse, message: "Staff member added successfully." }, { status: 201 });

  } catch (error) {
    console.error("POST CA Staff Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}