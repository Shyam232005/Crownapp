"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CheckCircle2, MessageSquare, AlertCircle, 
  FileText, IndianRupee, Filter, Loader2, Inbox,
  ShieldCheck, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function VoucherScrutinyUI() {
  const [activeTab, setActiveTab] = useState("PENDING_CA_REVIEW");
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/ca-staff/vouchers');
      if (res.ok) {
        const json = await res.json();
        setVouchers(json.data || []);
      } else {
        throw new Error("Failed to load scrutiny queue");
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      toast.error("Network error while fetching vouchers");
    } finally {
      setIsLoading(false);
    }
  };

  const updateVoucherStatus = async (id, newStatus) => {
    const toastId = toast.loading("Updating voucher state...");
    try {
      const res = await fetch('/api/ca-staff/vouchers', {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, status: newStatus })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update status.");
      }
      
      toast.success(newStatus === "APPROVED" ? "Voucher Verified for Tally Export!" : "Query Logged & Sent to Owner", { id: toastId });
      if (newStatus === "APPROVED") {
        try {
          confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
        } catch (e) {}
      }
      setVouchers(vouchers.map(v => v._id === id ? { ...v, status: newStatus } : v));
      
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const filteredVouchers = vouchers.filter(v => activeTab === "ALL" || v.status === activeTab || (activeTab === "APPROVED" && v.status === "EXPORTED"));

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black">
              <Search className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Global Scrutiny Pipeline
            </h1>
          </motion.div>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 pl-10.5">
            Audit client-approved vouchers, verify Input Tax Credit, and prepare clean ERP records.
          </p>
        </div>
      </div>

      {/* Tabs with Shared Layout Morphing */}
      <div className="flex gap-2 mb-6 bg-slate-100/70 p-1.5 rounded-2xl w-fit border border-slate-200/50 overflow-x-auto scrollbar-hide">
        {[
          { id: "PENDING_CA_REVIEW", label: "Pending Scrutiny" }, 
          { id: "QUERY_RAISED", label: "Queries Raised" }, 
          { id: "APPROVED", label: "Verified for Tally" }, 
          { id: "ALL", label: "All Records" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id ? "text-indigo-900" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="scrutinyTab" 
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/40 -z-10" 
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrutiny Data Table Container */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden min-h-[420px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="p-5">Voucher Details</th>
                <th className="p-5">Client SME</th>
                <th className="p-5">Total Value</th>
                <th className="p-5 text-center">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {isLoading ? (
                /* Shimmering Skeletons */
                <>
                  {[1, 2, 3, 4].map((n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="p-5">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 bg-slate-200/60 rounded-xl" />
                          <div className="space-y-2">
                            <div className="h-4 w-40 bg-slate-200/60 rounded-md" />
                            <div className="h-3 w-24 bg-slate-100 rounded-md" />
                          </div>
                        </div>
                      </td>
                      <td className="p-5"><div className="h-4 w-32 bg-slate-100 rounded-md" /></td>
                      <td className="p-5"><div className="h-4 w-24 bg-slate-100 rounded-md" /></td>
                      <td className="p-5 text-center"><div className="h-9 w-28 bg-slate-100 rounded-xl mx-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : filteredVouchers.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredVouchers.map((voucher) => (
                    <motion.tr 
                      layout 
                      initial={{ opacity: 0, y: 15 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.94, height: 0, transition: { duration: 0.25 } }} 
                      key={voucher._id} 
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="p-5">
                        <div className="flex items-start gap-3.5">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                            voucher.type === 'SALES' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-600' :
                            voucher.type === 'PURCHASE' ? 'bg-indigo-50 border-indigo-200/60 text-indigo-600' :
                            'bg-amber-50 border-amber-200/60 text-amber-600'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">
                              {voucher.metadata?.vendorName || voucher.metadata?.customerName || voucher.metadata?.payeeName || "Internal Entry"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {voucher.type}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-400">
                                {new Date(voucher.transactionDate || voucher.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-black text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/50">
                          {voucher.companyId?.companyName || "SME Client"}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-black text-slate-900 flex items-center font-mono">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" />{voucher.totalAmount?.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-5">
                        {voucher.status === "PENDING_CA_REVIEW" ? (
                          <div className="flex items-center justify-center gap-2">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateVoucherStatus(voucher._id, "APPROVED")}
                              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateVoucherStatus(voucher._id, "QUERY_RAISED")}
                              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-amber-200/60 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" /> Query
                            </motion.button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                              voucher.status === 'APPROVED' || voucher.status === 'EXPORTED' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {voucher.status === 'APPROVED' || voucher.status === 'EXPORTED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                              {voucher.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                /* Organic Zero State */
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-slate-50/60 via-indigo-50/20 to-slate-50/60 p-8 rounded-3xl">
                      <motion.div 
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 bg-white border border-slate-200/80 rounded-3xl flex items-center justify-center mb-4 shadow-sm"
                      >
                        <Inbox className="w-7 h-7 text-slate-400 animate-pulse" />
                      </motion.div>
                      <h4 className="text-base font-black text-slate-800 tracking-tight mb-1">Queue is Clear</h4>
                      <p className="text-xs font-semibold text-slate-400 max-w-sm leading-relaxed">
                        {activeTab === "PENDING_CA_REVIEW" ? "No pending vouchers waiting for scrutiny. Everything is verified or queried." :
                         activeTab === "QUERY_RAISED" ? "You have no outstanding queries waiting for client responses." :
                         activeTab === "APPROVED" ? "No vouchers have been finalized for export yet." :
                         "No vouchers found matching your filter criteria."}
                      </p>
                    </div>
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