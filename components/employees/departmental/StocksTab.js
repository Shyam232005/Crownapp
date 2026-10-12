"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  PackageOpen, Package, PlusSquare, ClipboardCheck,
  TrendingUp, AlertTriangle, ArrowRight, Search,
  RefreshCw, CheckCircle2, Building, Boxes
} from "lucide-react";
import { toast } from "sonner";

export default function StocksTab() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalItems: 0,
    totalQuantity: 0,
    lowStockCount: 0,
    todayInwardCount: 0
  });

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      // Fetch inward inventory / stock data
      const res = await fetch("/api/employee/inward-stock", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.stocks || data.data || [];
        setStocks(list);

        const totalQty = list.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
        const lowStock = list.filter((item) => (Number(item.quantity) || 0) < 10).length;
        
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayCount = list.filter((item) => {
          const itemDate = new Date(item.date || item.createdAt).toISOString().slice(0, 10);
          return itemDate === todayStr;
        }).length;

        setStats({
          totalItems: list.length,
          totalQuantity: totalQty,
          lowStockCount: lowStock,
          todayInwardCount: todayCount
        });
      } else {
        // Fallback to general inventory route if available
        const altRes = await fetch("/api/inventory", { cache: "no-store" });
        if (altRes.ok) {
          const altData = await altRes.json();
          const list = Array.isArray(altData) ? altData : altData.items || altData.data || [];
          setStocks(list);
          setStats({
            totalItems: list.length,
            totalQuantity: list.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0),
            lowStockCount: list.filter((i) => (Number(i.quantity) || 0) < 10).length,
            todayInwardCount: 0
          });
        }
      }
    } catch (err) {
      console.error("Failed to load stocks:", err);
      toast.error("Could not load stocks data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  const filteredStocks = stocks.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.itemName || "").toLowerCase().includes(term) ||
      (s.sku || "").toLowerCase().includes(term) ||
      (s.supplierName || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Stocks KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Godown SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalItems}</div>
          <p className="text-[11px] font-semibold text-slate-400 mt-1">Unique catalog items</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Physical Stock Units</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalQuantity.toLocaleString()}</div>
          <p className="text-[11px] font-semibold text-emerald-600 mt-1">Units currently in godown</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today&apos;s Inward</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.todayInwardCount}</div>
          <p className="text-[11px] font-semibold text-amber-600 mt-1">Shipments logged today</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Low Stock Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lowStockCount}</div>
          <p className="text-[11px] font-semibold text-rose-500 mt-1">Items below safety buffer</p>
        </div>
      </div>

      {/* Stocks Management Section Header & Actions */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">Operational Godown Stocks Register</h3>
            </div>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Live inventory tracking, supplier inward challans, and stock verification for Operations.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/employee/inward-stock">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PackageOpen className="w-4 h-4" /> Log Inward Stock
              </motion.button>
            </Link>

            <Link href="/employee/stock-check">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ClipboardCheck className="w-4 h-4 text-emerald-400" /> Godown Audit
              </motion.button>
            </Link>

            <button
              onClick={fetchStocks}
              type="button"
              className="p-2.5 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh Stocks"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stocks by item name, SKU, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Stocks Data Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-black uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Quantity In Hand</th>
                <th className="py-3 px-4">Supplier / Challan</th>
                <th className="py-3 px-4">Last Inward Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-600" />
                    Loading godown inventory...
                  </td>
                </tr>
              ) : filteredStocks.length > 0 ? (
                filteredStocks.map((item, idx) => {
                  const qty = Number(item.quantity) || 0;
                  const isLow = qty < 10;
                  return (
                    <tr key={item._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900">{item.itemName}</div>
                        <div className="text-[11px] font-semibold text-slate-400 font-mono">
                          {item.sku || "NO-SKU"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {item.category || "General"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`font-mono font-black text-sm ${isLow ? "text-rose-600" : "text-slate-900"}`}>
                          {qty.toLocaleString()}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 ml-1">
                          {item.unit || "Pcs"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{item.supplierName || "Direct / In-House"}</div>
                        {item.challanNumber && (
                          <div className="text-[10px] font-mono text-slate-400">CH: {item.challanNumber}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-semibold">
                        {new Date(item.date || item.createdAt || Date.now()).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            Low Buffer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <PackageOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No stock entries found.</p>
                    <p className="text-[11px] mt-0.5">Use the &quot;Log Inward Stock&quot; button to record shipments arriving at the warehouse.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
