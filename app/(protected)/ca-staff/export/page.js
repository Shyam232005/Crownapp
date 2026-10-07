"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  DownloadCloud, Filter, CheckCircle2, FileText, 
  FileSpreadsheet, Code, Loader2, Inbox 
} from "lucide-react";
import toast from "react-hot-toast";

export default function ExportDataUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [assignedClients, setAssignedClients] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      clientId: "",
      period: "Current Month",
      format: "csv"
    }
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // We can reuse the CA dashboard API or a specific clients API you have
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
    const loadingToast = toast.loading("Compiling ledger data...");
    
    try {
      const res = await fetch('/api/ca-staff/export', { 
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
      });

      if (res.ok) {
        const json = await res.json();
        
        // Trigger browser download securely
        const blob = new Blob([json.fileData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", json.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Export Downloaded!", { id: loadingToast });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to generate export.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error during export.", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <DownloadCloud className="w-6 h-6 text-indigo-600" /> Export Data
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Download clean, scrutinized client data for offline processing.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-black text-slate-800">Export Filters</h2>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
            <p className="text-sm font-bold">Loading your client list...</p>
          </div>
        ) : assignedClients.length > 0 ? (
          <form className="p-6 space-y-6 flex-1 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Client</label>
                <select 
                  {...register("clientId", { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                  {assignedClients.map(client => (
                    <option key={client._id || client.id} value={client._id || client.id}>
                      {client.companyName || client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data Period</label>
                <select 
                  {...register("period", { required: true })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                  <option value="Current Month">Current Month</option>
                  <option value="Previous Month">Previous Month</option>
                  <option value="Q2 2026">Q2 (Jul - Sep 2026)</option>
                </select>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Export Format</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" value="xml" {...register("format")} className="peer sr-only" disabled />
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 opacity-50 transition-all">
                    <Code className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-bold text-slate-500">Tally XML (Pro)</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" value="xlsx" {...register("format")} className="peer sr-only" disabled />
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 opacity-50 transition-all">
                    <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                    <span className="text-sm font-bold text-slate-500">Excel (XLSX)</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" value="csv" {...register("format")} className="peer sr-only" defaultChecked />
                  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:bg-slate-50">
                    <FileText className="w-6 h-6 text-slate-600 peer-checked:text-amber-600" />
                    <span className="text-sm font-bold text-slate-700">CSV Standard</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" /> Export Generated Successfully!
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
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                ) : (
                  <><DownloadCloud className="w-5 h-5" /> Generate & Download</>
                )}
              </motion.button>
            </div>
          </form>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">No Clients Assigned</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              You haven't been assigned any clients yet. You need at least one active client to generate data exports.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}