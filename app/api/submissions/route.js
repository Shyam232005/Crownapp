import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query based on status if provided (e.g., ?status=Pending)
    const query = status ? { status } : {};

    // Fetch submissions, newest first
    const submissions = await Submission.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: submissions }, { status: 200 });
  } catch (error) {
    console.error("GET Submissions Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newSubmission = await Submission.create({
      type: body.type,
      amount: Number(body.amount),
      partyName: body.partyName,
      paymentMode: body.paymentMode,
      billNumber: body.billNumber,
      billDate: body.billDate,
      gstin: body.gstin,
      description: body.description,
      employeeId: body.employeeId,
      status: "Pending"
    });

    return NextResponse.json({ success: true, data: newSubmission }, { status: 201 });
  } catch (error) {
    console.error("POST Submission Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create submission" },
      { status: 500 }
    );
  }
}