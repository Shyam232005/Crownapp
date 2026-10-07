import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import Employee from "@/models/Employee";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";

// MongoDB Connection Helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password, role } = body;

    // 1. Check basic validation
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password aur role zaroori hain." }, { status: 400 });
    }

    let user = null;

    // 2. Role ke hisaab se database mein find karo
    if (role === "Owner") {
      user = await Owner.findOne({ email });
    } else if (role === "Employee") {
      user = await Employee.findOne({ email });
    } else if (role === "CA") {
      user = await CA.findOne({ email });
    } else if (role === "CA-Employee") {
      user = await CAStaff.findOne({ email });
    } else {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
    }

    // 3. Agar account nahi mila
    if (!user) {
      return NextResponse.json({ error: "Is email se koi account nahi mila." }, { status: 401 });
    }

    // 4. Password Check karo (bcrypt compare)
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Galat password! Kripya sahi password daalein." }, { status: 401 });
    }

   // 5. Generate Secure Session Token (JWT)
    let companyId = null;
    if (role === "Owner") companyId = user._id;
    else if (role === "Employee") companyId = user.ownerId;
    else if (role === "CA") companyId = user._id;
    else if (role === "CA-Employee") companyId = user.caId;

    const payload = {
      userId: user._id.toString(),
      role: role,
      companyId: companyId ? companyId.toString() : null 
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d' // Token valid for 1 week
    });

    // 6. Set HTTP-only cookie (Next.js 15 requires awaiting cookies())
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

    // 7. Success! User details return karo frontend state ke liye
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: role
    };

    return NextResponse.json({ 
      message: "Login successful!", 
      user: userData 
    }, { status: 200 });

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}