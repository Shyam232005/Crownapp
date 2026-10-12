"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Boxes, PackageOpen, AlertTriangle, ArrowRight,
  RefreshCw, CheckCircle2, TrendingDown, Building
} from "lucide-react";

export default function OwnerStocksWidget({ initialStocks = [], todayInward = { count: 0, quantity: 0 } }) {
  const [stocks, setStocks] = useState(initialStocks);
  const [inwardStats, setInwardStats] = useState(todayInward);
  const [isLoading, setIsLoading] = useState(false);

  const refreshStocks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/owner/department-summary");
      if (res.ok) {
        const json = await res.json();
        if (json.data?.operations) {
          setStocks(json.data.operations.recentStocks || []);
          setInwardStats(json.data.operations.todayInward || { count: 0, quantity: 0 });
        }
      }
    } catch (e) {
      console.error("Failed to refresh owner stocks widget:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialStocks.length === 0) {
      refreshStocks();
    }
  }, []);

  const totalQuantity = stocks.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const lowStockItems = stocks.filter((s) => (Number(s.quantity) || 0) < 10);

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Operational Godown Stocks
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                Operations Dept
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Live godown inventory monitoring, safety buffer alerts, and supplier inward records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refreshStocks}
            type="button"
            className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh Stock Counts"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
          </button>
          <Link href="/owner/purchases">
            <button
              type="button"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              Inward Invoices <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
        <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Stock In Hand</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {totalQuantity.toLocaleString()} <span className="text-xs font-semibold text-slate-400">units</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Today&apos;s Inward Received</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">
            {inwardStats.quantity || 0} <span className="text-xs font-semibold text-slate-400">units ({inwardStats.count || 0} bills)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/70 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">Buffer Warnings</span>
          <div className="text-xl font-black text-rose-600 mt-0.5">
            {lowStockItems.length} <span className="text-xs font-semibold text-slate-400">SKUs below 10 units</span>
          </div>
        </div>
      </div>

      {/* Recent Stocks Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 font-black uppercase tracking-wider border-b border-slate-200/60">
            <tr>
              <th className="py-3 px-4">Item & SKU</th>
              <th className="py-3 px-4 text-right">Physical Quantity</th>
              <th className="py-3 px-4">Supplier / Challan</th>
              <th className="py-3 px-4 text-center">Safety Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stocks.length > 0 ? (
              stocks.slice(0, 6).map((item, idx) => {
                const qty = Number(item.quantity) || 0;
                const isLow = qty < 10;
                return (
                  <tr key={item._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-black text-slate-900">{item.itemName}</div>
                      <div className="text-[10px] font-mono text-slate-400">{item.sku || "GENERAL-SKU"}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`font-mono font-black ${isLow ? "text-rose-600" : "text-slate-900"}`}>
                        {qty.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 ml-1">{item.unit || "Pcs"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700">{item.supplierName || "Direct Supplier"}</div>
                      {item.challanNumber && (
                        <div className="text-[10px] font-mono text-slate-400">Challan: {item.challanNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-2.5 h-2.5" /> Reorder
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Sufficient
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  <PackageOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-semibold text-slate-600">No stock records found.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Staff in Operations can log inward stock shipments.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
