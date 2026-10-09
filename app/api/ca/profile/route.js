import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    let userId = null;
    let role = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
        role = (decoded.normalizedRole || decoded.role || "").toUpperCase();
      } catch (e) {
        // Token invalid
      }
    }

    if (!userId) {
      const userIdCookie = request.cookies.get("fineops_user_id");
      const roleCookie = request.cookies.get("fineops_role");
      if (userIdCookie && roleCookie) {
        userId = userIdCookie.value;
        role = roleCookie.value.toUpperCase();
      }
    }
    
    if (!userId || !role) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Security Check: Make sure only a Firm Admin (CA) or Staff is accessing this
    if (role !== "CA" && role !== "CA_STAFF" && role !== "CA-EMPLOYEE") {
      return NextResponse.json({ success: false, error: "Access denied. Not a CA Firm user." }, { status: 403 });
    }

    // Fetch CA details from Database
    const caProfile = await CA.findById(userId).select("inviteCode caInviteCode staffInviteCode firmName companyName");
    
    if (!caProfile) {
      return NextResponse.json({ success: false, error: "CA Profile not found" }, { status: 404 });
    }

    // Send the invite codes and firm name
    return NextResponse.json({ 
      success: true,
      inviteCode: caProfile.caInviteCode || caProfile.inviteCode,
      caInviteCode: caProfile.caInviteCode || caProfile.inviteCode,
      staffInviteCode: caProfile.staffInviteCode,
      firmName: caProfile.firmName || caProfile.companyName 
    }, { status: 200 });

  } catch (error) {
    console.error("CA Profile API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}