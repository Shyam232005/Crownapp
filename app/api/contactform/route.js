import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "../loginuser/route"

export async function POST(req) {
    await connectDB()
    const body = await req.json()
    console.log("Form Data Received:", body)
    return NextResponse.json({ success: true, msg: "Form submitted successfully" },{status:200})
}