import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { inviteCode } = await request.json();

    if (!inviteCode) return NextResponse.json({ error: "Invite code is required" }, { status: 400 });

    // Look up the CA Firm by their unique invite code (Assuming you added an inviteCode field to the CA model)
    // If you don't have an inviteCode field yet, we can match by CA Firm Name or a generic code for MVP.
    const caFirm = await CA.findOne({ 
      $or: [ { inviteCode: inviteCode }, { _id: inviteCode.length === 24 ? inviteCode : null } ]
    });

    if (!caFirm) {
      return NextResponse.json({ error: "Invalid invite code or CA not found" }, { status: 404 });
    }

    // Add this Owner's Company ID to the CA's client list
    if (!caFirm.clients.includes(decoded.companyId)) {
      caFirm.clients.push(decoded.companyId);
      await caFirm.save();
    }

    return NextResponse.json({ success: true, firmName: caFirm.companyName }, { status: 200 });
  } catch (error) {
    console.error("Link CA Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}