import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ROLE_DASHBOARDS = {
  Owner: "/owner/dashboard",
  OWNER: "/owner/dashboard",
  Employee: "/employee/dashboard",
  EMPLOYEE: "/employee/dashboard",
  CA: "/ca/dashboard",
  "CA-Employee": "/ca-staff/dashboard",
  CAStaff: "/ca-staff/dashboard",
  CA_STAFF: "/ca-staff/dashboard",
  Admin: "/console",
  ADMIN: "/console",
  SUPER_ADMIN: "/console"
};

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. Bypass Next.js assets, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Base portal redirects
  if (pathname === "/owner") {
    return NextResponse.redirect(new URL("/owner/dashboard", request.url));
  }
  if (pathname === "/employee") {
    return NextResponse.redirect(new URL("/employee/dashboard", request.url));
  }
  if (pathname === "/ca") {
    return NextResponse.redirect(new URL("/ca/dashboard", request.url));
  }
  if (pathname === "/ca-staff") {
    return NextResponse.redirect(new URL("/ca-staff/dashboard", request.url));
  }

  // 3. Any leftover /setup route redirects to dashboard or login
  if (pathname === "/setup") {
    const token = request.cookies.get("crown_session")?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_fallback_secret");
        const { payload } = await jwtVerify(token, secret);
        const dest = ROLE_DASHBOARDS[payload.role] || "/owner/dashboard";
        return NextResponse.redirect(new URL(dest, request.url));
      } catch (_) {}
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Token Extraction & Verification
  const token = request.cookies.get("crown_session")?.value;
  let user = null;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_fallback_secret");
      const { payload } = await jwtVerify(token, secret);
      user = payload;
    } catch (err) {
      user = null;
    }
  }

  const isAdmin = user && (user.isSuperAdmin || user.role === "Admin" || user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  // 5. Secret Super-Admin Portal Cloaking & Protection (/admin/* and /console/*)
  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/console" ||
    pathname.startsWith("/console/");

  if (isAdminRoute) {
    if (!isAdmin) {
      // Immediate cloaked redirect to login to obscure admin console existence
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Prevent redirect loop if admin visits /admin root
    if (pathname === "/admin" || pathname === "/admin/dashboard") {
      return NextResponse.redirect(new URL("/console", request.url));
    }
    return NextResponse.next();
  }

  // 6. Identify Protected Role Portals
  const isOwnerRoute = pathname.startsWith("/owner");
  const isEmployeeRoute = pathname.startsWith("/employee");
  const isCaRoute = pathname.startsWith("/ca") && !pathname.startsWith("/ca-staff");
  const isCaStaffRoute = pathname.startsWith("/ca-staff");
  const isProtectedRoute = isOwnerRoute || isEmployeeRoute || isCaRoute || isCaStaffRoute;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // 7. If already authenticated and accessing login or signup, redirect to appropriate portal
  if (isAuthPage && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/console", request.url));
    }
    const dest = ROLE_DASHBOARDS[user.role] || "/owner/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // 8. Strict RBAC Portal Locking
  if (isProtectedRoute) {
    if (!user) {
      const redirectRes = NextResponse.redirect(new URL("/login", request.url));
      redirectRes.cookies.delete("crown_session");
      return redirectRes;
    }

    // Super-Admin has master audit bypass across all portals
    if (isAdmin) {
      return NextResponse.next();
    }

    const userRole = user.role;

    if (isOwnerRoute && userRole !== "Owner" && userRole !== "OWNER") {
      const dest = ROLE_DASHBOARDS[userRole] || "/login";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isEmployeeRoute && userRole !== "Employee" && userRole !== "EMPLOYEE") {
      const dest = ROLE_DASHBOARDS[userRole] || "/login";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isCaRoute && userRole !== "CA") {
      const dest = ROLE_DASHBOARDS[userRole] || "/login";
      return NextResponse.redirect(new URL(dest, request.url));
    }

    if (isCaStaffRoute && userRole !== "CA-Employee" && userRole !== "CAStaff" && userRole !== "CA_STAFF") {
      const dest = ROLE_DASHBOARDS[userRole] || "/login";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return NextResponse.next();
}

export const middleware = proxy;

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/console",
    "/console/:path*",
    "/owner/:path*",
    "/employee/:path*",
    "/ca/:path*",
    "/ca-staff/:path*",
    "/login",
    "/signup",
    "/setup",
    "/owner",
    "/employee",
    "/ca",
    "/ca-staff"
  ]
};
