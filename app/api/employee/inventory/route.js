import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Inventory from "@/models/Inventory"; // Assuming an Inventory model exists

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";

    let query = {
      companyId: decoded.companyId,
      type: "INWARD"
    };

    // If 'all' is not true, we only fetch today's entries for this specific employee
    if (!fetchAll) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        query.createdBy = decoded.userId;
        query.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    const recentEntries = await Inventory.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: recentEntries }, { status: 200 });

  } catch (error) {
    console.error("GET Inventory Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    
    const { itemName, quantity, unit, supplierName, challanNumber, remarks } = body;

    if (!itemName || !quantity || !supplierName) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newStockEntry = await Inventory.create({
        companyId: decoded.companyId,
        createdBy: decoded.userId,
        type: "INWARD",
        itemName,
        quantity,
        unit,
        supplierName,
        challanNumber,
        remarks,
        date: new Date()
    });

    return NextResponse.json({ success: true, data: newStockEntry }, { status: 201 });

  } catch (error) {
    console.error("POST Inventory Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}