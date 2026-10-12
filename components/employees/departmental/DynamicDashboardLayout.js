"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes, TrendingUp, Receipt, Users, Building,
  ShieldAlert, Sparkles, UserCheck, ChevronRight
} from "lucide-react";
import OperationsTabs from "./OperationsTabs";
import SalesTabs from "./SalesTabs";
import FinanceTabs from "./FinanceTabs";

export default function DynamicDashboardLayout({
  initialUser = null,
  attendanceStatus = "Not Punched In",
  isPunchedIn = true,
  vouchers = []
}) {
  const [user, setUser] = useState(initialUser);
  const [department, setDepartment] = useState(
    initialUser?.department?.toUpperCase() || "OPERATIONS"
  );
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (!initialUser) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/user/header-profile", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            const dept = (data.department || "OPERATIONS").toUpperCase();
            setDepartment(dept);
          }
        } catch (e) {
          console.error("Failed to load user profile:", e);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [initialUser]);

  const departmentBadgeInfo = {
    OPERATIONS: {
      label: "Operations & Godown",
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
      desc: "Stocks, godown inward management, shift gatekeeper & warehouse logistics"
    },
    GENERAL: {
      label: "General Operations",
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
      desc: "Stocks, inward logs, and general SME logistics"
    },
    SALES: {
      label: "Sales & CRM",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      desc: "Billing, CRM deals pipeline, quotes, and customer khata receivables"
    },
    FINANCE: {
      label: "Finance & Accounts",
      bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
      desc: "Petty cash, double-entry vouchers, expense logs, and CA review readiness"
    },
    HR: {
      label: "Human Resources",
      bg: "bg-purple-50 text-purple-700 border-purple-200/80",
      desc: "Attendance punch clocks, leave management, and staff scheduling"
    }
  };

  const currentInfo = departmentBadgeInfo[department] || departmentBadgeInfo.OPERATIONS;

  return (
    <div className="space-y-6">
      {/* Department Context Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${currentInfo.bg}`}>
              {currentInfo.label} Department
            </span>
            {user?.departmentRole && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                • {user.departmentRole}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {department === "OPERATIONS" || department === "GENERAL" ? "Operations & Stocks Terminal" :
             department === "SALES" ? "Sales & Revenue Terminal" :
             department === "FINANCE" ? "Finance & Accounting Terminal" :
             "Staff Department Terminal"}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            {currentInfo.desc}
          </p>
        </div>

        {/* Dynamic Department Switcher (for Manager/Admin roles) */}
        {user?.isSuperAdmin || user?.departmentRole === "MANAGER" || user?.departmentRole === "HEAD" || user?.roleInCompany === "Admin" ? (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start sm:self-auto">
            {["OPERATIONS", "SALES", "FINANCE"].map((deptKey) => (
              <button
                key={deptKey}
                onClick={() => setDepartment(deptKey)}
                type="button"
                className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg transition-all ${
                  department === deptKey
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {deptKey}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Strict Role/Department Isolation Renderer */}
      {/* RENDER ONLY THE TABS MATCHING THE EMPLOYEE'S DEPARTMENT */}
      <div>
        {department === "OPERATIONS" || department === "GENERAL" ? (
          <OperationsTabs
            attendanceStatus={attendanceStatus}
            isPunchedIn={isPunchedIn}
            vouchers={vouchers}
          />
        ) : department === "SALES" ? (
          <SalesTabs />
        ) : department === "FINANCE" ? (
          <FinanceTabs vouchers={vouchers} />
        ) : (
          <OperationsTabs
            attendanceStatus={attendanceStatus}
            isPunchedIn={isPunchedIn}
            vouchers={vouchers}
          />
        )}
      </div>
    </div>
  );
}
