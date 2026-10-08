import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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

    console.log("Registration attempt:", { role, email, phoneNumber });

    if (!name || !phoneNumber || !email || !password || !role) {
      return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    // Security Directive: Strictly reject Super-Admin reserved credentials
    const adminEmail = (process.env.ADMIN_EMAIL || "shyamsangani23@gmail.com").toLowerCase().trim();
    const adminPhone = (process.env.ADMIN_PHONE || "9723386344").trim();
    if (email.toLowerCase().trim() === adminEmail || phoneNumber.trim() === adminPhone) {
      return NextResponse.json({ success: false, error: "Credentials reserved. Invalid entry." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let newUser = null;
    let companyId = null; // Unified ID for the transaction engine
    let successMessage = "";

    // 1. REGISTER OWNER
    if (role === "Owner") {
      const existingOwner = await Owner.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingOwner) return NextResponse.json({ success: false, error: "Owner already exists." }, { status: 400 });

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

      // Generate a unique staff invite code for this business owner
      const rawString = `${companyName}-${phoneNumber}-${Date.now()}-${Math.random()}`;
      const hash = crypto.createHash("md5").update(rawString).digest("hex").substring(0, 6).toUpperCase();
      const generatedInviteCode = `BIZ-${hash}`;

      newUser = new Owner({
        name, phoneNumber, email, password: hashedPassword,
        companyName, gstin, location, Category,
        inviteCode: generatedInviteCode,
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
      console.log("Owner created with inviteCode:", generatedInviteCode);
    }

    // 2. REGISTER EMPLOYEE
    else if (role === "Employee") {
      if (!inviteCode) return NextResponse.json({ success: false, error: "Invite code is required." }, { status: 400 });
      
      const owner = await Owner.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
      if (!owner) return NextResponse.json({ success: false, error: "Invalid Company Invite Code." }, { status: 400 });

      const existingEmp = await Employee.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingEmp) return NextResponse.json({ success: false, error: "Employee already exists." }, { status: 400 });

      newUser = new Employee({
        name, phoneNumber, email, password: hashedPassword,
        ownerId: owner._id
      });
      await newUser.save();

      owner.employees.push(newUser._id);
      await owner.save();
      companyId = owner._id;
      successMessage = "Staff joined successfully!";
    }

    // 3. REGISTER CA FIRM
    else if (role === "CA") {
      const existingCA = await CA.findOne({ $or: [{ email }, { phoneNumber }, { icaiNumber }] });
      if (existingCA) return NextResponse.json({ success: false, error: "CA Firm already exists." }, { status: 400 });

      const codeToLink = joinedViaCode || inviteCode;
      if (!codeToLink) return NextResponse.json({ success: false, error: "Invite code is required to register CA." }, { status: 400 });

      // Generate a unique staff invite code for this CA firm
      const rawString = `${firmName}-${icaiNumber}-${Date.now()}-${Math.random()}`;
      const hash = crypto.createHash("md5").update(rawString).digest("hex").substring(0, 6).toUpperCase();
      const generatedCaCode = `CA-${hash}`;

      newUser = new CA({
        name, phoneNumber, email, password: hashedPassword,
        firmName, icaiNumber, 
        joinedViaCode: codeToLink.trim().toUpperCase(),
        inviteCode: generatedCaCode
      });
      await newUser.save();
      
      const owner = await Owner.findOne({ inviteCode: codeToLink.trim().toUpperCase() });
      if (owner) {
         owner.linkedCAs = owner.linkedCAs || [];
         owner.linkedCAs.push(newUser._id);
         await owner.save();
         newUser.clients.push(owner._id);
         await newUser.save();
      }
      companyId = newUser._id;
      successMessage = "CA Firm registered successfully!";
      console.log("CA Firm created with inviteCode:", generatedCaCode);
    }

    // 4. REGISTER CA-EMPLOYEE (Staff)
    else if (role === "CA-Employee") {
      if (!inviteCode) return NextResponse.json({ success: false, error: "Invite code is required." }, { status: 400 });
      
      const caFirm = await CA.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
      if (!caFirm) return NextResponse.json({ success: false, error: "Invalid Firm Invite Code." }, { status: 400 });

      const existingStaff = await CAStaff.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existingStaff) return NextResponse.json({ success: false, error: "Staff already exists." }, { status: 400 });

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
      return NextResponse.json({ success: false, error: "Invalid role specified." }, { status: 400 });
    }

    // 5. Generate Secure Session Token (Auto-Login on Registration)
    const payload = {
      userId: newUser._id.toString(),
      role: role,
      companyId: companyId ? companyId.toString() : null
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

    console.log("Registration successful for user:", newUser._id);

    return NextResponse.json({ 
      success: true,
      message: successMessage || "Registration successful",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}