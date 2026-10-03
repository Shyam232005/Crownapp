import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Inventory from "@/models/Inventory";

export async function GET(request) {
  try {
    await connectDB();
    const entries = await Inventory.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: entries }, { status: 200 });
  } catch (error) {
    console.error("GET Inventory Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newEntry = await Inventory.create({
      employeeId: body.employeeId || "emp-temp-123",
      itemName: body.itemName,
      quantity: Number(body.quantity),
      unit: body.unit,
      supplierName: body.supplierName,
      challanNumber: body.challanNumber,
      remarks: body.remarks
    });

    return NextResponse.json({ success: true, data: newEntry }, { status: 201 });
  } catch (error) {
    console.error("POST Inventory Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create inventory entry" }, { status: 500 });
  }
}