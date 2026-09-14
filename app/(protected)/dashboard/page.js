"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileText,
  Mail,
  Truck,
  TrendingUp,
  Search,
  Bell,
  Settings,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  LogOut,
  Menu,
  X,
  CreditCard,
  Cloud,
  Cpu,
  Server,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import { useRouter,usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function FinOpsDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession()
  console.log(session)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Calendar", icon: Calendar, path: "/calendar" },
    { label: "Accounts", icon: Layers, path: "/accounts" },
    { label: "Invoices & Billing", icon: FileText, path: "/invoices" },
    { label: "Reports", icon: Layers, path: "/reports" },
    { label: "Inventory & Stock", icon: Server, path: "/inventory" },
    { label: "CRM", icon: TrendingUp, path: "/crm" },
  ];

  const topCostDrivers = [
    { name: "Shop rent", service: "Real Estate", cost: "₹4,820", variance: "+2%", status: "Over Budget", badgeColor: "bg-red-50 text-red-600 border-red-200" },
    { name: "Primary Analytical DB (BigQuery)", service: "GCP Analytics", cost: "₹2,00", variance: "-3.2%", status: "Optimized", badgeColor: "bg-green-50 text-green-600 border-green-200" },
    { name: "warehouse ", service: "Real Estate", cost: "₹2,000", variance: "+1.1%", status: "Stable", badgeColor: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "Transportation", service: "Porter ", cost: "₹1,120", variance: "+0.5%", status: "Stable", badgeColor: "bg-blue-50 text-blue-600 border-blue-200" },
    { name: "Employ/workers", service: "Teams", cost: "₹940", variance: "+10.0%", status: "Action Needed", badgeColor: "bg-amber-50 text-amber-600 border-amber-200" },
  ];

  const spendingStreams = [
    { provider: "Vendor 1", share: "00%", amount: "₹00,00", color: "bg-indigo-600" },
    { provider: "Vendor 2", share: "00%", amount: "₹00,000", color: "bg-blue-500" },
    { provider: "Vendor 3", share: "00%", amount: "₹00,000", color: "bg-sky-400" },
    { provider: "Vendor 4", share: "00%", amount: "₹00,000", color: "bg-slate-300" },
  ];

  const recentAnomalies = [
    { title: "Egress Traffic Spike", resource: "us-east-1 NAT Gateway", time: "12m ago", amount: "+$410/day" },
    { title: "Unattached EBS Volumes", resource: "8 unattached gp3 storage disks", time: "1h ago", amount: "+$86/mo" },
    { title: "Idle Compute Node", resource: "g4dn.2xlarge machine idling", time: "3h ago", amount: "+$180/mo" },
  ];

  const handlelogout = async (e) => {
    signOut({ callbackUrl: "/" })
  }

  useEffect(() => {
    // ✅ update activeTab whenever URL changes
    const current = navItems.find((item) => item.path === pathname);
    if (current) setActiveTab(current.label);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          <div>
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">
                  C
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900">rown<span className="text-indigo-600">-Ecosytems</span></span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 lg:hidden"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveTab(item.label);
                      router.push(item.path);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                  >
                    <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Card & Actions */}
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition cursor-pointer"
              onClick={handlelogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3 flex-1 max-w-lg">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-slate-500 hover:text-slate-700 lg:hidden rounded-lg hover:bg-slate-100"
              >
                <Menu size={20} />
              </button>
              <div className="relative w-full">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources, tags, clusters, or accounts..."
                  className="w-full bg-slate-100/80 rounded-xl pl-10 pr-4 py-2 text-sm border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative">
                <Bell size={18} />
                <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl hidden sm:block">
                <Settings size={18} />
              </button>

              <div className="h-7 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-1">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs">
                  CE
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <p className="font-semibold text-slate-900 leading-tight">CrownLead</p>
                  <p className="text-slate-400">Demo Fleet</p>
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Body */}
          <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Top Welcome & Month Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-500">Live multi-account telemetry across All accounts.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  All Time Period: Your Billing Cycle (MTD)
                </span>
              </div>
            </div>

            {/* Row 1: KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Cash on Hand</span>
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><CreditCard size={18} /></span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">₹00,000</div>
                </div>

              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Bank Balanced</span>
                    <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><CreditCard size={18} /></span>
                  </div>
                  <div className="text-2xl font-extrabold text-slate-900">₹00,000</div>
                </div>

              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Profit After Tax</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><TrendingUp size={18} /></span>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600">₹00,000</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending Payment</span>
                    <span className="p-2 rounded-xl bg-purple-50 text-purple-600"><TrendingDown size={18} /></span>
                  </div>
                  <div className="text-2xl font-extrabold text-red-900">₹00,000</div>
                </div>
              </div>
            </div>

            {/* Row 2: Spend Distribution & Weekly Run-Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Burn Rate Bar Chart Mockup */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-900">Daily Cost Run-Rate</h3>
                    <p className="text-xs text-slate-500">Daily spending breakdown</p>
                  </div>
                </div>

                {/* Simulated Chart Bars */}
                <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
                  {[
                    { day: "Mon", h1: "65%", h2: "20%" },
                    { day: "Tue", h1: "78%", h2: "25%" },
                    { day: "Wed", h1: "70%", h2: "30%" },
                    { day: "Thu", h1: "88%", h2: "28%" },
                    { day: "Fri", h1: "95%", h2: "35%" },
                    { day: "Sat", h1: "52%", h2: "18%" },
                    { day: "Sun", h1: "48%", h2: "15%" },
                  ].map((bar) => (
                    <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full max-w-[36px] flex flex-col gap-1 items-center">
                        <div style={{ height: bar.h1 }} className="w-full bg-indigo-600 rounded-t-md group-hover:bg-indigo-700 transition"></div>
                        <div style={{ height: bar.h2 }} className="w-full bg-blue-300 rounded-t-sm"></div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-400 mt-2">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Provider Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Spend by Crown Ecosystems</h3>
                  <p className="text-xs text-slate-500 mb-5">Proportional breakdown of monthly  expenses</p>

                  <div className="space-y-4">
                    {spendingStreams.map((stream) => (
                      <div key={stream.provider} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{stream.provider}</span>
                          <span className="text-slate-900">{stream.amount} ({stream.share})</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${stream.color}`} style={{ width: stream.share }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>4 Multi-Accounts Connected</span>
                  <button className="text-indigo-600 font-semibold hover:underline cursor-pointer">Manage</button>
                </div>
              </div>
            </div>

            {/* Row 3: Top Cost Drivers Table & Live Anomaly Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cost Drivers Table */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">Highest Cost Resources</h3>
                    <p className="text-xs text-slate-500">Infrastructure highest Expenses</p>
                  </div>
                  <button className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">View All Resources</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Resource / Cluster</th>
                        <th className="py-3 px-4">Catogories</th>
                        <th className="py-3 px-4">Cost</th>
                        <th className="py-3 px-4">Increment/Year</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {topCostDrivers.map((item) => (
                        <tr key={item.name} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-5 font-semibold text-slate-900">{item.name}</td>
                          <td className="py-3.5 px-4 text-slate-500">{item.service}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{item.cost}</td>
                          <td className="py-3.5 px-4 text-slate-500">{item.variance}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${item.badgeColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Anomaly Alerts Feed */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={17} className="text-amber-500" />
                  <h3 className="font-bold text-slate-900">Real-Time Cost Spikes</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Detected sudden anomalies in the last 24 hours</p>

                <div className="space-y-3">
                  {recentAnomalies.map((anomaly) => (
                    <div key={anomaly.title} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900">{anomaly.title}</span>
                        <span className="text-[11px] font-bold text-rose-600">{anomaly.amount}</span>
                      </div>
                      <span className="text-xs text-slate-500">{anomaly.resource}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{anomaly.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

