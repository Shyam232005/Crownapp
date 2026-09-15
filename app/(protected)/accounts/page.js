"use client"
import Link from 'next/link';
import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
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
import { signOut } from "next-auth/react";

const Account = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const pathname = usePathname();
  const router = useRouter()
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Calendar", icon: Calendar, path: "/calendar" },
    { label: "Accounts", icon: Layers, path: "/accounts" },
    { label: "Invoices & Billing", icon: FileText, path: "/invoices" },
    { label: "Reports", icon: Layers, path: "/reports" },
    { label: "Inventory & Stock", icon: Server, path: "/inventory" },
    { label: "CRM", icon: TrendingUp, path: "/crm" },
  ];
  const [metrics, setMetrics] = useState({
    totalPurchases: 0,
    totalInputTaxes: 0,
    totalPayables: 0,
  });

  useEffect(() => {
    async function loadLedger() {
      try {
        const res = await fetch("/api/transactions");
        const result = await res.json();
        if (result.success) {
          setTransactions(result.data);
        }
      } catch (e) {
        console.error("Failed to load transactions", e);
      } finally {
        setLoading(false);
      }
    }
    loadLedger();
  }, []);

  const handlelogout = async (e) => {
    signOut({ callbackUrl: "/" })
  }
  useEffect(() => {
    // ✅ update activeTab whenever URL changes
    const current = navItems.find((item) => item.path === pathname);
    if (current) setActiveTab(current.label);
  }, [pathname]);


  const calculateMetrics = (data) => {
    let purchases = 0;
    let inputTaxes = 0;
    let payables = 0;

    data.forEach(txn => {
      txn.entries.forEach(entry => {
        // Debits
        if (entry.entryType === "DEBIT") {
          if (entry.accountName === "Purchases") purchases += entry.amount;
          if (entry.accountName.includes("Added")) inputTaxes += entry.amount;
        }
        // Credits
        if (entry.entryType === "CREDIT" && entry.accountName.includes("Accounts Payable")) {
          payables += entry.amount;
        }
      });
    });

    setMetrics({ totalPurchases: purchases, totalInputTaxes: inputTaxes, totalPayables: payables });
  };

  const { totalDebits, totalCredits } = transactions.reduce(
    (totals, txn) => {
      txn.entries.forEach((entry) => {
        if (entry.entryType === "DEBIT") totals.totalDebits += entry.amount;
        if (entry.entryType === "CREDIT") totals.totalCredits += entry.amount;
      });
      return totals;
    },
    { totalDebits: 0, totalCredits: 0 }
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Loading your ledger...</div>;
  return (
    <div className='min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased'>
      <div className='flex flex-1 overflow-hidden'>
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
              <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => {
                router
                  .push("/")
              }}>
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

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6">
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
          <div className="mainbody p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            {/* Top Welcome & Month Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
                <p className="text-sm text-slate-500">Live multi-account telemetry across All accounts.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                  Your Accounts are Automated!
                </span>
              </div>
            </div>
          </div>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">General Enteries</h1>
              <p className="text-sm text-gray-500 mt-1">Automated double-entry records from your invoices.</p>
            </div>
            <Link
              href="/invoices"
              className="px-5 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 transition shadow-sm"
            >
              ← Back to Invoices
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-500 font-medium animate-pulse">Loading ledger entries...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">No Entries Yet</h3>
              <p className="text-gray-500">Go back to Invoices and click "Automate Accounting" to generate entries.</p>
            </div>
          ) : (
            /* The Ledger Table Card */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">

                  {/* Table Header */}
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6 w-1/2">Account Description</th>
                      <th className="py-4 px-6 text-right w-1/4">Debit (Dr)</th>
                      <th className="py-4 px-6 text-right w-1/4">Credit (Cr)</th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  {transactions.map((txn) => (
                    <tbody key={txn._id} className="border-b border-gray-100 last:border-0">
                      {/* Transaction Meta Row */}
                      <tr className="bg-blue-50/40">
                        <td colSpan="3" className="py-3 px-6 text-xs font-semibold text-blue-800 tracking-wide">
                          {new Date(txn.transactionDate).toLocaleDateString("en-IN", {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                          <span className="mx-2 text-blue-300">|</span>
                          {txn.description}
                        </td>
                      </tr>

                      {/* Transaction Entries (Debits & Credits) */}
                      {txn.entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                          <td className="py-3 px-6 text-sm">
                            <span className={entry.entryType === "CREDIT" ? "ml-10 text-gray-500" : "font-semibold text-gray-900"}>
                              {entry.accountName}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {entry.entryType === "DEBIT" ? `₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : ""}
                          </td>
                          <td className="py-3 px-6 text-right text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {entry.entryType === "CREDIT" ? `₹${entry.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ))}

                  {/* --- NEW: The Balancing Footer --- */}
                  <tfoot className="bg-slate-800 text-white">
                    <tr>
                      <td className="py-4 px-6 font-bold text-right uppercase tracking-wider text-sm text-slate-300">
                        Grand Total
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-400 text-lg border-x border-slate-700">
                        ₹{totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-400 text-lg">
                        ₹{totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {/* Tiny verification badge */}
                    {totalDebits === totalCredits && (
                      <tr>
                        <td colSpan="3" className="bg-emerald-900/50 py-1.5 text-center text-xs font-semibold text-emerald-300 tracking-widest">
                          ✓ BOOKS ARE BALANCED
                        </td>
                      </tr>
                    )}
                  </tfoot>

                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Account
