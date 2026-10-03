// app/api/submissions/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await request.json();
    
    if (!body.status || !["Approved", "Rejected"].includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      { $set: { status: body.status } },
      { new: true }
    );

    if (!updatedSubmission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedSubmission }, { status: 200 });
  } catch (error) {
    console.error("Update Submission Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update submission" }, { status: 500 });
  }
}