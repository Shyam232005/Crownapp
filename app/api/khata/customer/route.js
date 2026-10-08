import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Customer from "@/models/Customer";

export const dynamic = "force-dynamic";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    const companyId = decoded.companyId || decoded.userId;
    const customers = await Customer.find({
      companyId: new mongoose.Types.ObjectId(companyId),
    }).sort({ name: 1 });

    return NextResponse.json(
      { success: true, customers, data: customers },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("GET Customer Khata Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    const companyId = decoded.companyId || decoded.userId;
    const body = await request.json();
    const {
      name,
      phone,
      email,
      balance,
      openingBalance = 0,
      creditLimit = 0,
      address,
      billingAddress,
      gstin,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const initialBalance =
      balance !== undefined && balance !== null && balance !== ""
        ? Number(balance)
        : Number(openingBalance) || 0;

    const customerData = {
      companyId: new mongoose.Types.ObjectId(companyId),
      name: name.trim(),
      phone: phone ? phone.trim() : undefined,
      email: email ? email.trim().toLowerCase() : undefined,
      balance: isNaN(initialBalance) ? 0 : initialBalance,
      openingBalance: Number(openingBalance) || 0,
      creditLimit: Number(creditLimit) || 0,
      billingAddress: (billingAddress || address || "").trim(),
      address: (address || billingAddress || "").trim(),
      gstin: gstin ? gstin.trim().toUpperCase() : "",
    };

    // If phone or email is empty, omit from object so sparse unique index is not violated
    if (!customerData.phone) delete customerData.phone;
    if (!customerData.email) delete customerData.email;

    const newCustomer = await Customer.create(customerData);

    return NextResponse.json(
      {
        success: true,
        customer: newCustomer,
        data: newCustomer,
        message: "Customer added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Customer Khata Error:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Customer with this phone or email already exists." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: 500 }
    );
  }
}
