import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import Employee from "@/models/Employee";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";

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
    await connectDB();

    // Default payload structure
    let userData = {
      name: "User",
      role: decoded.role,
      planName: "FineOps Pro", 
      daysLeft: 0
    };

    // Route logic based on the strict role assigned during login
    if (decoded.role === "Owner") {
      const owner = await Owner.findById(decoded.userId);
      if (owner) {
        userData.name = owner.name;
        // Mocking subscription logic - you can map these to real DB fields later
        userData.planName = owner.planName || "Pro Workspace";
        
        // Calculate days left if you store subscription expiry, defaulting to 365
        if (owner.subscriptionExpiry) {
            const expiry = new Date(owner.subscriptionExpiry);
            const today = new Date();
            const diffTime = Math.abs(expiry - today);
            userData.daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } else {
            userData.daysLeft = 365; 
        }
      }
    } 
    else if (decoded.role === "Employee") {
      const emp = await Employee.findById(decoded.userId);
      if (emp) userData.name = emp.name;
    } 
    else if (decoded.role === "CA") {
      const ca = await CA.findById(decoded.userId);
      if (ca) userData.name = ca.principalCa || ca.companyName || "Principal CA";
    } 
    else if (decoded.role === "CAStaff" || decoded.role === "CA-Employee") {
      const staff = await CAStaff.findById(decoded.userId);
      if (staff) userData.name = staff.name;
    }

    return NextResponse.json(userData, { status: 200 });

  } catch (error) {
    console.error("GET Header Profile Error:", error);
    // If JWT is expired or invalid, return 401 so the UI redirects to login
    return NextResponse.json({ error: "Authentication Failed" }, { status: 401 });
  }
}