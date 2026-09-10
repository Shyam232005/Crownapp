import { NextResponse } from "next/server"
import CA from "@/app/schema/calogin"
import bcrypt from "bcryptjs"
import { connectDB } from "../loginuser/route"

export async function POST(req) {
    await connectDB()
    const { membershipNo,password } = await req.json();
    const calogin = await CA.findOne({ membershipNo })
    console.log(calogin)
    if (!calogin) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, calogin.password);
    if (!isMatch) {
        return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "Login successful", login }, { status: 200 });
}