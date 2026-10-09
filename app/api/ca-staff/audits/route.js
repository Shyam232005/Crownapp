import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CAStaff from "@/models/CAStaff";
import { AuditReport } from "@/models/Compliance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    let query = {};
    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      const assignedIds = (staffMember?.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember?.assignedClients || [])).map(id => id.toString());
      if (clientId) {
        if (!assignedIds.includes(clientId.toString())) {
          return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
        }
        query = { clientId };
      } else {
        query = { clientId: { $in: assignedIds } };
      }
    } else if (clientId) {
      query = { clientId };
    }
    
    // Fetch audit reports, newest first
    const audits = await AuditReport.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: audits }, { status: 200 });
  } catch (error) {
    console.error("GET Audits Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch audit reports" }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newAudit = await AuditReport.create({
      clientId: body.clientId || "client-temp-123",
      caStaffId: body.caStaffId || "staff-temp-123",
      period: body.period,
      issuesFound: Number(body.issuesFound) || 0,
      status: body.status || "In Progress",
      reportNotes: body.reportNotes || ""
    });

    return NextResponse.json(
      { success: true, message: "Audit report created", data: newAudit }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Audit Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create audit report" }, 
      { status: 400 }
    );
  }
}