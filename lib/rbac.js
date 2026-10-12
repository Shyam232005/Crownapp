import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Employee from "@/models/Employee";

/**
 * Extract and verify session token from cookies or request headers
 */
export async function getSessionUser(request = null) {
  let token = null;

  if (request) {
    token = request.cookies?.get("crown_session")?.value;
    if (!token && request.headers) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("crown_session")?.value;
    } catch (_) {
      // In edge middleware where next/headers cookies() isn't available
    }
  }

  if (!token) {
    return { user: null, error: "Unauthorized: No session token found", status: 401 };
  }

  try {
    const secret = process.env.JWT_SECRET || "default_fallback_secret";
    let decoded = null;

    try {
      decoded = jwt.verify(token, secret);
    } catch (_) {
      // Fallback to jose for edge environments
      const secretKey = new TextEncoder().encode(secret);
      const { payload } = await jwtVerify(token, secretKey);
      decoded = payload;
    }

    if (!decoded || !decoded.userId) {
      return { user: null, error: "Invalid session token", status: 401 };
    }

    // Normalize department if Employee
    const isEmployee =
      decoded.role === "Employee" ||
      decoded.role === "EMPLOYEE" ||
      decoded.normalizedRole === "EMPLOYEE";

    if (isEmployee && !decoded.department) {
      // Lazy load department from database if not baked into older tokens
      try {
        await connectDB();
        const emp = await Employee.findById(decoded.userId).select("department role companyId ownerId").lean();
        if (emp) {
          decoded.department = (emp.department || "OPERATIONS").toUpperCase();
          decoded.departmentRole = emp.role || "EMPLOYEE";
        }
      } catch (e) {
        decoded.department = "OPERATIONS";
      }
    } else if (isEmployee && decoded.department) {
      decoded.department = decoded.department.toUpperCase();
    }

    return { user: decoded, error: null, status: 200 };
  } catch (error) {
    return { user: null, error: "Session expired or invalid: " + error.message, status: 401 };
  }
}

/**
 * Validate that the authenticated user belongs to one of the authorized departments.
 * SME Owners and SuperAdmins have holistic access across all departments.
 */
export function checkDepartmentAccess(user, allowedDepartments = []) {
  if (!user) {
    return { allowed: false, error: "Unauthorized", status: 401 };
  }

  // Super-Admin and SME Business Owner have master cross-departmental access
  const isOwner =
    user.role === "Owner" ||
    user.role === "OWNER" ||
    user.normalizedRole === "OWNER" ||
    user.isSuperAdmin === true;

  if (isOwner) {
    return { allowed: true };
  }

  const isEmployee =
    user.role === "Employee" ||
    user.role === "EMPLOYEE" ||
    user.normalizedRole === "EMPLOYEE";

  if (!isEmployee) {
    return { 
      allowed: false, 
      error: "Forbidden: Only SME employees and owners can access departmental resources.", 
      status: 403 
    };
  }

  const userDepartment = (user.department || "OPERATIONS").toUpperCase();
  const normalizedAllowed = allowedDepartments.map(d => d.toUpperCase());

  if (!normalizedAllowed.includes(userDepartment)) {
    return {
      allowed: false,
      error: `Forbidden: Department access restricted. Your department (${userDepartment}) does not have permission to access ${normalizedAllowed.join(", ")} resources.`,
      status: 403,
      userDepartment,
      allowedDepartments: normalizedAllowed
    };
  }

  return { allowed: true, userDepartment };
}

/**
 * Higher-order API route guard
 */
export function withDepartmentAuth(allowedDepartments, handler) {
  return async function (request, context) {
    const { user, error, status } = await getSessionUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const check = checkDepartmentAccess(user, allowedDepartments);
    if (!check.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: check.error,
          code: "DEPARTMENT_FORBIDDEN",
          currentDepartment: check.userDepartment,
          requiredDepartments: check.allowedDepartments 
        }, 
        { status: check.status }
      );
    }

    return handler(request, { ...context, user });
  };
}
