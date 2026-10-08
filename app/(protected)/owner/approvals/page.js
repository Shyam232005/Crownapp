"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, XCircle, Clock, Receipt, 
  Loader2, IndianRupee, ShieldCheck, CheckSquare, X,
  Sparkles, CheckCheck, Inbox
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function ApprovalsQueueUI() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING or REVIEWED

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/owner/transactions');
        if (res.ok) {
          const json = await res.json();
          setTransactions(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch approval queue:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQueue();
  }, []);

  // Filter logic based on strict RBAC statuses
  const pendingQueue = transactions.filter(tx => tx.status === "PENDING_OWNER_APPROVAL" || tx.status === "PENDING");
  
  const reviewedQueue = transactions.filter(tx => 
    tx.status === "PENDING_CA_REVIEW" || 
    tx.status === "APPROVED" || 
    tx.status === "EXPORTED" || 
    tx.status === "REJECTED"
  );

  const displayList = activeTab === "PENDING" ? pendingQueue : reviewedQueue;

  const handleAction = async (id, actionType) => {
    const toastId = toast.loading(`${actionType === 'APPROVE' ? 'Approving' : 'Rejecting'} voucher...`);
    
    try {
      const res = await fetch('/api/owner/transactions/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, action: actionType })
      });

      if (res.ok) {
        toast.success(`Transaction ${actionType === 'APPROVE' ? 'Approved & Sent to CA Vault!' : 'Rejected'}`, { id: toastId });
        if (actionType === 'APPROVE') {
          try {
            confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
          } catch (e) {}
        }
        
        // Update UI state with smooth morphing collapse
        const newStatus = actionType === 'APPROVE' ? 'PENDING_CA_REVIEW' : 'REJECTED';
        setTransactions(prev => prev.map(tx => 
          tx._id === id ? { ...tx, status: newStatus } : tx
        ));
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error(error.message || 'Action failed', { id: toastId });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Owner Approval Queue
          </h1>
        </motion.div>
        <p className="text-xs sm:text-sm font-semibold text-slate-400 pl-10.5">
          Review employee submissions. Approved entries atomically write double-entry rows and route to your CA.
        </p>
      </div>

      {/* Tabs with Shared Layout Morphing */}
      <div className="flex gap-2 mb-6 bg-slate-100/70 p-1.5 rounded-2xl w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "PENDING" ? "text-indigo-900" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {activeTab === "PENDING" && (
            <motion.div 
              layoutId="approvalTabIndicator" 
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/40" 
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            Requires Review 
            {pendingQueue.length > 0 && (
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                {pendingQueue.length}
              </span>
            )}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("REVIEWED")}
          className={`relative px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "REVIEWED" ? "text-indigo-900" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {activeTab === "REVIEWED" && (
            <motion.div 
              layoutId="approvalTabIndicator" 
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/40" 
            />
          )}
          <span className="relative z-10">Past Decisions</span>
        </button>
      </div>

      {/* Content Container */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden min-h-[420px] flex flex-col">
        {isLoading ? (
          /* Shimmering Skeletons */
          <div className="p-6 divide-y divide-slate-100/60">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="py-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200/60 rounded-2xl" />
                  <div className="space-y-2">
                    <div className="h-4 w-44 bg-slate-200/60 rounded-md" />
                    <div className="h-3 w-28 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-20 bg-slate-100 rounded-lg" />
                  <div className="h-10 w-24 bg-slate-200/60 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          /* Organic Zero State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gradient-to-br from-slate-50/60 via-indigo-50/20 to-slate-50/60"
          >
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-sm ${
                activeTab === 'PENDING' ? 'bg-amber-50 border border-amber-100/80 text-amber-500' : 'bg-slate-50 border border-slate-200/80 text-slate-400'
              }`}
            >
              {activeTab === 'PENDING' ? (
                <Inbox className="w-8 h-8 animate-pulse" />
              ) : (
                <CheckSquare className="w-8 h-8 text-slate-400" />
              )}
            </motion.div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1">
              {activeTab === "PENDING" ? "Inbox Zero! Everything Approved" : "No Historical Decisions"}
            </h3>
            <p className="text-xs font-semibold text-slate-400 max-w-sm mx-auto leading-relaxed">
              {activeTab === "PENDING" 
                ? "Your staff members have no pending submissions requiring owner sign-off. All historical vouchers are synced."
                : "You have not processed or rejected any transactions in this queue yet."}
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {displayList.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, height: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.3 } }}
                  key={item._id} 
                  className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50/80 transition-colors gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 ${
                      item.type === 'SALES' ? 'bg-emerald-50 border-emerald-200/60 text-emerald-600' :
                      item.type === 'PURCHASE' ? 'bg-indigo-50 border-indigo-200/60 text-indigo-600' :
                      'bg-amber-50 border-amber-200/60 text-amber-600'
                    }`}>
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight mb-1">
                        {item.metadata?.vendorName || item.metadata?.customerName || item.metadata?.payeeName || "Internal Entry"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.type}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Value</p>
                      <p className="text-lg font-black text-slate-900 flex items-center font-mono">
                        <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" /> {Number(item.amount ?? item.totalAmount ?? 0).toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Magnetic Tactile Actions */}
                    {activeTab === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAction(item._id, 'REJECT')}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer border border-rose-100"
                          title="Reject Voucher"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleAction(item._id, 'APPROVE')}
                          className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </motion.button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end w-36">
                        <span className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-xl border ${
                          item.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          item.status === 'PENDING_CA_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}