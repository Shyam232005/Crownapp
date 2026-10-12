"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, Boxes, IndianRupee, ShieldCheck,
  ArrowRight, Users, Clock, AlertTriangle, Briefcase,
  ChevronRight, RefreshCw, CheckCircle2
} from "lucide-react";

export default function DepartmentCardsGrid() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/owner/department-summary", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      }
    } catch (e) {
      console.error("Failed to load department summary:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const op = data?.operations || {};
  const sl = data?.sales || {};
  const fn = data?.finance || {};
  const hr = data?.hr || {};

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-800 tracking-tight">Department Health Matrix</h3>
          <p className="text-xs font-semibold text-slate-400">Live operational, commercial, and financial pulse</p>
        </div>
        <button
          onClick={fetchSummary}
          type="button"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1.5"
          title="Refresh Department Metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: SALES HEALTH */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Sales Dept ({sl.staffCount || 0} Staff)
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">Commercial & Sales Health</h4>
            <div className="text-2xl font-black text-slate-900 font-mono flex items-center my-2">
              <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
              {Number(sl.monthSalesRevenue || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mb-4">Month-to-date sales revenue</p>

            <div className="space-y-2 py-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Today&apos;s Booked Sales</span>
                <span className="font-mono font-bold text-slate-900">₹{Number(sl.todaySalesRevenue || 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Pipeline Deals</span>
                <span className="font-mono font-bold text-slate-900">{sl.pipeline?.totalDeals || 0} ({sl.pipeline?.leadsCount || 0} Leads)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Pipeline Potential</span>
                <span className="font-mono font-bold text-emerald-600">₹{Number(sl.pipeline?.pipelineValue || 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <Link href="/owner/sales" className="mt-4 pt-3 border-t border-slate-100 text-xs font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700 flex items-center justify-between group">
            <span>Sales Dashboard & Quotes</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* CARD 2: OPERATIONAL STOCKS */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                Operations Dept ({op.staffCount || 0} Staff)
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">Operational Godown Stocks</h4>
            <div className="text-2xl font-black text-slate-900 my-2">
              {op.todayInward?.quantity || 0} <span className="text-xs font-semibold text-slate-400">units inward today</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mb-4">
              Across {op.todayInward?.count || 0} recorded shipment bills
            </p>

            <div className="space-y-2 py-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Recent SKUs Tracked</span>
                <span className="font-mono font-bold text-slate-900">{op.recentStocks?.length || 0} catalog items</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Warehouse Tasks</span>
                <span className="font-mono font-bold text-slate-900">{op.tasks?.pending || 0} Pending</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Godown Audits</span>
                <span className="font-mono font-bold text-amber-600">{op.tasks?.completed || 0} Completed</span>
              </div>
            </div>
          </div>

          <Link href="/owner/purchases" className="mt-4 pt-3 border-t border-slate-100 text-xs font-black uppercase tracking-wider text-amber-600 hover:text-amber-700 flex items-center justify-between group">
            <span>Inward Goods & Purchases</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* CARD 3: FINANCE & RECONCILIATION */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Finance Dept ({fn.staffCount || 0} Staff)
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 tracking-tight mb-1">Double-Entry Net Position</h4>
            <div className="text-2xl font-black text-slate-900 font-mono flex items-center my-2">
              <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
              {Number(fn.netBalance || 0).toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mb-4">Gross Income minus Gross Expenses</p>

            <div className="space-y-2 py-3 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Pending Owner Sign-Off</span>
                <span className="font-mono font-bold text-amber-600">{fn.pendingOwnerApprovals || 0} Vouchers</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Awaiting CA Audit</span>
                <span className="font-mono font-bold text-indigo-600">{fn.pendingCaReviews || 0} Vouchers</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="font-semibold">Company Total Headcount</span>
                <span className="font-mono font-bold text-slate-900">{hr.totalEmployees || 0} Active Staff</span>
              </div>
            </div>
          </div>

          <Link href="/owner/financial" className="mt-4 pt-3 border-t border-slate-100 text-xs font-black uppercase tracking-wider text-indigo-600 hover:text-indigo-700 flex items-center justify-between group">
            <span>Cash Flow & Ledgers</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
