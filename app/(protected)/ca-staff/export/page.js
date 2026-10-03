"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  DownloadCloud, Filter, CheckCircle2, FileText, 
  FileSpreadsheet, Code, Loader2, Inbox 
} from "lucide-react";

export default function ExportDataUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [assignedClients, setAssignedClients] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      clientId: "",
      period: "September 2026",
      format: "xml"
    }
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/ca-staff/clients');
        if (res.ok) {
          const json = await res.json();
          setAssignedClients(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch assigned clients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const onSubmit = async (data) => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/ca-staff/export', { 
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
      });

      if (res.ok) {
        const json = await res.json();
        
        // Trigger browser download
        const blob = new Blob([json.fileData], { type: data.format === 'xml' ? 'application/xml' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", json.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert("Failed to generate export file.");
      }
    } catch (error) {
      alert("Network error during export.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <DownloadCloud className="w-6 h-6 text-indigo-600" /> Export Data[cite: 20]
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Download clean, scrutinized client data for offline processing[cite: 20].</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-black text-slate-800">Export Filters[cite: 20]</h2>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
            <p className="text-sm font-bold">Loading your client list...[cite: 20]</p>
          </div>
        ) : assignedClients.length > 0 ? (
          <form className="p-6 space-y-6 flex-1 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Client[cite: 20]</label>
                <select 
                  {...register("clientId", { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                  {assignedClients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data Period[cite: 20]</label>
                <select 
                  {...register("period", { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                  <option value="September 2026">September 2026[cite: 20]</option>
                  <option value="August 2026">August 2026[cite: 20]</option>
                  <option value="Q2 2026">Q2 (Jul - Sep 2026)[cite: 20]</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Export Format[cite: 20]</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" value="xml" {...register("format")} className="peer sr-only" defaultChecked />
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all hover:bg-slate-50">
                    <Code className="w-6 h-6 text-slate-600 peer-checked:text-indigo-600" />
                    <span className="text-sm font-bold text-slate-700">Tally XML[cite: 20]</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" value="xlsx" {...register("format")} className="peer sr-only" />
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 transition-all hover:bg-slate-50">
                    <FileSpreadsheet className="w-6 h-6 text-slate-600 peer-checked:text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">Excel (XLSX)[cite: 20]</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" value="csv" {...register("format")} className="peer sr-only" />
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:bg-slate-50">
                    <FileText className="w-6 h-6 text-slate-600 peer-checked:text-amber-600" />
                    <span className="text-sm font-bold text-slate-700">CSV Standard[cite: 20]</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Export Generated Successfully![cite: 20]
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={isExporting}
                className={`w-full sm:w-auto px-8 py-3.5 text-white text-sm font-black rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 ml-auto ${
                  isExporting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                }`}
              >
                {isExporting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating...[cite: 20]</>
                ) : (
                  <><DownloadCloud className="w-5 h-5" /> Generate & Download[cite: 20]</>
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">No Clients Assigned[cite: 20]</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              You haven't been assigned any clients yet. You need at least one active client to generate data exports[cite: 20].
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}