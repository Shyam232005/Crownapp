"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  FileSpreadsheet, Plus, CheckCircle2, IndianRupee, 
  Clock, Send, Loader2, Inbox, X 
} from "lucide-react";
import toast from "react-hot-toast";

export default function DraftTaxSheetsUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [clients, setClients] = useState([]); // Dynamic client list
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonthStr, setCurrentMonthStr] = useState("");

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { clientId: "", month: "", outputTax: "", itc: "" }
  });

  useEffect(() => {
    const currentPeriod = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setCurrentMonthStr(currentPeriod);
    
    // Set default month in form
    reset({ month: currentPeriod });
    
    fetchDrafts();
    fetchClients();
  }, [reset]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/ca-staff/tax-drafts');
      if (res.ok) {
        const json = await res.json();
        setDrafts(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch tax drafts:", error);
      toast.error("Failed to load your recent computations.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/ca-staff/clients');
      if (res.ok) {
        const json = await res.json();
        setClients(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Saving tax draft...");
    try {
      // Find the client name based on selected ID
      const selectedClientObj = clients.find(c => c.id === data.clientId);
      if (!selectedClientObj) throw new Error("Please select a valid client");

      const payload = {
          ...data,
          clientName: selectedClientObj.name,
          liability: data.outputTax - data.itc
      };

      const res = await fetch('/api/ca-staff/tax-drafts', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to create draft");
      }

      toast.success("Draft saved successfully!", { id: loadingToast });
      fetchDrafts(); // Refresh list to get the new DB entry
      reset({ month: currentMonthStr });
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const sendToCA = async (id) => {
    const loadingToast = toast.loading("Sending to Principal CA...");
    try {
      const res = await fetch('/api/ca-staff/tax-drafts', {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Pending CA Approval" })
      });

      if (!res.ok) throw new Error("Failed to send draft");

      toast.success("Sent for final review!", { id: loadingToast });
      // Optimistic update
      setDrafts(drafts.map(d => d._id === id ? { ...d, status: "Pending CA Approval" } : d));
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" /> Draft Tax Sheets
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Prepare GST computations and send to Principal CA for final approval.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Draft
        </motion.button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-black text-slate-800">Recent Computations</h2>
        </div>
        
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-bold">Loading tax drafts...</p>
            </div>
          ) : drafts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {drafts.map((draft, idx) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={draft._id} className="p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                  
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${draft.status === 'Draft' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'}`}>
                      {draft.status === 'Draft' ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">{draft.clientName || draft.client}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded mt-1 inline-block">
                        {draft.month}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 sm:gap-12">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Output Tax</p>
                      <p className="text-sm font-black text-slate-900 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{draft.outputTax?.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ITC</p>
                      <p className="text-sm font-black text-emerald-600 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{draft.itc?.toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Liability</p>
                      <p className="text-sm font-black text-rose-600 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{draft.liability?.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 xl:pt-0">
                    {draft.status === 'Draft' ? (
                      <button 
                        onClick={() => sendToCA(draft._id)}
                        className="w-full xl:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors shadow-md"
                      >
                        <Send className="w-4 h-4" /> Send to CA
                      </button>
                    ) : (
                      <span className="w-full xl:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <CheckCircle2 className="w-4 h-4" /> {draft.status}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-base font-black text-slate-800 mb-1">No Tax Drafts Prepared</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                You haven't prepared any GST computations yet. Click 'New Draft' to start calculating liabilities for your clients.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Draft Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Prepare New Tax Draft</h2>
                <button onClick={() => { reset({ month: currentMonthStr }); setIsModalOpen(false); }} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Client</label>
                  <select 
                    {...register("clientId", { required: true })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 outline-none"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Accounting Period</label>
                  <input 
                    type="text" 
                    {...register("month", { required: true })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Output Tax (₹)</label>
                    <input 
                      type="number" 
                      {...register("outputTax", { required: true, valueAsNumber: true })} 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ITC (₹)</label>
                    <input 
                      type="number" 
                      {...register("itc", { required: true, valueAsNumber: true })} 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitting || clients.length === 0}
                  className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Tax Draft"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}