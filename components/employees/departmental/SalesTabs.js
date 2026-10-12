"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  TrendingUp, Users, PlusSquare, FileText, CheckCircle2,
  DollarSign, ArrowRight, IndianRupee, RefreshCw, Briefcase,
  Clock, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function SalesTabs() {
  const [activeTab, setActiveTab] = useState("pipeline");
  const [salesData, setSalesData] = useState({ totalRevenue: 0, transactionsCount: 0, dealsCount: 0, salesTransactions: [], deals: [] });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sales", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setSalesData(json.data || {});
      } else {
        const err = await res.json().catch(() => ({}));
        if (res.status === 403) {
          toast.error("403 Forbidden: Sales department access required.");
        } else {
          toast.error(err.error || "Failed to load sales data");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const tabs = [
    { id: "pipeline", label: "CRM Pipeline & Quotes", icon: Briefcase },
    { id: "invoices", label: "Sales Invoices & Billing", icon: TrendingUp },
    { id: "khata", label: "Customer Khata (Receivables)", icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Sales KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sales Revenue</span>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-center font-mono">
            <IndianRupee className="w-5 h-5 mr-0.5 text-slate-600" />
            {Number(salesData.totalRevenue || 0).toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">Booked department sales</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Pipeline Deals</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {salesData.dealsCount || 0}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">Quotes, Offers & Leads</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sales Vouchers Logged</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {salesData.transactionsCount || 0}
          </div>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">Staged for owner verification</p>
        </div>
      </div>

      {/* Sales Navigation Bar */}
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
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/employee/submissions">
            <button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <PlusSquare className="w-4 h-4" /> New Sales Entry
            </button>
          </Link>

          <Link href="/employee/crm">
            <button
              type="button"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-400" /> Open CRM Module
            </button>
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 shadow-xs">
        {activeTab === "pipeline" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">CRM Deals & Pipeline Overview</h3>
              <button onClick={fetchSales} type="button" className="text-slate-400 hover:text-slate-600">
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {salesData.deals && salesData.deals.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {salesData.deals.map((deal) => (
                  <div key={deal._id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50/60 px-3 rounded-xl transition-colors">
                    <div>
                      <div className="font-black text-slate-900">{deal.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold">{deal.customerName}</span>
                        <span>•</span>
                        <span className="uppercase font-bold text-indigo-600">{deal.dealType || "QUOTE"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-slate-900">₹{Number(deal.amount || 0).toLocaleString("en-IN")}</div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        deal.stage === "WON" ? "bg-emerald-50 text-emerald-700" :
                        deal.stage === "LOST" ? "bg-rose-50 text-rose-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {deal.stage || "LEAD"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">No active deals in pipeline. Use CRM module to create quotes and offers.</p>
            )}
          </div>
        )}

        {activeTab === "invoices" && (
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-4">Recent Sales Invoices & Vouchers</h3>
            {salesData.salesTransactions && salesData.salesTransactions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {salesData.salesTransactions.map((tx) => (
                  <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-black text-slate-900">
                        {tx.metadata?.customerName || tx.receiptNumber || "Direct Sale"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900">
                        ₹{Number(tx.totalAmount || tx.amount || 0).toLocaleString("en-IN")}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">No sales invoices logged yet.</p>
            )}
          </div>
        )}

        {activeTab === "khata" && (
          <div className="text-center py-8">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-black text-slate-800">Customer Khata Directory</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Track customer credit lines, payment-in advances, and outstanding collections.
            </p>
            <Link href="/employee/customer-khata">
              <button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Open Customer Khata Register
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
