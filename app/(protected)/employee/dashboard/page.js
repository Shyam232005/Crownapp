"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  PlusSquare, Clock, Receipt, Users, 
  ArrowRight, ClipboardCheck, PackageOpen, CalendarDays,
  Loader2
} from "lucide-react";

export default function EmployeeDashboardUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState("Fetching status..."); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const employeeId = typeof window !== "undefined" ? (localStorage.getItem("fineOpsUserId") || "emp-temp-123") : "emp-temp-123";
        const res = await fetch(`/api/attendance?employeeId=${employeeId}`);
        
        if (res.ok) {
          const data = await res.json();
          // Map backend status to user-friendly UI text
          if (data.status === "punched-in") {
            setAttendanceStatus("Punched In");
          } else if (data.status === "completed") {
            setAttendanceStatus("Shift Completed");
          } else {
            setAttendanceStatus("Not Punched In");
          }
        } else {
          setAttendanceStatus("Not Punched In");
        }
      } catch (error) {
        console.error("Failed to fetch dashboard attendance:", error);
        setAttendanceStatus("Not Punched In");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const quickActions = [
    { name: "Quick Entry", href: "/employee", icon: PlusSquare, bgClass: "bg-indigo-50", textClass: "text-indigo-600", desc: "Fast general logging" },
    { name: "Log Expense", href: "/employee/expenses", icon: Receipt, bgClass: "bg-rose-50", textClass: "text-rose-600", desc: "Upload bills & petty cash" },
    { name: "Stock Inward", href: "/employee/stock-inward", icon: PackageOpen, bgClass: "bg-amber-50", textClass: "text-amber-600", desc: "Add new inventory" },
    { name: "Customer Khata", href: "/employee/khata", icon: Users, bgClass: "bg-emerald-50", textClass: "text-emerald-600", desc: "Sales & Payments" },
    { name: "Stock Check", href: "/employee/stock-check", icon: ClipboardCheck, bgClass: "bg-blue-50", textClass: "text-blue-600", desc: "View current godown stock" },
    { name: "Leave Request", href: "/employee/leaves", icon: CalendarDays, bgClass: "bg-purple-50", textClass: "text-purple-600", desc: "Apply for time-off" }
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Hello, Team Member 👋
        </motion.h1>
        <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Select an action below to start logging data for today.
        </motion.p>
      </div>

      {/* Attendance Alert Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 mb-1">Today's Shift Status</p>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : attendanceStatus === "Punched In" ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              ) : (
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400"></span>
                </span>
              )}
              <p className={`text-xs font-bold uppercase tracking-wider ${
                  isLoading ? 'text-slate-500' : 
                  attendanceStatus === "Punched In" ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {attendanceStatus}
              </p>
            </div>
          </div>
        </div>
        <Link href="/employee/attendance" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 transition-colors flex items-center justify-center gap-2">
          Go to Punch Clock <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Quick Actions Grid */}
      <h3 className="text-sm font-black text-slate-800 mb-4 px-1">Daily Operations</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {quickActions.map((item, idx) => (
          <motion.div 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            key={item.name} 
          >
            <Link href={item.href} className="block bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all h-full group">
              <div className={`w-12 h-12 ${item.bgClass} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.textClass}`} />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-1">{item.name}</h4>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}