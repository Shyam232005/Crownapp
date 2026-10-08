import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
    try {
        await connectDB();

        // 1. Authenticate session via crown_session JWT cookie
        const cookieStore = await cookies();
        const token = cookieStore.get("crown_session")?.value;

        if (!token) {
            console.warn("Owner Profile API: Missing crown_session cookie.");
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtErr) {
            console.error("Owner Profile API: JWT verification failed:", jwtErr.message);
            return NextResponse.json({ success: false, error: "Invalid session token" }, { status: 401 });
        }

        const ownerId = decoded.userId || decoded.companyId;
        if (!ownerId) {
            return NextResponse.json({ success: false, error: "User ID missing from session" }, { status: 401 });
        }

        // 2. Retrieve Owner from MongoDB
        let owner = await Owner.findById(ownerId).select("inviteCode companyName name email phoneNumber");

        if (!owner) {
            // Also try finding by companyId if this was an owner token
            if (decoded.companyId) {
                owner = await Owner.findById(decoded.companyId).select("inviteCode companyName name email phoneNumber");
            }
        }

        if (!owner) {
            console.warn(`Owner Profile API: Owner not found for ID: ${ownerId}`);
            return NextResponse.json({ success: false, error: "Owner profile not found" }, { status: 404 });
        }

        // 3. Fallback: If document lacks an inviteCode, generate & persist one on the fly
        if (!owner.inviteCode) {
            console.log(`Generating missing inviteCode for Owner: ${owner._id}`);
            const rawString = `${owner.companyName || 'BIZ'}-${owner.phoneNumber || '000'}-${Date.now()}-${Math.random()}`;
            const hash = crypto.createHash("md5").update(rawString).digest("hex").substring(0, 6).toUpperCase();
            owner.inviteCode = `BIZ-${hash}`;
            await owner.save();
            console.log(`Persisted new inviteCode: ${owner.inviteCode}`);
        }

        // 4. Return safe profile and inviteCode
        return NextResponse.json({
            success: true,
            inviteCode: owner.inviteCode,
            companyName: owner.companyName,
            name: owner.name,
            email: owner.email
        }, { status: 200 });

    } catch (error) {
        console.error("Owner Profile Fetch Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}