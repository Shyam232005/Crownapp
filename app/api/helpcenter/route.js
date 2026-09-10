import { NextResponse } from "next/server"
import Help from "@/app/schema/helpform"
import { connectDB } from "../loginuser/route"

export async function POST(req) {
    await connectDB()
    const body = await req.json()
    console.log("Form Data Received:", body)
    const newform = await Help.create(body)
    console.log('Form Data Created',newform)
    return NextResponse.json({ success: true, msg: "Form submitted successfully" }, { status: 200 })
}