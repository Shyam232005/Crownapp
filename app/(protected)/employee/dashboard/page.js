"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  PlusSquare, Clock, Receipt, Users, 
  ArrowRight, ClipboardCheck, PackageOpen, CalendarDays,
  Loader2, Sparkles, UserCheck
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  }
};

export default function EmployeeDashboardUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState("Fetching status..."); 

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`/api/attendance`);
        if (res.ok) {
          const data = await res.json();
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
    { name: "Quick Entry", href: "/employee", icon: PlusSquare, bgClass: "bg-indigo-50 border-indigo-100", textClass: "text-indigo-600", desc: "Fast general logging & vouchers" },
    { name: "Log Expense", href: "/employee/log-expense", icon: Receipt, bgClass: "bg-rose-50 border-rose-100", textClass: "text-rose-600", desc: "Upload bills & petty cash spend" },
    { name: "Stock Inward", href: "/employee/inward-stock", icon: PackageOpen, bgClass: "bg-amber-50 border-amber-100", textClass: "text-amber-600", desc: "Log inward purchase goods" },
    { name: "Customer Khata", href: "/employee/customer-khata", icon: Users, bgClass: "bg-emerald-50 border-emerald-100", textClass: "text-emerald-600", desc: "Customer ledgers & balances" },
    { name: "Stock Check", href: "/employee/stock-check", icon: ClipboardCheck, bgClass: "bg-blue-50 border-blue-100", textClass: "text-blue-600", desc: "Real-time godown audit" },
    { name: "Leave Request", href: "/employee/leaves", icon: CalendarDays, bgClass: "bg-purple-50 border-purple-100", textClass: "text-purple-600", desc: "Apply for leaves & time-off" }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black">
            <UserCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Operations Terminal
          </h1>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-slate-400 pl-10.5">
          Select an operational task below. All recorded entries are staged for business owner sign-off.
        </p>
      </motion.div>

      {/* Attendance Alert Card */}
      <motion.div 
        variants={itemVariants}
        className="bg-gradient-to-r from-indigo-50/90 via-blue-50/80 to-indigo-50/90 backdrop-blur-md border border-indigo-100/80 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0 text-white">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 mb-1">Shift & Attendance Status</p>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="h-4 w-28 bg-indigo-200/50 rounded animate-pulse" />
              ) : attendanceStatus === "Punched In" ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              ) : (
                <span className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400" />
                </span>
              )}
              <p className={`text-xs font-black uppercase tracking-wider ${
                  isLoading ? 'text-slate-400' : 
                  attendanceStatus === "Punched In" ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                {attendanceStatus}
              </p>
            </div>
          </div>
        </div>
        <Link href="/employee/attendance">
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.97 }}
            type="button"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            Go to Punch Clock <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </motion.div>

      {/* Quick Actions Grid (Staggered Children) */}
      <motion.div variants={itemVariants} className="mb-4">
        <h3 className="text-sm font-black text-slate-800 tracking-tight mb-4 px-1">Daily Operations</h3>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {quickActions.map((item) => (
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }}
            key={item.name} 
          >
            <Link href={item.href} className="block bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all h-full group">
              <div className={`w-12 h-12 ${item.bgClass} border rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xs`}>
                <item.icon className={`w-6 h-6 ${item.textClass}`} />
              </div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">{item.name}</h4>
              <p className="text-[11px] font-semibold text-slate-400 leading-snug">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}