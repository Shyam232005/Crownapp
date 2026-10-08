import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA"; // Ensure this model exists

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
    
    // Fetch the CA Firm's data (excluding password)
    const caFirm = await CA.findById(decoded.userId).select("-password");

    if (!caFirm) {
      return NextResponse.json({ error: "CA Firm not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: caFirm }, { status: 200 });

  } catch (error) {
    console.error("GET CA Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
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

    // Map UI payload to DB fields
    const updatePayload = {
      companyName: body.firmName,
      frn: body.frn,
      gstin: body.gstin,
      principalCa: body.principalCa,
      address: body.address,
      supportPhone: body.supportPhone,
      exportFormat: body.exportFormat
    };

    // Remove empty fields to avoid overwriting existing data with undefined
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) delete updatePayload[key];
    });

    const updatedCA = await CA.findByIdAndUpdate(
      decoded.userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedCA) {
      return NextResponse.json({ error: "Failed to update firm settings" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedCA }, { status: 200 });

  } catch (error) {
    console.error("PATCH CA Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}