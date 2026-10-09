import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Owner from "@/models/Owner";

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

    const cleanCode = inviteCode.trim().toUpperCase();

    // Look up CA firm by inviteCode (supports CA-XXXXXX or direct code)
    const caFirm = await CA.findOne({ 
      $or: [ 
        { caInviteCode: cleanCode },
        { staffInviteCode: cleanCode },
        { inviteCode: cleanCode }, 
        { inviteCode: `CA-${cleanCode}` },
        { _id: cleanCode.length === 24 ? cleanCode : null } 
      ]
    });

    if (!caFirm) {
      return NextResponse.json({ error: "Invalid CA Invite Code. Please check with your CA firm." }, { status: 404 });
    }

    // M:N Handshake Mapping:
    // 1. Add SME to CA's client portfolio
    await CA.findByIdAndUpdate(caFirm._id, {
      $addToSet: {
        clientCompanies: decoded.companyId,
        clients: decoded.companyId
      }
    });

    // 2. Add CA to SME Owner's linked CA network
    await Owner.findByIdAndUpdate(decoded.companyId, {
      $set: {
        linkedCA: caFirm._id,
        dataSharingStatus: "CONNECTED"
      },
      $addToSet: { 
        linkedCaFirm: caFirm._id,
        linkedCAs: caFirm._id
      }
    });

    const firmDisplayName = caFirm.firmName || caFirm.name;

    return NextResponse.json({ 
      success: true, 
      firmName: firmDisplayName,
      message: `Successfully linked with ${firmDisplayName}!` 
    }, { status: 200 });

  } catch (error) {
    console.error("Link CA Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}