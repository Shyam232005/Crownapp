"use client"
import React, { useState, useEffect, useRef } from 'react'
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

const Invoices = () => {
  const [initialLoad, setInitialLoad] = useState(true)
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null)
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

  const handlelogout = async (e) => {
    signOut({ callbackUrl: "/" })
  }

  const grandTotal = invoices.reduce((sum, invoice) => {
    const cleanAmount = String(invoice.Total || "0").replace(/[^0-9.-]+/g, "");
    return sum + (parseFloat(cleanAmount) || 0);
  }, 0);

  useEffect(() => {
    const current = navItems.find((item) => item.path === pathname);
    if (current) setActiveTab(current.label);
  }, [pathname]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, etc).");
      e.target.value = "";
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/invoices", {
        method: "POST",
        body: formData,
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        const errorMessage = result?.error || "Failed to scan invoice. Please try again.";
        console.log("Scanning error:", errorMessage);
        alert(errorMessage);
        return;
      }

      setInvoices((prev) => [result.data, ...prev]);

    } catch (err) {
      console.log("Network or unexpected error:", err);
      alert("A network error occurred. Please check your connection.");
    } finally {
      setLoading(false);

      e.target.value = "";
    }
  }

  function handleButtonClick() {
    fileInputRef.current.click()
  }

  useEffect(() => {
    async function fetchSavedInvoices() {
      try {
        const res = await fetch("/api/invoices");
        const result = await res.json();

        if (result.success) {
          setInvoices(result.data);
        }
      } catch (error) {
        console.error("Error fetching from database:", error);
      } finally {
        setInitialLoad(false);
      }
    }

    fetchSavedInvoices();
  }, [])

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/invoices", {
        method: "POST",
        body: formData,
      });

      const result = await res.json().catch(() => null);

      if (!res.ok || !result?.success) {
        alert(result?.error || "Failed to scan invoice.");
        return;
      }

      setInvoices((prev) => [result.data, ...prev]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  return (
    <div className='min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col antialiased'>
      <div className='flex flex-1 overflow-hidden'>
        { }
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}

        { }
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}
        >
          <div>
            { }
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
              ><X size={20} />
              </button>
            </div>

            { }
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

          { }
          <div className="p-4 space-y-3">
            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-blue-600 font-medium transition cursor-pointer"
              onClick={handlelogout}>
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          { }
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

              { }
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
          {loading && (
            <div className="text-blue-500 font-medium text-center">
              Scanning invoice… please wait.... <p className='animate-spin'>⏳</p>
            </div>
          )}
          <div className="mainbody p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
            { }
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Invoices & Billing</h1>
                <p className="text-sm text-slate-500">Live Invoices and billing telemetry across All accounts.</p>
              </div>
              <div className="flex items-center gap-2 hover:scale-120 transition duration-1000">
                <span className="text-xs font-semibold text-slate-500 bg-blue-600 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm ">
                  <button className='cursor-pointer text-white' onClick={handleButtonClick}>+ Inovices</button>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </span>
              </div>
            </div>
          </div>
          {invoices.length > 0 && (
            <div className="space-y-6 mt-8 pb-10">

              { }
              <div className="bg-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg border border-emerald-500">
                <p className="text-emerald-100 uppercase tracking-wide text-sm font-semibold mb-1">
                  Total Amount Across All Invoices
                </p>
                <p className="text-4xl font-bold">
                  { }
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              { }

              <h3 className="text-xl font-bold text-gray-800 text-center mb-4">
                Scanned Invoices ({invoices.length})
              </h3>

              {invoices.map((merchant, index) => (
                <div
                  key={merchant._id || index}
                  className="max-w-md mx-auto w-full bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100"
                >
                  <div className="bg-blue-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold uppercase tracking-wider">
                      {merchant.merchant_name || "Unknown Merchant"}
                    </h2>
                    {merchant.merchant_phone && (
                      <p className="text-blue-100 mt-2 text-sm">
                        📞 {merchant.merchant_phone}
                      </p>
                    )}
                    {merchant.merchant_address && (
                      <p className="text-blue-100 mt-2 text-sm leading-relaxed">
                        {merchant.merchant_address}
                      </p>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Bill No</p>
                        <p className="font-semibold text-gray-800">{merchant.Bill_No || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Date</p>
                        <p className="font-semibold text-gray-800">{merchant.Bill_Date || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">GST No</p>
                        <p className="font-semibold text-gray-800">{merchant.GST_NO || "N/A"}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>CGST</span>
                        <span>{merchant.CGST ? `₹${merchant.CGST}` : "-"}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>SGST</span>
                        <span>{merchant.SGST ? `₹${merchant.SGST}` : "-"}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>IGST</span>
                        <span>{merchant.IGST ? `₹${merchant.IGST}` : "-"}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-gray-100">
                      <span className="text-gray-500 font-medium">Total Amount</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {merchant.Total ? `₹${merchant.Total}` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default Invoices
