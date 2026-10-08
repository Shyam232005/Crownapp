import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import AuditLog from "@/models/AuditLog";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ error: "Client ID required" }, { status: 400 });

    await connectDB();
    
    // Check the latest AuditLog for this client to see if the vault is unlocked or requested
    const latestLog = await AuditLog.findOne({ entityId: clientId }).sort({ createdAt: -1 });
    
    if (latestLog && latestLog.action === "VAULT_UNLOCKED") {
        return NextResponse.json({ status: "Unlocked" }, { status: 200 });
    }
    
    if (latestLog && latestLog.action === "ACCESS_REQUESTED") {
        return NextResponse.json({ status: "Requested" }, { status: 200 });
    }

    return NextResponse.json({ status: "Locked" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { clientId } = body;
    await connectDB();
    
    // Log the request so the Owner's CA-Hub sees it
    await AuditLog.create({
        entityId: clientId,
        entityName: "DataVault",
        action: "ACCESS_REQUESTED",
        performedBy: "CA_FIRM"
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}