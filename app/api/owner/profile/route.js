import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Owner from "@/models/Owner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
    try {
        await connectDB();

        // 1. Extract userId from crown_session JWT or fineops_user_id cookie
        let userId = request.cookies.get("fineops_user_id")?.value;
        const sessionToken = request.cookies.get("crown_session")?.value;

        if (!userId && sessionToken) {
            try {
                const jwt = await import("jsonwebtoken");
                const decoded = jwt.default.verify(sessionToken, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (e) {
                // Ignore token error, check userId below
            }
        }

        if (!userId) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        // 2. Find Owner by userId
        let owner = await Owner.findById(userId).select("inviteCode companyName name email");

        if (!owner) {
            return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });
        }

        if (!owner.inviteCode) {
            const crypto = await import("crypto");
            owner.inviteCode = `BIZ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
            await owner.save();
        }

        // 3. Return Owner Profile and inviteCode
        return NextResponse.json({
            success: true,
            inviteCode: owner.inviteCode,
            companyName: owner.companyName,
            name: owner.name,
            email: owner.email
        }, { status: 200 });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}