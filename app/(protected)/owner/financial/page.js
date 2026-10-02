"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, TrendingUp, IndianRupee, PieChart, 
  Loader2, BarChart3 
} from "lucide-react";

export default function FinancialHealthUI() {
  // ✨ FIX: State setup for API integration (Zero-State by default)
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    netProfitMargin: 0,
    profitTrend: 0,
    burnRate: 0,
    runway: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);

  // ✨ Mock API Call
  useEffect(() => {
    const fetchFinancials = async () => {
      // Later: const res = await fetch('/api/owner/financial-health');
      setTimeout(() => {
        // True zero-state for a new business
        setStats({
          netProfitMargin: 0,
          profitTrend: 0,
          burnRate: 0,
          runway: 0
        });
        setMonthlyData([]); // Empty array for zero-state chart
        setIsLoading(false);
      }, 800);
    };
    fetchFinancials();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" /> Financial Health
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Monitor your business profitability and 6-month cashflow trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Net Profit Margin</p>
          <h2 className="text-4xl font-black text-emerald-500 mb-2 flex items-center h-10">
            {isLoading ? <Loader2 className="w-7 h-7 animate-spin text-emerald-400" /> : `${stats.netProfitMargin}%`}
          </h2>
          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 w-max px-2 py-1 rounded-md">
            <TrendingUp className="w-4 h-4" /> {isLoading ? "..." : `+${stats.profitTrend}% from last month`}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Monthly Burn Rate</p>
          <h2 className="text-4xl font-black text-slate-900 flex items-center mb-2 h-10">
            {isLoading ? (
                <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
            ) : (
                <>
                    <IndianRupee className="w-6 h-6 mr-1 text-slate-400" /> {stats.burnRate}
                </>
            )}
          </h2>
          <p className="text-sm font-medium text-slate-500">Fixed expenses & salaries</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2">Runway</p>
          <h2 className="text-4xl font-black mb-2 flex items-center h-10">
            {isLoading ? <Loader2 className="w-7 h-7 animate-spin text-indigo-200" /> : stats.runway > 0 ? `${stats.runway} Months` : "N/A"}
          </h2>
          <p className="text-sm font-medium text-indigo-100">Cash available for operations</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-8">
          <PieChart className="w-5 h-5 text-slate-400" /> Revenue vs Expense (In Lakhs)
        </h3>
        
        {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                <p className="text-sm font-bold">Calculating trends...</p>
            </div>
        ) : monthlyData.length > 0 ? (
            <>
                <div className="h-64 flex items-end gap-2 sm:gap-6 justify-between px-2 sm:px-4">
                {monthlyData.map((data, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 w-full">
                    <div className="flex gap-1 sm:gap-2 items-end w-full justify-center h-48">
                        {/* Expense Bar */}
                        <motion.div 
                        initial={{ height: 0 }} animate={{ height: `${(data.expense / 8) * 100}%` }} transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="w-1/3 max-w-[24px] bg-rose-400 rounded-t-md relative group"
                        >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{data.expense}L
                        </div>
                        </motion.div>
                        {/* Revenue Bar */}
                        <motion.div 
                        initial={{ height: 0 }} animate={{ height: `${(data.revenue / 8) * 100}%` }} transition={{ delay: idx * 0.1, duration: 0.5 }}
                        className="w-1/3 max-w-[24px] bg-emerald-500 rounded-t-md relative group"
                        >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            ₹{data.revenue}L
                        </div>
                        </motion.div>
                    </div>
                    <p className="text-xs font-bold text-slate-500">{data.month}</p>
                    </div>
                ))}
                </div>
                <div className="flex justify-center gap-6 mt-6 border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-xs font-bold text-slate-600">Revenue</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded-full"></div><span className="text-xs font-bold text-slate-600">Expenses</span></div>
                </div>
            </>
        ) : (
            // ✨ FIX: Zero-State UI for the chart
            <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-base font-black text-slate-800 mb-1">No Financial Data Yet</h4>
                <p className="text-sm font-medium text-slate-500 max-w-sm">
                    Start logging your revenues and expenses. Your monthly cashflow trends will appear here.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}