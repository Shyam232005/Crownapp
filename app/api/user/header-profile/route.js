import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import Employee from "@/models/Employee";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    // Default payload structure
    let userData = {
      name: "User",
      role: decoded.role,
      planName: "FineOps Pro", 
      daysLeft: 30,
      isTrialLocked: false,
      isSuperAdmin: Boolean(decoded.isSuperAdmin)
    };

    // 0. Super-Admin root bypass
    if (decoded.isSuperAdmin || decoded.role === "Admin") {
      userData = {
        name: "Super Admin",
        role: "Admin",
        planName: "Console Root",
        daysLeft: 999,
        isTrialLocked: false,
        isSuperAdmin: true,
        email: decoded.email || "shyamsangani23@gmail.com"
      };
      return NextResponse.json(userData, { status: 200 });
    }

    const today = new Date();

    // 1. Owner Profile & Accurate Trial Countdown
    if (decoded.role === "Owner") {
      const owner = await Owner.findById(decoded.userId);
      if (owner) {
        userData.name = owner.name;
        userData.email = owner.email;
        userData.companyName = owner.companyName;
        userData.planName = owner.subscription?.planName || "Free Trial";

        // Accurate expiry calculation
        let expiry = null;
        if (owner.subscriptionExpiry) {
          expiry = new Date(owner.subscriptionExpiry);
        } else if (owner.subscription?.endDate) {
          expiry = new Date(owner.subscription.endDate);
        } else if (owner.createdAt) {
          expiry = new Date(new Date(owner.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        if (expiry) {
          const diffMs = expiry.getTime() - today.getTime();
          const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          userData.daysLeft = daysLeft;
          userData.subscriptionExpiry = expiry.toISOString();
          userData.isTrialLocked = daysLeft <= 0;
        } else {
          userData.daysLeft = 30;
          userData.isTrialLocked = false;
        }
      }
    } 
    // 2. Employee Profile & Inherited Company Subscription
    else if (decoded.role === "Employee") {
      const emp = await Employee.findById(decoded.userId);
      if (emp) {
        userData.name = emp.name;
        userData.email = emp.email;

        if (emp.ownerId) {
          const owner = await Owner.findById(emp.ownerId);
          if (owner) {
            userData.companyName = owner.companyName;
            userData.planName = owner.subscription?.planName || "Free Trial";

            let expiry = null;
            if (owner.subscriptionExpiry) {
              expiry = new Date(owner.subscriptionExpiry);
            } else if (owner.subscription?.endDate) {
              expiry = new Date(owner.subscription.endDate);
            } else if (owner.createdAt) {
              expiry = new Date(new Date(owner.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
            }

            if (expiry) {
              const diffMs = expiry.getTime() - today.getTime();
              const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
              userData.daysLeft = daysLeft;
              userData.subscriptionExpiry = expiry.toISOString();
              userData.isTrialLocked = daysLeft <= 0;
            }
          }
        }
      }
    } 
    // 3. CA Firm Profile
    else if (decoded.role === "CA") {
      const ca = await CA.findById(decoded.userId);
      if (ca) {
        userData.name = ca.principalCa || ca.firmName || ca.name || "Principal CA";
        userData.email = ca.email;
        userData.planName = "Chartered Accountant Firm";
        userData.daysLeft = 365;
        userData.isTrialLocked = false;
      }
    } 
    // 4. CA Staff Profile
    else if (decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF") {
      const staff = await CAStaff.findById(decoded.userId);
      if (staff) {
        userData.name = staff.name;
        userData.email = staff.email;
        userData.planName = "Audit Staff";
        userData.daysLeft = 365;
        userData.isTrialLocked = false;
      }
    }

    return NextResponse.json(userData, { status: 200 });

  } catch (error) {
    console.error("GET Header Profile Error:", error);
    // If JWT is expired or invalid, return 401 so the UI redirects to login
    return NextResponse.json({ error: "Authentication Failed" }, { status: 401 });
  }
}