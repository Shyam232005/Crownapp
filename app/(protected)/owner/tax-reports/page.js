"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Download, Filter, CheckCircle2, 
  AlertCircle, Loader2, Inbox 
} from "lucide-react";

export default function TaxReportsUI() {
  // ✨ FIX: State setup for API integration (Zero-State by default)
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState([]);

  // ✨ Mock API Call
  useEffect(() => {
    const fetchReports = async () => {
      // Later: const res = await fetch('/api/owner/tax-reports');
      setTimeout(() => {
        // True zero-state for a new business owner
        setReports([]);
        setIsLoading(false);
      }, 800);
    };
    fetchReports();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Tax & Reports
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Access your GST summaries and compliance documents.
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
          <Filter className="w-4 h-4" /> Filter Year
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-black text-slate-800">GST Filing History</h2>
        </div>
        
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-bold">Loading your tax records...</p>
            </div>
          ) : reports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {reports.map((report, idx) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={report.id} 
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.status === 'Filed' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                        {report.status === 'Filed' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <AlertCircle className="w-6 h-6 text-amber-500" />}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{report.month}</h4>
                        <div className="flex gap-2 items-center mt-1">
                          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{report.type}</span>
                          <span className="text-xs font-medium text-slate-500">{report.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tax Liability</p>
                        <p className="text-sm font-black text-slate-900">₹{report.liability.toLocaleString("en-IN")}</p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                        <Download className="w-4 h-4" /> Report
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            // ✨ FIX: Zero-State UI for empty tax reports
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-base font-black text-slate-800 mb-1">No Tax Reports Found</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                Your CA hasn't uploaded any GST summaries or compliance documents for your business yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}