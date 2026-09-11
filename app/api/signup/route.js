import { NextResponse } from "next/server"
import { connectDB } from "../loginuser/route"
import bcrypt from "bcryptjs"
import Login from "@/app/schema/userlogin"

export async function POST(req) {
    await connectDB()
    const body = await req.json()
    console.log("Form Data Received:", body)
    if (!body) {
        return NextResponse.json({ success: false, msg: "No data received" }, { status: 400 })
    }
    const hashpass = await bcrypt.hash(body.password, 10)
    console.log(hashpass)
    if (!hashpass) {
        return NextResponse.json({ success: false, msg: "Password hashing failed" }, { status: 500 })
    }
    const newpurchased = await Login.create({
        fullname: body.fullname,
        email: body.email,
        phone: body.phone,
        password: hashpass,
        companyName: body.companyName,
        companyRole: body.companyRole,
        gstin: body.gstin,
        caFirmName: body.caFirmName,
        icaiNumber: body.icaiNumber,
        cityState: body.cityState,
        referredBy: body.referredBy,
        agreeTerms: body.agreeTerms,
    })
    if (!newpurchased) {
        return NextResponse.json({ success: false, msg: "User not created due to ineternale server error" }, { status: 500 })
    }
    return NextResponse.json({ success: true, msg: "Form submitted successfully" }, { status: 200 })
}