"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, CheckCircle2, Clock, Loader2, Inbox } from "lucide-react";

export default function GSTSummaryUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [clientsGST, setClientsGST] = useState([]);

  useEffect(() => {
    const fetchGSTData = async () => {
      try {
        const res = await fetch('/api/ca/gst-summary');
        if (res.ok) {
          const json = await res.json();
          setClientsGST(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch GST data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGSTData();
  }, []);

  const handleDownloadMaster = () => {
    if (clientsGST.length === 0) {
      alert("No GST data available to download.");
      return;
    }

    const headers = ["Client Name", "Est. Turnover", "GSTR-1 Status", "GSTR-3B Status"];
    const csvRows = [
      headers.join(","),
      ...clientsGST.map(c => `"${c.name}","${c.turnover}","${c.gstr1}","${c.gstr3b}"`)
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "FineOps_GST_Master_Summary_Sept_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> GST Summary (Sept 2026)
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Track return filing status for all active clients.</p>
        </div>
        <button 
          onClick={handleDownloadMaster}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Download Master Report
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="w-full text-left border-collapse min-w-[700px] flex-1">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Client Name</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Est. Turnover</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">GSTR-1 Status</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">GSTR-3B Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 h-full">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                      <p className="text-sm font-bold">Loading GST statuses...</p>
                    </div>
                  </td>
                </tr>
              ) : clientsGST.length > 0 ? (
                <AnimatePresence>
                  {clientsGST.map((client, idx) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-black text-slate-900 text-sm">{client.name}</td>
                      <td className="p-5 text-sm font-bold text-slate-600">{client.turnover}</td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          client.gstr1 === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {client.gstr1 === 'Filed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {client.gstr1}
                        </span>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          client.gstr3b === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {client.gstr3b === 'Filed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {client.gstr3b}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-base font-black text-slate-800 mb-1">No GST Data Available</h4>
                      <p className="text-sm font-medium text-slate-500 max-w-sm">
                        You haven't assigned any active clients or there is no return filing data for this month.
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