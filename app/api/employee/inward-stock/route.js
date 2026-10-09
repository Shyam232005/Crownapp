import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Stock from "@/models/Stock";
import Inventory from "@/models/Inventory";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    const companyId = decoded.companyId || decoded.userId;
    const targetId = new mongoose.Types.ObjectId(companyId);

    const stocks = await Stock.find({ companyId: targetId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: stocks }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error("GET Inward Stock Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch stock entries" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    
    const { itemName, quantity, unit, supplierName, challanNumber, remarks, sku, category, invoiceNumber } = body;

    // Strict manual validation
    if (!itemName || String(itemName).trim() === "") {
      return NextResponse.json({ error: "Item name is required." }, { status: 400 });
    }

    const qtyNum = Number(quantity);
    if (quantity == null || isNaN(qtyNum) || qtyNum <= 0) {
      return NextResponse.json({ error: "Valid positive quantity is required." }, { status: 400 });
    }

    // Attach companyId from JWT strictly
    const companyId = decoded.companyId || decoded.userId;
    const targetId = new mongoose.Types.ObjectId(companyId);

    // Save to Stock collection
    const newStock = await Stock.create({
      companyId: targetId,
      createdBy: decoded.userId.toString(),
      employeeId: decoded.userId.toString(),
      type: "INWARD",
      itemName: String(itemName).trim(),
      sku: sku ? String(sku).trim() : "",
      category: category ? String(category).trim() : "General",
      quantity: qtyNum,
      unit: unit || "Pieces (Pcs)",
      supplierName: supplierName ? String(supplierName).trim() : "General Supplier",
      invoiceNumber: invoiceNumber ? String(invoiceNumber).trim() : "",
      challanNumber: challanNumber ? String(challanNumber).trim() : "",
      remarks: remarks ? String(remarks).trim() : "",
      date: new Date()
    });

    // Also mirror to Inventory for backward compatibility
    await Inventory.create({
      companyId: targetId,
      createdBy: decoded.userId.toString(),
      employeeId: decoded.userId.toString(),
      type: "INWARD",
      itemName: String(itemName).trim(),
      quantity: qtyNum,
      unit: unit || "Pieces (Pcs)",
      supplierName: supplierName ? String(supplierName).trim() : "General Supplier",
      challanNumber: challanNumber ? String(challanNumber).trim() : "",
      remarks: remarks ? String(remarks).trim() : "",
      date: new Date()
    }).catch(e => console.warn("Inventory mirror log:", e.message));

    return NextResponse.json({ 
      success: true, 
      message: "Inward stock logged successfully.",
      data: newStock 
    }, { status: 201 });

  } catch (error) {
    console.error("POST Inward Stock Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log inward stock" }, { status: 500 });
  }
}
