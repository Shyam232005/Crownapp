import { NextResponse } from "next/server";
import mongoose from "mongoose";
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
    await connectDB();

    const userIdCookie = request.cookies.get("fineops_user_id");
    const roleCookie = request.cookies.get("fineops_role");
    
    if (!userIdCookie || !roleCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = userIdCookie.value;
    const role = roleCookie.value;

    // 1. OWNER
    if (role === "Owner") {
      const owner = await Owner.findById(userId).select("name subscription");
      if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const endDate = new Date(owner.subscription.endDate);
      const currentDate = new Date();
      const timeDiff = endDate.getTime() - currentDate.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

      return NextResponse.json({ 
        name: owner.name, 
        role: "Owner",
        planName: owner.subscription.planName,
        daysLeft: daysLeft > 0 ? daysLeft : 0
      }, { status: 200 });
    } 
    
    // 2. EMPLOYEE (Staff)
    else if (role === "Employee") {
      const employee = await Employee.findById(userId).select("name");
      if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({ 
        name: employee.name, 
        role: "Employee" 
      }, { status: 200 });
    } 
    
    // 3. CA (Firm Owner)
    else if (role === "CA") {
      const ca = await CA.findById(userId).select("name");
      if (!ca) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({ 
        name: ca.name, 
        role: "CA" 
      }, { status: 200 });
    } 
    
    // 4. CA STAFF (Audit Team)
    else if (role === "CA-Employee" || role === "CA-Staff") {
      const caStaff = await CAStaff.findById(userId).select("name");
      if (!caStaff) return NextResponse.json({ error: "Not found" }, { status: 404 });

      return NextResponse.json({ 
        name: caStaff.name, 
        role: "CA-Employee" 
      }, { status: 200 });
    } 
    
    else {
      return NextResponse.json({ error: "Invalid role format" }, { status: 400 });
    }

  } catch (error) {
    console.error("Header API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}