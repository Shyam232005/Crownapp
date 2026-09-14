"use client"
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
const Calendarpage = () => {
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
  useEffect(() => {
    // ✅ update activeTab whenever URL changes
    const current = navItems.find((item) => item.path === pathname);
    if (current) setActiveTab(current.label);
  }, [pathname]);

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
           </main>
         </div>
       </div>
  )
}

export default Calendarpage
