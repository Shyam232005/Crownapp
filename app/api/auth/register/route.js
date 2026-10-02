import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Owner from "@/models/Owner";
import Employee from "@/models/Employee";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { 
      role, name, phoneNumber, email, password, 
      companyName, gstin, location, Category, 
      firmName, icaiNumber, inviteCode, planName, joinedViaCode 
    } = body;

    // Basic Validation
    if (!name || !phoneNumber || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ==========================================
    // 1. REGISTER OWNER
    // ==========================================
    if (role === "Owner") {
      const existingOwner = await Owner.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingOwner) return NextResponse.json({ error: "Owner already exists." }, { status: 400 });

      let rawPlan = planName ? planName.trim() : "Free Trial";
      let actualPlan = "Free Trial";
      if (rawPlan.includes("Manufacturing")) actualPlan = "Manufacturing & Growth";
      else if (rawPlan.includes("Enterprise")) actualPlan = "Enterprise Multi-Unit";
      else if (rawPlan.includes("Starter") || rawPlan.includes("MSME")) actualPlan = "MSME Starter";

      let calculatedEndDate = new Date();
      let subStatus = "active";

      if (actualPlan !== "Free Trial") {
        calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1);
      } else {
        calculatedEndDate.setDate(calculatedEndDate.getDate() + 14);
        subStatus = "trialing";
      }

      const newOwner = new Owner({
        name, phoneNumber, email, password: hashedPassword,
        companyName, gstin, location, Category,
        subscription: {
          planName: actualPlan,
          cycle: actualPlan !== "Free Trial" ? "annual" : "trial",
          status: subStatus,
          startDate: new Date(),
          endDate: calculatedEndDate
        }
      });
      await newOwner.save();
      
      // ✅ Must return response
      return NextResponse.json({ message: "Workspace created successfully!" }, { status: 201 });
    }

    // ==========================================
    // 2. REGISTER EMPLOYEE
    // ==========================================
    else if (role === "Employee") {
      if (!inviteCode) return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
      
      const owner = await Owner.findOne({ inviteCode });
      if (!owner) return NextResponse.json({ error: "Invalid Company Invite Code." }, { status: 400 });

      const existingEmp = await Employee.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingEmp) return NextResponse.json({ error: "Employee already exists." }, { status: 400 });

      const newEmployee = new Employee({
        name, phoneNumber, email, password: hashedPassword,
        ownerId: owner._id
      });
      await newEmployee.save();

      owner.employees.push(newEmployee._id);
      await owner.save();

      // ✅ Must return response
      return NextResponse.json({ message: "Staff joined successfully!" }, { status: 201 });
    }

    // ==========================================
    // 3. REGISTER CA FIRM
    // ==========================================
    else if (role === "CA") {
      const existingCA = await CA.findOne({ $or: [{ email }, { phoneNumber }, { icaiNumber }] });
      if (existingCA) return NextResponse.json({ error: "CA Firm already exists." }, { status: 400 });

      const codeToLink = joinedViaCode || inviteCode;
      if (!codeToLink) return NextResponse.json({ error: "Invite code is required to register CA." }, { status: 400 });

      const newCA = new CA({
        name, phoneNumber, email, password: hashedPassword,
        firmName, icaiNumber, joinedViaCode: codeToLink 
      });
      await newCA.save();
      
      const owner = await Owner.findOne({ inviteCode: codeToLink });
      if(owner) {
         owner.linkedCAs.push(newCA._id);
         await owner.save();
         newCA.clients.push(owner._id);
         await newCA.save();
      }
      
      // ✅ Must return response
      return NextResponse.json({ message: "CA Firm registered successfully!" }, { status: 201 });
    }

    // ==========================================
    // 4. REGISTER CA-EMPLOYEE (Staff)
    // ==========================================
    else if (role === "CA-Employee") {
      if (!inviteCode) return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
      
      const caFirm = await CA.findOne({ inviteCode });
      if (!caFirm) return NextResponse.json({ error: "Invalid Firm Invite Code." }, { status: 400 });

      const existingStaff = await CAStaff.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingStaff) return NextResponse.json({ error: "Staff already exists." }, { status: 400 });

      const newCAStaff = new CAStaff({
        name, phoneNumber, email, password: hashedPassword,
        caId: caFirm._id
      });
      await newCAStaff.save();

      caFirm.staff.push(newCAStaff._id);
      await caFirm.save();

      // ✅ Must return response
      return NextResponse.json({ message: "Audit Staff joined successfully!" }, { status: 201 });
    }

    // ==========================================
    // ✨ FIX: 5. CATCH-ALL FALLBACK
    // ==========================================
    else {
      // Agar role kuch ajeeb aaya (match nahi kiya), tab API undefined dene ke bajay 400 error degi.
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

  } catch (error) {
    console.error("Registration Error:", error);
    // Yeh catch block internal server errors properly return karega
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}