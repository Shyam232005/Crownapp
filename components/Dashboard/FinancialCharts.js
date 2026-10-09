"use client";
import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react";

// Mock 6-Month Data for Cash Flow & Revenue/Expenses
const DEFAULT_CASHFLOW_DATA = [
  { month: "May", moneyIn: 420000, moneyOut: 290000, netFlow: 130000 },
  { month: "Jun", moneyIn: 510000, moneyOut: 360000, netFlow: 150000 },
  { month: "Jul", moneyIn: 480000, moneyOut: 410000, netFlow: 70000 },
  { month: "Aug", moneyIn: 620000, moneyOut: 390000, netFlow: 230000 },
  { month: "Sep", moneyIn: 710000, moneyOut: 480000, netFlow: 230000 },
  { month: "Oct", moneyIn: 830000, moneyOut: 520000, netFlow: 310000 }
];

const DEFAULT_AGING_DATA = [
  { name: "0-30 Days (Current)", value: 450000, type: "AR", color: "#10b981" },
  { name: "31-60 Days (Mild)", value: 210000, type: "AR", color: "#f59e0b" },
  { name: "61-90 Days (Critical)", value: 95000, type: "AR", color: "#f97316" },
  { name: "90+ Days (Overdue)", value: 40000, type: "AR", color: "#ef4444" }
];

const DEFAULT_AP_AGING_DATA = [
  { name: "0-30 Days (Current)", value: 310000, type: "AP", color: "#3b82f6" },
  { name: "31-60 Days (Due Soon)", value: 140000, type: "AP", color: "#6366f1" },
  { name: "61-90 Days (Due)", value: 50000, type: "AP", color: "#8b5cf6" },
  { name: "90+ Days (Overdue)", value: 20000, type: "AP", color: "#a855f7" }
];

const formatCurrency = (val) => {
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  return `₹${Number(val).toLocaleString("en-IN")}`;
};

/**
 * 1. Cash Flow Pipeline (Bar Chart)
 * 6-month view showing "Money In" (Emerald) vs "Money Out" (Rose) side-by-side
 */
export function CashFlowPipelineChart({ data = DEFAULT_CASHFLOW_DATA }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" /> Cash Flow Pipeline
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            6-Month Realized Money In vs Money Out
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span className="text-slate-600">Money In</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500" />
            <span className="text-slate-600">Money Out</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value, name) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                name === "moneyIn" ? "Money In" : "Money Out"
              ]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "1rem",
                color: "#ffffff",
                border: "none",
                fontSize: "12px",
                fontWeight: "bold"
              }}
              itemStyle={{ color: "#ffffff" }}
            />
            <Bar
              dataKey="moneyIn"
              name="moneyIn"
              fill="#10b981"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="moneyOut"
              name="moneyOut"
              fill="#f43f5e"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * 2. Revenue vs Expenses (Area Chart)
 * Trendline to easily spot if expenses are outpacing income
 */
export function RevenueVsExpensesChart({ data = DEFAULT_CASHFLOW_DATA }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Revenue vs Expenses Trendline
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Monitor if operating expenses are outpacing topline revenue
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-rose-500" />
            <span className="text-slate-600">Expenses</span>
          </div>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip
              formatter={(value, name) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                name === "moneyIn" ? "Revenue" : "Expenses"
              ]}
              contentStyle={{
                backgroundColor: "#0f172a",
                borderRadius: "1rem",
                color: "#ffffff",
                border: "none",
                fontSize: "12px",
                fontWeight: "bold"
              }}
            />
            <Area
              type="monotone"
              dataKey="moneyIn"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="moneyOut"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * 3. A/R vs A/P Aging (Pie/Donut)
 * Shows outstanding money owed by customers (A/R) vs vendors (A/P) by overdue buckets
 */
export function AgingDonutChart({
  arData = DEFAULT_AGING_DATA,
  apData = DEFAULT_AP_AGING_DATA
}) {
  const [viewMode, setViewMode] = useState("AR"); // "AR" (Receivables) | "AP" (Payables)
  const currentData = viewMode === "AR" ? arData : apData;
  const totalAmount = currentData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              A/R vs A/P Aging Analysis
            </h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Overdue categorization (0-30, 31-60, 61-90, 90+ days)
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("AR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === "AR"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            To Collect (A/R)
          </button>
          <button
            onClick={() => setViewMode("AP")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              viewMode === "AP"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            To Pay (A/P)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {currentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => `₹${Number(val).toLocaleString("en-IN")}`}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderRadius: "0.75rem",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total {viewMode}
            </span>
            <span className="text-sm font-black text-slate-900">
              ₹{(totalAmount / 100000).toFixed(1)}L
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {currentData.map((bucket, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: bucket.color }}
                />
                <span className="font-bold text-slate-700">{bucket.name}</span>
              </div>
              <span className="font-black text-slate-900 font-mono">
                ₹{bucket.value.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Combined Financial Health Charts Component
 */
export default function FinancialCharts({
  cashFlowData = DEFAULT_CASHFLOW_DATA,
  arData = DEFAULT_AGING_DATA,
  apData = DEFAULT_AP_AGING_DATA
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashFlowPipelineChart data={cashFlowData} />
        <RevenueVsExpensesChart data={cashFlowData} />
      </div>
      <AgingDonutChart arData={arData} apData={apData} />
    </div>
  );
}
