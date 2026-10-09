import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import Stock from "@/models/Stock";
import Inventory from "@/models/Inventory";

export const dynamic = "force-dynamic";

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
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    await connectDB();
    const companyId = decoded.companyId || decoded.userId;
    const targetCompanyId = new mongoose.Types.ObjectId(companyId);

    // Fetch distinct suppliers/vendors recorded across Transactions, Stock, and Inventory
    const [txVendors, stockSuppliers, invSuppliers] = await Promise.all([
      Transaction.distinct("metadata.vendorName", {
        companyId: targetCompanyId,
        type: { $in: ["PURCHASE", "EXPENSE", "Vendor Payment"] }
      }).catch(() => []),
      Stock.distinct("supplierName", { companyId: targetCompanyId }).catch(() => []),
      Inventory.distinct("supplierName", { companyId: targetCompanyId }).catch(() => [])
    ]);

    const set = new Set();
    [...txVendors, ...stockSuppliers, ...invSuppliers].forEach((s) => {
      if (s && typeof s === "string") {
        const trimmed = s.trim();
        if (trimmed && trimmed.toLowerCase() !== "general" && trimmed.toLowerCase() !== "general supplier") {
          set.add(trimmed);
        }
      }
    });

    // Curated default company suppliers for seamless dropdown selection
    const defaultSuppliers = ["General Supplier", "Local Market Vendor", "Apex Industrial Supplies", "National Wholesale Corp"];
    defaultSuppliers.forEach((s) => set.add(s));

    const suppliersList = Array.from(set).map((name) => ({
      name,
      _id: name
    })).sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      suppliers: suppliersList,
      data: suppliersList
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (error) {
    console.error("GET Suppliers Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch suppliers" }, { status: 500 });
  }
}
