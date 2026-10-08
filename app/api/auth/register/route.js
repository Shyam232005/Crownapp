import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { 
      role, name, phoneNumber, email, password, 
      companyName, gstin, location, Category, 
      firmName, icaiNumber, inviteCode, planName, joinedViaCode 
    } = body;

    if (!name || !phoneNumber || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Security Directive: Strictly reject Super-Admin reserved credentials
    const adminEmail = (process.env.ADMIN_EMAIL || "shyamsangani23@gmail.com").toLowerCase().trim();
    const adminPhone = (process.env.ADMIN_PHONE || "9723386344").trim();
    if (email.toLowerCase().trim() === adminEmail || phoneNumber.trim() === adminPhone) {
      return NextResponse.json({ error: "Credentials reserved. Invalid entry." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = null;
    let companyId = null; // Unified ID for the transaction engine
    let successMessage = "";

    // 1. REGISTER OWNER
    if (role === "Owner") {
      const existingOwner = await Owner.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingOwner) return NextResponse.json({ error: "Owner already exists." }, { status: 400 });

      let rawPlan = planName ? planName.trim() : "Free Trial";
      let actualPlan = "Free Trial";
      if (rawPlan.includes("Manufacturing")) actualPlan = "Manufacturing & Growth";
      else if (rawPlan.includes("Enterprise")) actualPlan = "Enterprise Multi-Unit";
      else if (rawPlan.includes("Starter") || rawPlan.includes("MSME")) actualPlan = "MSME Starter";

      const now = new Date();
      // Default to strict 30-day trial from createdAt timestamp
      let calculatedEndDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      let subStatus = "trialing";

      if (actualPlan !== "Free Trial") {
        calculatedEndDate = new Date(now);
        calculatedEndDate.setFullYear(calculatedEndDate.getFullYear() + 1);
        subStatus = "active";
      }

      // Auto-generate unique inviteCode for the Owner
      const generatedCode = `BIZ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      newUser = new Owner({
        name, phoneNumber, email, password: hashedPassword,
        companyName, gstin, location, Category,
        inviteCode: generatedCode,
        subscriptionExpiry: calculatedEndDate,
        subscription: {
          planName: actualPlan,
          cycle: actualPlan !== "Free Trial" ? "annual" : "trial",
          status: subStatus,
          startDate: now,
          endDate: calculatedEndDate
        }
      });
      await newUser.save();
      companyId = newUser._id;
      successMessage = "Workspace created successfully!";
    }

    // 2. REGISTER EMPLOYEE (LINK TO OWNER VIA INVITE CODE)
    else if (role === "Employee") {
      const codeToQuery = inviteCode ? inviteCode.trim() : "";
      if (!codeToQuery) return NextResponse.json({ error: "Invalid Invite Code" }, { status: 400 });
      
      const owner = await Owner.findOne({ inviteCode: codeToQuery });
      if (!owner) return NextResponse.json({ error: "Invalid Invite Code" }, { status: 400 });

      const existingEmp = await Employee.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingEmp) return NextResponse.json({ error: "Employee already exists." }, { status: 400 });

      newUser = new Employee({
        name, phoneNumber, email, password: hashedPassword,
        companyId: owner._id,
        ownerId: owner._id
      });
      await newUser.save();

      if (!owner.employees) owner.employees = [];
      owner.employees.push(newUser._id);
      await owner.save();
      companyId = owner._id;
      successMessage = "Staff joined successfully!";
    }

    // 3. REGISTER CA FIRM
    else if (role === "CA") {
      const existingCA = await CA.findOne({ $or: [{ email }, { phoneNumber }, { icaiNumber }] });
      if (existingCA) return NextResponse.json({ error: "CA Firm already exists." }, { status: 400 });

      const codeToLink = joinedViaCode || inviteCode;
      if (!codeToLink) return NextResponse.json({ error: "Invite code is required to register CA." }, { status: 400 });

      newUser = new CA({
        name, phoneNumber, email, password: hashedPassword,
        firmName, icaiNumber, joinedViaCode: codeToLink 
      });
      await newUser.save();
      
      const owner = await Owner.findOne({ inviteCode: codeToLink });
      if (owner) {
         if (!owner.linkedCAs) owner.linkedCAs = [];
         if (!owner.linkedCaFirm) owner.linkedCaFirm = [];
         owner.linkedCAs.push(newUser._id);
         owner.linkedCaFirm.push(newUser._id);
         await owner.save();
         if (!newUser.clients) newUser.clients = [];
         newUser.clients.push(owner._id);
         await newUser.save();
      }
      companyId = newUser._id;
      successMessage = "CA Firm registered successfully!";
    }

    // 4. REGISTER CA-EMPLOYEE (Staff)
    else if (role === "CA-Employee") {
      if (!inviteCode) return NextResponse.json({ error: "Invite code is required." }, { status: 400 });
      
      const caFirm = await CA.findOne({ inviteCode });
      if (!caFirm) return NextResponse.json({ error: "Invalid Firm Invite Code." }, { status: 400 });

      const existingStaff = await CAStaff.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingStaff) return NextResponse.json({ error: "Staff already exists." }, { status: 400 });

      newUser = new CAStaff({
        name, phoneNumber, email, password: hashedPassword,
        caId: caFirm._id
      });
      await newUser.save();

      caFirm.staff.push(newUser._id);
      await caFirm.save();
      companyId = caFirm._id;
      successMessage = "Audit Staff joined successfully!";
    }

    else {
      return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });
    }

    // 5. Generate Secure Session Token (Auto-Login on Registration)
    const payload = {
      userId: newUser._id.toString(),
      role: role,
      companyId: (companyId || newUser._id).toString()
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'crown_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ 
      success: true, 
      message: "Account created." 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}