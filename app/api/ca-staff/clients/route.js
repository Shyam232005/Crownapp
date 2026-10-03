// app/api/ca-staff/clients/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";
import Submission from "@/models/Submission";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Find owners assigned to this staff member or firm
    const owners = await Owner.find({ 
      $or: [
        { assignedStaffId: payload.userId },
        { linkedCaFirm: payload.firmId || payload.userId }
      ]
    });

    const assignedClients = await Promise.all(owners.map(async (owner) => {
      // Count pending submissions for this client
      const pendingVouchers = await Submission.countDocuments({ 
        employeeId: { $regex: owner._id.toString() }, 
        status: "Pending" 
      });

      return {
        id: owner._id,
        name: owner.companyName || owner.name,
        gstin: owner.gstin || "N/A",
        auditStatus: pendingVouchers === 0 ? "Clean (Verified)" : "In Progress",
        pendingVouchers
      };
    }));

    return NextResponse.json({ success: true, data: assignedClients }, { status: 200 });
  } catch (error) {
    console.error("Fetch Staff Clients Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch assigned clients" }, { status: 500 });
  }
}