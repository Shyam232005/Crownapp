import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("crown_session")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isSuperAdmin || decoded.role === "Admin") {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// PATCH: Modify subscriptionExpiry / extend trial
export async function PATCH(request) {
  try {
    const admin = await verifySuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access to admin console." }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { ownerId, phoneNumber, extendDays, customExpiryDate, planName } = body;

    if (!ownerId && !phoneNumber) {
      return NextResponse.json({ error: "Owner ID or Phone Number is required." }, { status: 400 });
    }

    const query = ownerId ? { _id: ownerId } : { phoneNumber };
    const owner = await Owner.findOne(query);

    if (!owner) {
      return NextResponse.json({ error: "Business Owner not found." }, { status: 404 });
    }

    const now = new Date();
    let currentExpiry = owner.subscriptionExpiry 
      ? new Date(owner.subscriptionExpiry) 
      : (owner.subscription?.endDate ? new Date(owner.subscription.endDate) : now);

    // If current expiry is already in the past, baseline from today
    if (currentExpiry.getTime() < now.getTime()) {
      currentExpiry = now;
    }

    let updatedExpiry = currentExpiry;

    if (customExpiryDate) {
      updatedExpiry = new Date(customExpiryDate);
    } else if (extendDays) {
      updatedExpiry = new Date(currentExpiry.getTime() + Number(extendDays) * 24 * 60 * 60 * 1000);
    }

    owner.subscriptionExpiry = updatedExpiry;
    if (!owner.subscription) {
      owner.subscription = {};
    }
    owner.subscription.endDate = updatedExpiry;
    owner.subscription.status = "active";

    if (planName) {
      owner.subscription.planName = planName;
    }

    await owner.save();

    const daysLeft = Math.max(0, Math.ceil((updatedExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    return NextResponse.json({
      success: true,
      message: `Subscription for "${owner.companyName}" successfully updated. New expiry: ${updatedExpiry.toISOString().split("T")[0]} (${daysLeft} days remaining).`,
      data: {
        id: owner._id.toString(),
        companyName: owner.companyName,
        phoneNumber: owner.phoneNumber,
        subscriptionExpiry: updatedExpiry.toISOString(),
        planName: owner.subscription.planName,
        daysLeft
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Subscription Patch Error:", error);
    return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
  }
}
