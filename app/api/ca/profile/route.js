import { NextResponse } from "next/server";
import mongoose from "mongoose";
import CA from "@/models/CA";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    await connectDB();

    // 1. Get cookies to identify the logged-in user
    const userIdCookie = request.cookies.get("fineops_user_id");
    const roleCookie = request.cookies.get("fineops_role");
    
    if (!userIdCookie || !roleCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userIdCookie.value;
    const role = roleCookie.value;

    // 2. Security Check: Make sure only a Firm Admin (CA) is accessing this
    if (role !== "CA") {
         return NextResponse.json({ error: "Access denied. Not a CA Firm Admin." }, { status: 403 });
    }

    // 3. Fetch CA details from Database
    const caProfile = await CA.findById(userId).select("inviteCode firmName");
    
    if (!caProfile) {
        return NextResponse.json({ error: "CA Profile not found" }, { status: 404 });
    }

    // 4. Send the invite code to the frontend sidebar
    return NextResponse.json({ 
        inviteCode: caProfile.inviteCode,
        firmName: caProfile.firmName 
    }, { status: 200 });

  } catch (error) {
    console.error("CA Profile API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}