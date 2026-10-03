"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch, CheckCircle2, AlertCircle, Loader2,
  LockKeyhole, Unlock, Receipt, Download, Building2
} from "lucide-react";

export default function CaScrutinyQueue() {
  const [isLocked, setIsLocked] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const [vouchers, setVouchers] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Serverless Polling: Checks the Vault Status every 3 seconds
  useEffect(() => {
    const checkVaultStatus = async () => {
      if (isLocked) {
        try {
          const res = await fetch("/api/vault-status");
          if (res.ok) {
            const data = await res.json();
            if (data.status === "Unlocked") {
              setIsLocked(false);
              fetchApprovedVouchers();
            }
          }
        } catch (error) {
          console.error("Failed to poll vault status:", error);
        }
      }
    };

    const interval = setInterval(checkVaultStatus, 3000);
    return () => clearInterval(interval);
  }, [isLocked]); // Re-run effect if lock state changes

  const requestDataAccess = async () => {
    setIsRequesting(true);
    try {
      // 2. Serverless Request: Updates the database status instead of emitting a socket event
      await fetch("/api/vault-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Requested" })
      });
    } catch (error) {
      console.error("Failed to request access", error);
      setIsRequesting(false); // Reset on failure so they can try again
    }
  };

  const fetchApprovedVouchers = async () => {
    setIsLoadingData(true);
    try {
      // Fetch ONLY Approved submissions for Scrutiny
      const res = await fetch("/api/submissions?status=Approved");
      if (res.ok) {
        const json = await res.json();
        setVouchers(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch vouchers", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Fetch the export payload from our API
      const res = await fetch("/api/ca-staff/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "client-temp-123", // In production, pass the selected client ID
          period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          format: "Tally XML"
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Export failed");

      // 2. Map the JSON data into a Tally-compliant XML structure
      let xmlString = `<?xml version="1.0" encoding="utf-8"?>\n<ENVELOPE>\n  <HEADER>\n    <TALLYREQUEST>Import Data</TALLYREQUEST>\n  </HEADER>\n  <BODY>\n    <IMPORTDATA>\n      <REQUESTDATA>\n`;

      result.data.forEach((voucher, index) => {
        // Format date to YYYYMMDD for Tally
        const rawDate = voucher.billDate || voucher.createdAt.split('T')[0];
        const formattedDate = rawDate.replace(/-/g, '');

        xmlString += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
        xmlString += `          <VOUCHER VCHTYPE="${voucher.type}" ACTION="Create">\n`;
        xmlString += `            <DATE>${formattedDate}</DATE>\n`;
        xmlString += `            <PARTYLEDGERNAME>${voucher.partyName || 'Internal Expense'}</PARTYLEDGERNAME>\n`;
        xmlString += `            <VOUCHERNUMBER>${voucher.billNumber || `VCH-${index + 1}`}</VOUCHERNUMBER>\n`;
        xmlString += `            <AMOUNT>-${voucher.amount}</AMOUNT>\n`; // Negative amount for expenses in standard accounting
        xmlString += `            <NARRATION>${voucher.description}</NARRATION>\n`;
        xmlString += `          </VOUCHER>\n`;
        xmlString += `        </TALLYMESSAGE>\n`;
      });

      xmlString += `      </REQUESTDATA>\n    </IMPORTDATA>\n  </BODY>\n</ENVELOPE>`;

      // 3. Create a Blob and trigger the browser download
      const blob = new Blob([xmlString], { type: "application/xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `FineOps_Tally_Export_${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsExporting(false);
    }
  };

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

        {/* Client Selector (Mocked for UI) */}
        {!isLocked && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Client: FineOps Technologies</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isLocked ? (
          /* 🔴 LOCKED STATE: Awaiting Owner Permission */
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
              Due to strict data privacy policies, you must request real-time access from the business owner to view this month's ledger.
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

          /* 🟢 UNLOCKED STATE: Showing Approved Vouchers */
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
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                <p className="text-sm font-bold">Extracting secure ledger...</p>
              </div>
            ) : vouchers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="text-base font-black text-slate-800 mb-1">No Approved Vouchers</h4>
                <p className="text-sm font-medium text-slate-500 max-w-sm">
                  The client has not approved any entries yet for this period.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {vouchers.map((voucher) => (
                  <div key={voucher._id} className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50 transition-colors">

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Receipt className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-black text-slate-900">
                            {voucher.partyName || "Internal Entry"}
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                            {voucher.type}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">₹{voucher.amount.toLocaleString('en-IN')}</p>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                          {voucher.billNumber && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">Bill: {voucher.billNumber}</span>}
                          {voucher.gstin && <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-mono">GST: {voucher.gstin}</span>}
                          {voucher.billDate && <span>Date: {voucher.billDate}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto border-t border-slate-100 lg:border-0 pt-4 lg:pt-0">
                      <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-white text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
                        <AlertCircle className="w-4 h-4" /> Raise Query
                      </button>
                      <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-100">
                        <CheckCircle2 className="w-4 h-4" /> Mark Verified
                      </button>
                    </div>

                  </div>
                ))}

                {/* EXPORT ACTION BAR */}
                <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleExport}
                    disabled={isExporting || vouchers.length === 0}
                    className={`px-6 py-3 rounded-xl text-sm font-black shadow-lg flex items-center gap-2 transition-all ${isExporting
                        ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {isExporting ? "Generating XML..." : "Export to Tally XML"}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}