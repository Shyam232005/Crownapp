import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Login from "@/app/schema/userlogin"
import bcrypt from "bcryptjs"

let isConnected = false

export async function connectDB() {
    if (isConnected) return
    await mongoose.connect(process.env.CONNECTION_STRING)
    isConnected = true
}


export async function POST(req) {
    await connectDB()
    const { emailOrPhone, password } = await req.json();
    const login = await Login.findOne({ emailOrPhone })
    console.log(login)
    if (!login) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, login.password);
    if (!isMatch) {
        return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: "Login successful", login }, { status: 200 });
}