"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Landmark, Check, X, FileSpreadsheet, 
  ArrowRightLeft, Loader2, Inbox, Building2
} from "lucide-react";
import toast from "react-hot-toast";

export default function BankRecoUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [recoData, setRecoData] = useState([]);
  
  // Client Selection States
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  
  const fileInputRef = useRef(null);

  // Initial load of clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/ca/clients");
        if (res.ok) {
          const json = await res.json();
          const clientList = json.data.clients || [];
          setClients(clientList);
          if (clientList.length > 0) {
            setSelectedClient(clientList[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch clients", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch reco data whenever the selected client changes
  useEffect(() => {
    if (!selectedClient) return;

    const fetchRecoData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/ca/bank-reco?clientId=${selectedClient}`);
        if (res.ok) {
          const json = await res.json();
          setRecoData(json.data || []);
        } else {
            throw new Error("Failed to load data");
        }
      } catch (error) {
        console.error("Failed to fetch bank reconciliation:", error);
        toast.error("Failed to load reconciliation data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecoData();
  }, [selectedClient]);

  const handleStatementUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedClient) {
        toast.error("Please select a client first.");
        return;
    }

    const loadingToast = toast.loading("Processing bank statement...");
    setIsUploading(true);

    try {
      // Simulate statement parsing and creating a mock unmatched transaction
      const payload = {
        companyId: selectedClient,
        desc: file.name.includes("hdfc") ? "HDFC Bank Statement Entry" : "Bank Transfer - Vendor",
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        bankAmt: Math.floor(Math.random() * 50000) + 1000, // Randomize amount for mock demo
        match: false,
        bookAmt: null
      };

      const res = await fetch('/api/ca/bank-reco', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to process statement");

      toast.success("Statement processed successfully!", { id: loadingToast });
      
      // Refresh the table
      const refreshRes = await fetch(`/api/ca/bank-reco?clientId=${selectedClient}`);
      const json = await refreshRes.json();
      setRecoData(json.data || []);

    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-600" /> Bank Reconciliation
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Match bank statement transactions with software ledger entries.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all outline-none"
            >
              {clients.length === 0 && <option value="">No clients...</option>}
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.companyName}</option>
              ))}
            </select>
          </div>

          <input 
            type="file" 
            accept=".csv,.pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleStatementUpload} 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading || clients.length === 0}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto shrink-0"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isUploading ? "Processing..." : "Upload Statement"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-4">
          <div className="col-span-4 text-xs font-bold text-slate-400 uppercase">Bank Statement (Parsed)</div>
          <div className="col-span-2 text-center text-xs font-bold text-slate-400 uppercase"><ArrowRightLeft className="w-4 h-4 mx-auto" /></div>
          <div className="col-span-4 text-xs font-bold text-slate-400 uppercase">FineOps Ledger (Books)</div>
          <div className="col-span-2 text-right text-xs font-bold text-slate-400 uppercase">Status</div>
        </div>
        
        <div className="divide-y divide-slate-100 flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-bold">Loading reconciliation data...</p>
            </div>
          ) : recoData.length > 0 ? (
            <AnimatePresence>
              {recoData.map((row) => (
                <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={row._id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors">
                  {/* Bank Side */}
                  <div className="col-span-4">
                    <p className="text-sm font-black text-slate-900">{row.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400">{row.date}</span>
                      <span className={`text-xs font-black ${row.bankAmt > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                        ₹{Math.abs(row.bankAmt).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      {row.match ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />}
                    </div>
                  </div>
                  
                  {/* Books Side */}
                  <div className="col-span-4">
                    {row.bookAmt !== null ? (
                      <div>
                        <p className="text-sm font-black text-slate-900">{row.desc} (Auto-Matched)</p>
                        <span className={`text-xs font-black mt-1 ${row.bookAmt > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          ₹{Math.abs(row.bookAmt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 border border-dashed border-rose-200 bg-rose-50 rounded-lg text-rose-600 text-xs font-bold inline-block">
                        Missing Entry in Books
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="col-span-2 text-right">
                    {!row.match && (
                      <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-colors">
                        Add Entry
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-base font-black text-slate-800 mb-1">No Statements Uploaded</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                Upload a client's bank statement CSV/PDF to start the auto-matching process against the ledger.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}