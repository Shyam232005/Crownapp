"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Receipt, PlusSquare, ArrowRight, IndianRupee,
  ShieldCheck, Clock, CheckCircle2, AlertCircle,
  FileSpreadsheet, Building2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";

export default function FinanceTabs({ vouchers = [] }) {
  const [activeTab, setActiveTab] = useState("expenses");
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: "expenses", label: "Expenses & Petty Cash", icon: Receipt },
    { id: "approvals", label: "Voucher Audit & Status", icon: ShieldCheck },
    { id: "ledger", label: "Double-Entry Ledger", icon: FileSpreadsheet }
  ];

  return (
    <div className="space-y-6">
      {/* Finance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Vouchers Staged</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {vouchers.length}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">Logged by finance department</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {vouchers.filter((v) => v.status === "PENDING_OWNER_APPROVAL" || v.status === "PENDING").length}
          </div>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">Awaiting owner review</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">CA Verified</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {vouchers.filter((v) => v.status === "APPROVED" || v.status === "EXPORTED").length}
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">Audit ready for Tally sync</p>
        </div>
      </div>

      {/* Finance Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/60">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/employee/log-expense">
            <button
              type="button"
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Receipt className="w-4 h-4" /> Log Expense
            </button>
          </Link>
          <Link href="/employee/submissions">
            <button
              type="button"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusSquare className="w-4 h-4" /> New Voucher
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 shadow-xs">
        {activeTab === "expenses" && (
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-4">Finance Department Expense Register</h3>
            {vouchers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {vouchers.map((v) => (
                  <div key={v._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-slate-800">
                        {v.metadata?.vendorName || v.metadata?.payeeName || v.type || "Expense Entry"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(v.transactionDate || v.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        ₹{Number(v.totalAmount || v.amount || 0).toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{v.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">No expense vouchers registered yet.</p>
            )}
          </div>
        )}

        {activeTab === "approvals" && (
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-2">Audit & Owner Sign-Off Pipeline</h3>
            <p className="text-xs text-slate-400 mb-4">
              All double-entry vouchers submitted by staff undergo Owner Sign-Off before being funneled to the CA practice.
            </p>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Owner Verification Level</h4>
                  <p className="text-[11px] text-slate-500">Reviews payment proof, tax compliance, and vendor authenticity</p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700">Level 1</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800">Chartered Accountant Verification Level</h4>
                  <p className="text-[11px] text-slate-500">ITC claim eligibility, GST reconciliation, and Tally export</p>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700">Level 2</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="text-center py-8">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-black text-slate-800">General Ledger & Accounts</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Access the double-entry ledger to view journal entries, debit/credit balances, and bank transactions.
            </p>
            <Link href="/employee/submissions">
              <button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Access Financial Postings
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
