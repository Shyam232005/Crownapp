"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldAlert, Search, FileText, CheckCircle2, 
  AlertTriangle, Clock, Upload,
  Loader2, Inbox
} from "lucide-react";

export default function AuditReportsUI() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [audits, setAudits] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ca/audits");
      if (res.ok) {
        const json = await res.json();
        setAudits(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch audits", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Convert file to Base64 for serverless storage
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result;
        
        const payload = {
          clientId: "owner-temp-123", // In production, select from a client dropdown
          clientName: "FineOps Technologies",
          period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
          reportType: file.type.includes("pdf") ? "Audit Report" : "Financial Chart",
          fileData: base64Data,
          status: "Clean (Verified)",
          issuesCount: 0
        };

        const res = await fetch("/api/ca/audits", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          fetchAudits(); // Refresh list to show new upload
        } else {
          alert("Failed to upload report.");
        }
        setIsUploading(false);
      };
    } catch (error) {
      console.error("Upload error:", error);
      setIsUploading(false);
    }
  };

  const filteredAudits = audits.filter(audit => 
    audit.clientName?.toLowerCase().includes(search.toLowerCase()) || 
    audit.period?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> Audit & Scrutiny Reports
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Review voucher scrutinies, finalize client audits, and upload financial charts.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..." 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all" 
            />
          </div>
          
          <input 
            type="file" 
            accept="image/*,.pdf" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleReportUpload} 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-colors disabled:opacity-50 shrink-0"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Upload Final Report"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-black text-slate-800">Ongoing & Completed Audits</h2>
        </div>
        
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-bold">Loading audit reports...</p>
            </div>
          ) : filteredAudits.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredAudits.map((audit) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    key={audit._id} 
                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        audit.status === 'Clean (Verified)' ? 'bg-emerald-50' : 
                        audit.status === 'Issues Found' ? 'bg-rose-50' : 'bg-amber-50'
                      }`}>
                        {audit.status === 'Clean (Verified)' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
                         audit.status === 'Issues Found' ? <AlertTriangle className="w-6 h-6 text-rose-500" /> : 
                         <Clock className="w-6 h-6 text-amber-500" />}
                      </div>
                      
                      <div>
                        <h4 className="text-base font-black text-slate-900">{audit.clientName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {audit.period}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            {audit.reportType}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Audit Status</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          audit.status === 'Clean (Verified)' ? 'bg-emerald-100 text-emerald-700' : 
                          audit.status === 'Issues Found' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {audit.status}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = audit.fileData;
                          link.download = `${audit.clientName}_${audit.period}_Report`;
                          link.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        <FileText className="w-4 h-4" /> Download
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-base font-black text-slate-800 mb-1">No Audits Found</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                {search ? "No audits match your current search filters." : "No client audits have been processed or finalized yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}