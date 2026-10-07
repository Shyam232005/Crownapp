"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, XCircle, Clock, Receipt, 
  Loader2, IndianRupee, ShieldCheck, CheckSquare, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function ApprovalsQueueUI() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING or REVIEWED

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        // Fetch all transactions for this company
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

  // Filter logic based on our strict RBAC statuses
  const pendingQueue = transactions.filter(tx => tx.status === "PENDING_OWNER_APPROVAL" || tx.status === "PENDING");
  
  // Anything that has moved past the owner (to the CA, or rejected)
  const reviewedQueue = transactions.filter(tx => 
    tx.status === "PENDING_CA_REVIEW" || 
    tx.status === "APPROVED" || 
    tx.status === "EXPORTED" || 
    tx.status === "REJECTED"
  );

  const displayList = activeTab === "PENDING" ? pendingQueue : reviewedQueue;

  const handleAction = async (id, actionType) => {
    // actionType: 'APPROVE' or 'REJECT'
    const loadingToast = toast.loading(`${actionType === 'APPROVE' ? 'Approving' : 'Rejecting'} transaction...`);
    
    try {
      const res = await fetch('/api/owner/transactions/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id, action: actionType })
      });

      if (res.ok) {
        toast.success(`Transaction ${actionType === 'APPROVE' ? 'Sent to CA!' : 'Rejected'}`, { id: loadingToast });
        
        // Update UI instantly without reloading
        const newStatus = actionType === 'APPROVE' ? 'PENDING_CA_REVIEW' : 'REJECTED';
        setTransactions(prev => prev.map(tx => 
          tx._id === id ? { ...tx, status: newStatus } : tx
        ));
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-indigo-600" /> Approval Queue
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Review employee submissions. Approved entries are securely routed to your CA's audit dashboard.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-slate-100 pb-4">
        <button
          onClick={() => setActiveTab("PENDING")}
          className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
            activeTab === "PENDING" ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          {activeTab === "PENDING" && (
            <motion.div layoutId="approvalTabIndicator" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />
          )}
          Requires Review 
          {pendingQueue.length > 0 && (
            <span className="bg-amber-100 text-amber-600 px-2 py-0.5 rounded-md text-[10px]">{pendingQueue.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("REVIEWED")}
          className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
            activeTab === "REVIEWED" ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          {activeTab === "REVIEWED" && (
            <motion.div layoutId="approvalTabIndicator" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />
          )}
          Past Decisions
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
            <p className="text-sm font-bold">Loading queue...</p>
          </div>
        ) : displayList.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${activeTab === 'PENDING' ? 'bg-amber-50' : 'bg-slate-50'}`}>
              <CheckSquare className={`w-8 h-8 ${activeTab === 'PENDING' ? 'text-amber-300' : 'text-slate-300'}`} />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">
              {activeTab === "PENDING" ? "Inbox Zero!" : "No History"}
            </h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
              {activeTab === "PENDING" 
                ? "Your employees haven't submitted any new entries. You're all caught up."
                : "You haven't approved or rejected any transactions yet."}
            </p>
          </motion.div>
        ) : (
          <div className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {displayList.map((item) => (
                <motion.div 
                  layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={item._id} 
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border ${
                      item.type === 'SALES' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      item.type === 'PURCHASE' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                      'bg-orange-50 border-orange-100 text-orange-600'
                    }`}>
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                        {item.metadata?.vendorName || item.metadata?.customerName || "Internal Entry"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.type}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Value</p>
                      <p className="text-lg font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" /> {item.totalAmount?.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {/* Actions Panel */}
                    {activeTab === "PENDING" ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleAction(item._id, 'REJECT')}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
                          title="Reject"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleAction(item._id, 'APPROVE')}
                          className="px-4 h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end w-32">
                        <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg ${
                          item.status === 'REJECTED' ? 'bg-rose-100 text-rose-600' :
                          item.status === 'PENDING_CA_REVIEW' ? 'bg-amber-100 text-amber-600' :
                          'bg-emerald-100 text-emerald-600'
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