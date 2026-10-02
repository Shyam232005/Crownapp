import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Owner from "@/models/Owner";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
    try {
        await connectDB();

        // 1. Browser cookies se logged-in user ki ID nikalna
        const userIdCookie = request.cookies.get("fineops_user_id");

        if (!userIdCookie || !userIdCookie.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Database mein Owner ko us ID se dhoondna
        // (.select use kar rahe hain taaki password ya baki heavy data na aaye, sirf zaroori details aayein)
        const owner = await Owner.findById(userIdCookie.value).select("inviteCode companyName name email");

        if (!owner) {
            return NextResponse.json({ error: "Owner not found" }, { status: 404 });
        }

        // 3. Frontend ko Invite Code bhej dena
        return NextResponse.json({
            inviteCode: owner.inviteCode,
            companyName: owner.companyName,
            name: owner.name,
            email: owner.email
        }, { status: 200 });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}