import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function POST(req) {
    try {
        await connectDB();
        const body = await req.json();

        // Basic validation
        if (!body.type || !body.description || !body.employeeId) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Database mein entry create karo
        const newSubmission = await Submission.create({
            employeeId: body.employeeId,
            type: body.type,
            partyName: body.partyName || "",
            amount: body.amount || 0,
            paymentMode: body.paymentMode || "",

            // Nayi fields
            billNumber: body.billNumber || "",
            billDate: body.billDate || "",
            gstin: body.gstin || "",

            description: body.description,
            status: "Pending"
        });

        console.log("New Submission Saved:", newSubmission._id);

        return NextResponse.json({ success: true, data: newSubmission }, { status: 201 });

    } catch (error) {
        console.error("Submission DB Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save submission." },
            { status: 500 }
        );
    }
}

// GET route (Owner aur Employee ko list dikhane ke liye)
export async function GET(req) {
    try {
        await connectDB();

        // Latest submissions pehle dikhane ke liye sort by createdAt descending (-1)
        const submissions = await Submission.find({}).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: submissions }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to fetch data." }, { status: 500 });
    }
}

// File: app/api/submissions/route.js
export async function PATCH(req) {
    try {
        await connectDB();
        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
        }

        const updated = await Submission.findByIdAndUpdate(id, { status }, { new: true });

        return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}