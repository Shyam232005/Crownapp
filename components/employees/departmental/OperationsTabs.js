"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Boxes, Clock, CheckSquare, Receipt, PackageOpen,
  ClipboardCheck, ArrowRight, CalendarDays, PlusSquare
} from "lucide-react";
import StocksTab from "./StocksTab";

export default function OperationsTabs({ attendanceStatus, isPunchedIn, vouchers = [] }) {
  const [activeTab, setActiveTab] = useState("stocks");

  const tabs = [
    { id: "stocks", label: "Stocks", icon: Boxes, badge: "Operational Inventory" },
    { id: "shift", label: "Daily Shifts & Clock", icon: Clock },
    { id: "tasks", label: "Warehouse Tasks", icon: CheckSquare },
    { id: "vouchers", label: "Submitted Vouchers", icon: Receipt }
  ];

  return (
    <div className="space-y-6">
      {/* Department Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60 max-w-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="hidden sm:inline text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="transition-all duration-200">
        {/* 1. EXPLICIT STOCKS REPORTING TAB (Operations Core Requirement) */}
        {activeTab === "stocks" && (
          <motion.div
            key="tab-stocks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <StocksTab />
          </motion.div>
        )}

        {/* 2. SHIFT & CLOCK TAB */}
        {activeTab === "shift" && (
          <motion.div
            key="tab-shift"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Shift Gatekeeper & Punch Terminal</h3>
                  <p className="text-xs font-semibold text-slate-400">Current Status: {attendanceStatus}</p>
                </div>
              </div>
              <Link href="/employee/attendance">
                <button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                >
                  Full Punch Clock Console <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Time Off & Leaves</h4>
                <p className="text-xs font-semibold text-slate-400 mb-4">Request casual, sick, or half-day leaves.</p>
                <Link href="/employee/leaves">
                  <button
                    type="button"
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-purple-600" /> Apply For Leave
                  </button>
                </Link>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Shift Policy</h4>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  Daily punches are cryptographically linked to your company ID. All recorded vouchers during your shift are staged for business owner sign-off.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. WAREHOUSE TASKS TAB */}
        {activeTab === "tasks" && (
          <motion.div
            key="tab-tasks"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-black text-slate-900">Operations Task Board</h3>
                <p className="text-xs font-semibold text-slate-400">Warehouse checklists and physical count verifications.</p>
              </div>
              <Link href="/employee/stock-check">
                <button
                  type="button"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ClipboardCheck className="w-4 h-4 text-emerald-400" /> Start Stock Check
                </button>
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Inward Receipt Reconciliation</h4>
                    <p className="text-[11px] font-semibold text-slate-400">Compare delivery challans with physical counts</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Routine</span>
              </div>

              <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    !
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Low Safety Stock Verification</h4>
                    <p className="text-[11px] font-semibold text-slate-400">Identify items below 10 units buffer for reorder</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">Priority</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. SUBMITTED VOUCHERS TAB */}
        {activeTab === "vouchers" && (
          <motion.div
            key="tab-vouchers"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">Submitted Operations Vouchers</h3>
              <Link href="/employee/submissions">
                <button
                  type="button"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <PlusSquare className="w-3.5 h-3.5" /> New Submission
                </button>
              </Link>
            </div>

            {vouchers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {vouchers.map((v) => (
                  <div key={v._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-slate-800">{v.type || "Inward Voucher"}</div>
                      <div className="text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      ₹{Number(v.totalAmount || v.amount || 0).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No operations vouchers recorded yet.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
