"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ShieldCheck, IndianRupee, ArrowDownRight,
  ArrowUpRight, RefreshCw, CheckCircle2, AlertCircle,
  Building2, Search, Filter, DownloadCloud, Scale
} from "lucide-react";
import { toast } from "sonner";

export default function CATaxTablesView() {
  const [activeTableTab, setActiveTableTab] = useState("income");
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchFinancialSummary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ca/financial-summary", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Failed to load CA financial summary");
      }
    } catch (e) {
      console.error(e);
      toast.error("Network error while loading tax tables.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const tax = data?.taxSummary || {
    totalGrossSales: 0,
    totalOutputTax: 0,
    totalGrossExpenses: 0,
    totalInputTaxCredit: 0,
    netTaxPayable: 0,
    pendingAuditCount: 0
  };

  const incomeList = (data?.incomeTable || []).filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.invoiceNumber || "").toLowerCase().includes(term) ||
      (item.customerName || "").toLowerCase().includes(term) ||
      (item.gstin || "").toLowerCase().includes(term)
    );
  });

  const expenseList = (data?.expensesTable || []).filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.receiptNumber || "").toLowerCase().includes(term) ||
      (item.vendorName || "").toLowerCase().includes(term) ||
      (item.category || "").toLowerCase().includes(term) ||
      (item.gstin || "").toLowerCase().includes(term)
    );
  });

  const recoList = (data?.reconciliationsTable || []).filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      (item.accountName || "").toLowerCase().includes(term) ||
      (item.reconciliationStatus || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Strict Department Funnel Notice */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Strict Department Funnel
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Finance & Sales Data Only
              </span>
            </div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Tax-Ready Statutory Review Pipeline
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Operational warehouse inventory and HR punch/leave logs are strictly excluded from this CA portal.
              All data is structured for GSTR-1, GSTR-3B, and double-entry bank reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchFinancialSummary}
              type="button"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh Tax Tables"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tax Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Sales (Outward)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
            {Number(tax.totalGrossSales || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">
            Output Tax: ₹{Number(tax.totalOutputTax || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Expenses (Inward)</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
            {Number(tax.totalGrossExpenses || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] font-semibold text-indigo-600 mt-1">
            Input Credit: ₹{Number(tax.totalInputTaxCredit || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Tax Liability</span>
            <Scale className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
            {Number(tax.netTaxPayable || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">Output GST minus Input ITC</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending CA Scrutiny</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {tax.pendingAuditCount || 0} <span className="text-xs font-bold text-slate-400">vouchers</span>
          </div>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">Requiring tax verification</p>
        </div>
      </div>

      {/* Tax Tables Container */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 shadow-xs">
        {/* Table Selector & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTableTab("income")}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTableTab === "income"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Income & Sales ({incomeList.length})
            </button>
            <button
              onClick={() => setActiveTableTab("expenses")}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTableTab === "expenses"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Expenses & Purchases ({expenseList.length})
            </button>
            <button
              onClick={() => setActiveTableTab("reconciliations")}
              type="button"
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTableTab === "reconciliations"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Reconciliations ({recoList.length})
            </button>
          </div>

          <div className="relative sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by invoice, party, or GSTIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* 1. INCOME TABLE (GSTR-1 TAX READY) */}
        {activeTableTab === "income" && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer & GSTIN</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Base Taxable</th>
                  <th className="py-3 px-4 text-right">Tax (GST)</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incomeList.length > 0 ? (
                  incomeList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {row.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{row.customerName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{row.gstin}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">
                        {new Date(row.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                        ₹{Number(row.baseAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600">
                        ₹{Number(row.taxAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        ₹{Number(row.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-500">
                        {row.paymentMode}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-semibold">
                      No income records matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. EXPENSES TABLE (GSTR-3B ITC READY) */}
        {activeTableTab === "expenses" && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Vendor & GSTIN</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Base Taxable</th>
                  <th className="py-3 px-4 text-right">ITC Claim</th>
                  <th className="py-3 px-4 text-right">Gross Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenseList.length > 0 ? (
                  expenseList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {row.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{row.vendorName}</div>
                        <div className="text-[10px] font-mono text-slate-400">{row.gstin}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {row.category}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">
                        {new Date(row.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                        ₹{Number(row.baseAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-indigo-600">
                        ₹{Number(row.taxAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        ₹{Number(row.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-semibold">
                      No expense records matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RECONCILIATIONS TABLE */}
        {activeTableTab === "reconciliations" && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200/60">
                <tr>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Statement Date</th>
                  <th className="py-3 px-4 text-right">Closing Balance</th>
                  <th className="py-3 px-4 text-right">Unreconciled Variance</th>
                  <th className="py-3 px-4">Audit Notes</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recoList.length > 0 ? (
                  recoList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {row.accountName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">
                        {new Date(row.statementDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900">
                        ₹{Number(row.closingBalance).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600">
                        ₹{Number(row.unreconciledDifference).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {row.notes}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {row.reconciliationStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400 font-semibold">
                      Bank reconciliation clean — no variances flagged.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
