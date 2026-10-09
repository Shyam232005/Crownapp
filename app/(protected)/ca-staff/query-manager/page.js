"use client";
import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  FileSearch, CheckCircle2, AlertCircle, Loader2,
  LockKeyhole, Unlock, Receipt, Download, Building2
} from "lucide-react";
import { toast } from "sonner";

function ScrutinyContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams.get('client'); // The specific SME being audited

  const [isLocked, setIsLocked] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  
  const [vouchers, setVouchers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [clientName, setClientName] = useState("Unknown Client");

  // Fetch the Client's Name
  useEffect(() => {
      if (!clientId) return;
      const fetchClientName = async () => {
          try {
              const res = await fetch(`/api/ca-staff/clients`);
              const json = await res.json();
              const clients = Array.isArray(json.data) ? json.data : (json.data?.clients || []);
              const target = clients.find(c => (c.id || c._id) === clientId);
              if (target) setClientName(target.companyName || target.name);
          } catch (e) {
              console.error("Failed to load client name");
          }
      };
      fetchClientName();
  }, [clientId]);

  // 1. Serverless Polling: Checks the Vault Status
  useEffect(() => {
    if (!clientId) return;

    const checkVaultStatus = async () => {
      if (isLocked) {
        try {
          const res = await fetch(`/api/ca/vault-status?clientId=${clientId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "Unlocked") {
              setIsLocked(false);
              fetchScrutinyVouchers();
            } else if (data.status === "Requested") {
                setIsRequesting(true);
            }
          }
        } catch (error) {
          console.error("Failed to poll vault status:", error);
        }
      }
    };

    checkVaultStatus();
    const interval = setInterval(checkVaultStatus, 4000);
    return () => clearInterval(interval);
  }, [isLocked, clientId]); 

  const requestDataAccess = async () => {
    if (!clientId) return toast.error("No client selected");
    
    setIsRequesting(true);
    const loadingToast = toast.loading("Sending access request...");
    
    try {
      const res = await fetch("/api/ca/vault-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            clientId, 
            action: "REQUEST_ACCESS", 
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }) 
        })
      });
      
      if (!res.ok) throw new Error("Failed to send request");
      toast.success("Request sent securely to Owner!", { id: loadingToast });
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
      setIsRequesting(false); 
    }
  };

  const fetchScrutinyVouchers = async () => {
    if (!clientId) return;
    setIsLoadingData(true);
    
    try {
      const res = await fetch(`/api/ca-staff/vouchers`);
      if (res.ok) {
        const json = await res.json();
        const allData = json.data || [];
        setVouchers(allData.filter(v => (v.companyId?._id || v.companyId) === clientId));
      }
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
      toast.error("Failed to load ledger data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAction = async (voucherId, actionType) => {
      const loadingToast = toast.loading(`${actionType === 'APPROVED' ? 'Verifying' : 'Raising query'}...`);
      try {
          const res = await fetch('/api/ca-staff/vouchers', {
            method: 'PATCH',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId: voucherId, status: actionType })
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to update voucher status");
          }
          
          setVouchers(prev => prev.filter(v => v._id !== voucherId));
          toast.success(`Voucher updated successfully!`, { id: loadingToast });
      } catch (error) {
          toast.error(error.message || "Failed to update voucher status", { id: loadingToast });
      }
  };

  if (!clientId) {
      return (
          <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
              <h2 className="text-xl font-black text-slate-800">No Client Selected</h2>
              <p className="text-sm font-medium text-slate-500 max-w-sm mt-2">
                  Please go back to the Client Directory and select a specific business to begin scrutinizing their vouchers.
              </p>
          </div>
      );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24 space-y-6">
      {/* HEADER */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSearch className="w-6 h-6 text-indigo-600" /> Voucher Scrutiny Queue
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Audit approved client entries before generating tax drafts or exporting to Tally.
          </p>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Client: {clientName}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLocked ? (
          /* 🔴 LOCKED STATE */
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center min-h-[500px]"
          >
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 relative">
              <LockKeyhole className="w-10 h-10 text-slate-400" />
              {isRequesting && (
                <span className="absolute top-0 right-0 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Data Vault is Locked</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
              Due to strict data privacy policies, you must request real-time access from {clientName} to view this month's ledger.
            </p>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={requestDataAccess}
              disabled={isRequesting}
              className={`px-8 py-4 rounded-xl text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 ${isRequesting
                ? 'bg-amber-100 text-amber-700 shadow-amber-100'
                : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'
                }`}
            >
              {isRequesting ? <><Loader2 className="w-5 h-5 animate-spin" /> Waiting for Owner Approval...</> : <><Unlock className="w-5 h-5" /> Request Access</>}
            </motion.button>
          </motion.div>

        ) : (
          /* 🟢 UNLOCKED STATE */
          <motion.div
            key="unlocked"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col"
          >
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-black text-emerald-800">Secure connection established. Data unlocked by owner.</span>
            </div>

            {isLoadingData ? (
              <div className="p-6 divide-y divide-slate-100">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="py-4 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-slate-100 rounded"></div>
                        <div className="h-3 w-24 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 w-24 bg-slate-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : vouchers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
                <h4 className="text-base font-black text-slate-800 mb-1">Queue is Clear</h4>
                <p className="text-sm font-medium text-slate-500 max-w-sm">
                  There are no pending vouchers requiring your scrutiny right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence>
                    {vouchers.map((voucher) => (
                    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={voucher._id} className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">

                        <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm sm:text-base font-black text-slate-900">
                                {voucher.metadata?.vendorName || voucher.metadata?.customerName || "Internal Entry"}
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                {voucher.type}
                            </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mb-2">₹{voucher.totalAmount?.toLocaleString('en-IN')}</p>

                            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                            {voucher.metadata?.invoiceNumber && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">Bill: {voucher.metadata.invoiceNumber}</span>}
                            {voucher.metadata?.gstin && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">GST: {voucher.metadata.gstin}</span>}
                            {voucher.transactionDate && <span>Date: {new Date(voucher.transactionDate).toLocaleDateString("en-IN")}</span>}
                            </div>
                        </div>
                        </div>

                        <div className="flex items-center gap-3 w-full lg:w-auto border-t border-slate-100 lg:border-0 pt-4 lg:pt-0">
                        <button 
                            onClick={() => handleAction(voucher._id, 'QUERY_RAISED')}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-colors border border-slate-200"
                        >
                            <AlertCircle className="w-4 h-4" /> Raise Query
                        </button>
                        <button 
                            onClick={() => handleAction(voucher._id, 'APPROVED')}
                            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Verify
                        </button>
                        </div>

                    </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ScrutinyQueuePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading Scrutiny Workspace...</div>}>
            <ScrutinyContent />
        </Suspense>
    );
}