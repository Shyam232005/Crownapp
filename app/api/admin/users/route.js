import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import Employee from "@/models/Employee";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";
import Transaction from "@/models/Transaction";
import LedgerEntry from "@/models/LedgerEntry";
import Submission from "@/models/Submission";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    if (decoded.isSuperAdmin || decoded.role === "Admin" || decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN") {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// GET: List all platform users & metrics
export async function GET(request) {
  try {
    const admin = await verifySuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access to admin console." }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const searchRegex = query ? new RegExp(query, "i") : null;

    // Fetch Owners
    const ownerFilter = searchRegex
      ? { $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }, { companyName: searchRegex }] }
      : {};
    const ownersRaw = await Owner.find(ownerFilter).sort({ createdAt: -1 }).lean();

    // Fetch Employees
    const employeeFilter = searchRegex
      ? { $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }] }
      : {};
    const employeesRaw = await Employee.find(employeeFilter).populate("ownerId", "companyName").sort({ createdAt: -1 }).lean();

    // Fetch CAs
    const caFilter = searchRegex
      ? { $or: [{ name: searchRegex }, { email: searchRegex }, { phoneNumber: searchRegex }, { firmName: searchRegex }] }
      : {};
    const casRaw = await CA.find(caFilter).sort({ createdAt: -1 }).lean();

    const now = new Date();

    const owners = ownersRaw.map((o) => {
      let expiry = o.subscriptionExpiry || o.subscription?.endDate;
      if (!expiry && o.createdAt) {
        expiry = new Date(new Date(o.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
      }
      const expDate = expiry ? new Date(expiry) : null;
      const daysLeft = expDate ? Math.max(0, Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;
      return {
        id: o._id.toString(),
        name: o.name,
        email: o.email,
        phoneNumber: o.phoneNumber,
        companyName: o.companyName,
        gstin: o.gstin,
        inviteCode: o.inviteCode,
        planName: o.subscription?.planName || "Free Trial",
        subscriptionExpiry: expDate ? expDate.toISOString() : null,
        daysLeft,
        isExpired: daysLeft <= 0,
        employeesCount: o.employees?.length || 0,
        createdAt: o.createdAt
      };
    });

    const employees = employeesRaw.map((e) => ({
      id: e._id.toString(),
      name: e.name,
      email: e.email,
      phoneNumber: e.phoneNumber,
      companyName: e.ownerId?.companyName || "Unassigned",
      ownerId: e.ownerId?._id?.toString() || null,
      createdAt: e.createdAt
    }));

    const cas = casRaw.map((c) => ({
      id: c._id.toString(),
      name: c.principalCa || c.name || "Principal CA",
      firmName: c.firmName,
      email: c.email,
      phoneNumber: c.phoneNumber,
      icaiNumber: c.icaiNumber,
      inviteCode: c.inviteCode,
      clientsCount: c.clients?.length || 0,
      staffCount: c.staff?.length || 0,
      createdAt: c.createdAt
    }));

    // Platform Stats
    const stats = {
      totalOwners: owners.length,
      totalEmployees: employees.length,
      totalCAs: cas.length,
      activeTrials: owners.filter((o) => !o.isExpired).length,
      expiredTrials: owners.filter((o) => o.isExpired).length,
      totalUsers: owners.length + employees.length + cas.length
    };

    return NextResponse.json({
      success: true,
      stats,
      owners,
      employees,
      cas
    }, { status: 200 });

  } catch (error) {
    console.error("Admin GET Users Error:", error);
    return NextResponse.json({ error: "Failed to load platform users." }, { status: 500 });
  }
}

// DELETE: Cascading Deletion of User / Entire Workspace
export async function DELETE(request) {
  try {
    const admin = await verifySuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access to admin console." }, { status: 403 });
    }

    await connectDB();
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required." }, { status: 400 });
    }

    // 1. CASCADING DELETE FOR BUSINESS OWNER (Entire SME Workspace)
    if (role === "Owner") {
      const owner = await Owner.findById(userId);
      if (!owner) return NextResponse.json({ error: "Owner not found." }, { status: 404 });

      // Cascade: Delete linked employees
      await Employee.deleteMany({ ownerId: userId });

      // Cascade: Delete double-entry ledgers & transactions
      await Transaction.deleteMany({ $or: [{ companyId: userId }, { ownerId: userId }] });
      await LedgerEntry.deleteMany({ $or: [{ companyId: userId }, { ownerId: userId }] });
      await Submission.deleteMany({ $or: [{ companyId: userId }, { ownerId: userId }] });
      
      // Cascade: Delete audit logs
      try {
        await AuditLog.deleteMany({ $or: [{ companyId: userId }, { entityId: userId }] });
      } catch (_) {}

      // Delete the owner
      await Owner.findByIdAndDelete(userId);

      return NextResponse.json({
        success: true,
        message: `Workspace "${owner.companyName}" and all associated double-entry records deleted permanently.`
      }, { status: 200 });
    }

    // 2. DELETE STAFF EMPLOYEE
    else if (role === "Employee") {
      const emp = await Employee.findById(userId);
      if (!emp) return NextResponse.json({ error: "Employee not found." }, { status: 404 });

      // Pull from owner's employee array
      if (emp.ownerId) {
        await Owner.findByIdAndUpdate(emp.ownerId, { $pull: { employees: emp._id } });
      }

      await Employee.findByIdAndDelete(userId);
      return NextResponse.json({ success: true, message: `Staff member "${emp.name}" removed.` }, { status: 200 });
    }

    // 3. DELETE CA FIRM
    else if (role === "CA") {
      const ca = await CA.findById(userId);
      if (!ca) return NextResponse.json({ error: "CA firm not found." }, { status: 404 });

      // Cascade delete CA staff
      await CAStaff.deleteMany({ caId: userId });

      // Unlink CA from Owners
      await Owner.updateMany({ linkedCaFirm: userId }, { $pull: { linkedCaFirm: userId } });

      await CA.findByIdAndDelete(userId);
      return NextResponse.json({ success: true, message: `CA firm "${ca.firmName}" removed.` }, { status: 200 });
    }

    // 4. DELETE CA STAFF
    else if (role === "CAStaff" || role === "CA-Employee") {
      await CAStaff.findByIdAndDelete(userId);
      return NextResponse.json({ success: true, message: "CA staff member removed." }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid role specified." }, { status: 400 });

  } catch (error) {
    console.error("Admin DELETE User Error:", error);
    return NextResponse.json({ error: "Failed to delete user and workspace." }, { status: 500 });
  }
}
