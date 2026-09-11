import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import CA from "@/app/schema/calogin"
import { connectDB } from "../loginuser/route"

export async function POST(req) {
    await connectDB()
    const body = await req.json()
    console.log("Form Data Received:", body)
    if (!body) {
        return NextResponse.json({ success: false, msg: "Data is not recevied" }, { status: 400 })
    }
    const hashpass = await bcrypt.hash(body.password, 10)
    console.log(hashpass)
    if (!hashpass) {
        return NextResponse.json({ success: false, msg: "Data is not recevied" }, { status: 400 })
    }
    const registerca = await CA.create({
        caName: body.caName,
        icaiNumber: body.icaiNumber,
        firmName: body.firmName,
        password: hashpass,
        city: body.city,
        email: body.email,
        phone: body.phone,
        clientCount: body.clientCount,
        referredBy: body.referredBy
    })
    console.log(registerca)
    if (!registerca) {
        return NextResponse.json({ success: false, msg: "Data is not recevied" }, { status: 400 })
    }
    return NextResponse.json({ success: true, msg: "Form submitted successfully" }, { status: 200 })
}