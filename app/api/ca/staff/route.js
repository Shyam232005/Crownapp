import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CAStaff from "@/models/CAStaff"; // Ensure this model exists

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA") {
      return NextResponse.json({ error: "Forbidden: CA Firm Owner access only" }, { status: 403 });
    }

    await connectDB();
    
    // Fetch all staff assigned to this CA Firm
    const staffMembers = await CAStaff.find({ caFirmId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: staffMembers }, { status: 200 });

  } catch (error) {
    console.error("GET CA Staff Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA") {
      return NextResponse.json({ error: "Forbidden: CA Firm Owner access only" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { name, email, role, clientsCount } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    // Check if staff email already exists
    const existingStaff = await CAStaff.findOne({ email });
    if (existingStaff) {
        return NextResponse.json({ error: "A staff member with this email already exists" }, { status: 400 });
    }

    // Create the new CA Staff member
    const newStaff = await CAStaff.create({
      caFirmId: decoded.userId,
      name,
      email,
      role: role || "Audit Assistant",
      clientsCount: clientsCount || 0,
      password: "password123", // In a real app, generate a secure temp password or email an invite link
    });

    // Remove password from response
    const staffResponse = newStaff.toObject();
    delete staffResponse.password;

    return NextResponse.json({ success: true, data: staffResponse }, { status: 201 });

  } catch (error) {
    console.error("POST CA Staff Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}