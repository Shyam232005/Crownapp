import { NextResponse } from "next/server"
import Contact from "@/app/schema/contactform"
import { connectDB } from "../loginuser/route"

export async function POST(req) {
    await connectDB()
    const body = await req.json()
    console.log("Form Data Received:", body)
    const newcontact = await Contact.create(body)
    console.log('Data is created',newcontact)
    return NextResponse.json({ success: true, msg: "Form submitted successfully" },{status:200})
}