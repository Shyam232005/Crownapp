"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, XCircle, Clock, FileText, 
  Filter, Receipt, CalendarRange, Loader2, IndianRupee, ListTodo, Building2, Calendar
} from "lucide-react";

let socket;

export default function ApprovalsQueue() {
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending"); 
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    socket = io();
    const fetchQueue = async () => {
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) setApprovals((await res.json()).data || []);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQueue();
    socket.on("owner-notification", (newSubmission) => setApprovals((prev) => [newSubmission, ...prev]));
    return () => { if (socket) socket.disconnect(); };
  }, []);

  const handleAction = async (id, newStatus) => {
    // Optimistic UI change -> Triggers Framer Motion layout shift automatically!
    setApprovals(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));

    try {
      await fetch(`/api/submissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      if (socket) socket.emit("status-update", { id, status: newStatus });
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const stats = {
    pendingCount: approvals.filter(a => a.status === "Pending").length,
    approvedCount: approvals.filter(a => a.status === "Approved").length, 
    pendingValue: approvals.filter(a => a.status === "Pending").reduce((acc, curr) => acc + (curr.amount || 0), 0)
  };

  const displayedApprovals = approvals
    .filter(item => item.status === activeTab)
    .filter(item => {
      if (activeFilter === "Expenses") return item.type.includes("Expense") || item.type.includes("Payment");
      return true;
    });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">Approvals & Payments</motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500">Review requests and manage vendor payments.</motion.p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Action Required", value: stats.pendingCount, icon: Clock, color: "amber", sub: "pending" },
          { label: "Pending Value", value: `₹${stats.pendingValue.toLocaleString("en-IN")}`, icon: Receipt, color: "indigo", sub: "total" },
          { label: "Total Approved", value: stats.approvedCount, icon: CheckCircle2, color: "emerald", sub: "items" }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-${stat.color}-500 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-full bg-${stat.color}-50 flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-3 mb-6 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-hide">
        {["Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {activeTab === tab && (
              <motion.div layoutId="activeTabIndicator" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />
            )}
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:gap-4 overflow-hidden p-1">
        {isLoading ? (
          <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : displayedApprovals.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              {activeTab === "Pending" ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> : <FileText className="w-8 h-8 text-slate-300" />}
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{activeTab === "Pending" ? "You're all caught up!" : `No ${activeTab} items yet.`}</h3>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {displayedApprovals.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -30, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={item._id} 
                className="w-full bg-white rounded-2xl border border-transparent hover:border-slate-200 shadow-sm hover:shadow-md p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between transition-shadow gap-4 md:gap-0"
              >
                <div className="flex items-start md:items-center gap-4 sm:gap-5">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-inner ${
                    item.type.includes('Expense') ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.type.includes('Expense') ? <Receipt className="w-6 h-6" /> : <ListTodo className="w-6 h-6" />}
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm sm:text-base font-black text-slate-900">{item.partyName || item.type}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                    </div>
                    
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mb-3">{item.description}</p>
                    
                    {(item.billNumber || item.gstin || item.billDate) && (
                      <div className="flex flex-wrap items-center gap-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100/60 inline-flex">
                        {item.billNumber && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                            <span>Bill: <span className="text-slate-900">{item.billNumber}</span></span>
                          </div>
                        )}
                        {item.gstin && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>GST: <span className="text-slate-900">{item.gstin}</span></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                  {item.amount > 0 && (
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Amount</p>
                      <p className="text-lg font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" /> {item.amount.toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                  
                  {item.status === "Pending" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(item._id, "Rejected")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white transition-colors">
                        <XCircle className="w-5 h-5" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(item._id, "Approved")} className="flex items-center gap-2 px-6 py-2 h-10 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </motion.button>
                    </div>
                  ) : (
                    <span className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {item.status === 'Approved' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {item.status}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}