import { NextResponse } from "next/server";
import Invoices from "@/app/schema/invoices";
import { connectDB } from "../loginuser/route";

export async function POST(req) {
    try {
        await connectDB()
        const body = await req.json()
        console.log(body)
        const selfin = await Invoices.create(body)
        if (!selfin) {
            return NextResponse.json({ success: false }, { status: 400 })
        }
        console.log(selfin);
        return NextResponse.json({ success: true, msg: "Created selfinvoice" }, { status: 200 });
    } catch (error) {
        console.log("Manual Entry Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
