// app/api/ca/clients/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Find all owners linked to this CA firm
    const owners = await Owner.find({ linkedCaFirm: payload.userId });

    const formattedClients = owners.map(owner => ({
      id: owner._id,
      name: owner.companyName,
      gstin: owner.gstin,
      staff: owner.assignedStaff || "Assigned Firm",
      status: owner.vaultStatus === "Unlocked" ? "Data Unlocked" : "Locked"
    }));

    return NextResponse.json({ success: true, data: formattedClients }, { status: 200 });
  } catch (error) {
    console.error("Fetch CA Clients Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 });
  }
}