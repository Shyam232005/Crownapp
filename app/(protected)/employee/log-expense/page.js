"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  Receipt, Sparkles, IndianRupee, Send, FileText, 
  Scan, Loader2, CheckCircle2, History, Inbox, Camera, UploadCloud 
} from "lucide-react";

export default function LogExpenseUI() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [recentExpenses, setRecentExpenses] = useState([]);
  
  // AI Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      category: "Office Supplies",
      amount: "",
      paidTo: "",
      details: ""
    }
  });

  // Mock API Call: Fetch today's expenses (Zero-State default)
  useEffect(() => {
    const fetchRecentExpenses = async () => {
      // Later: const res = await fetch('/api/employee/expenses/today');
      setTimeout(() => {
        setRecentExpenses([]); // True zero-state: 0 expenses logged today
        setIsLoadingHistory(false);
      }, 800);
    };
    fetchRecentExpenses();
  }, []);

  // Mock API Call: Submit Form Data
  const onSubmit = async (data) => {
    // Later: await fetch('/api/employee/expenses', { method: 'POST', body: JSON.stringify(data) });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setShowSuccess(true);
    setScanSuccess(false);
    setTimeout(() => setShowSuccess(false), 3000);
    reset(); 
  };

  // MOCK: Offline AI Processing Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanSuccess(false);

    // Simulate local OCR & LLM extraction
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      
      // Auto-fill the form
      setValue("category", "Travel & Fuel");
      setValue("amount", "1250");
      setValue("paidTo", "Indian Oil Station");
      setValue("details", "Fuel for delivery van (Auto-extracted)");
      
    }, 2500);
  };

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-rose-600" /> Log Expense
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Record office expenses, travel, or petty cash usage.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <form className="p-6 sm:p-8" onSubmit={handleSubmit(onSubmit)}>
          
          {/* Smart Scan UI */}
          <div 
            onClick={() => !isScanning && fileInputRef.current.click()}
            className={`mb-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-1 cursor-pointer group shadow-sm transition-all ${isScanning ? 'opacity-80 pointer-events-none' : ''}`}
          >
            <div className="border border-dashed border-indigo-200/60 rounded-xl p-6 text-center bg-white/50 group-hover:bg-white/80 transition-all flex flex-col items-center relative overflow-hidden">
              <Scan className="w-32 h-32 absolute -right-6 -top-6 text-indigo-100 opacity-50 pointer-events-none" />
              
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md shadow-indigo-200 group-hover:-translate-y-1 transition-transform relative z-10">
                {isScanning ? (
                  <Scan className="w-6 h-6 text-white animate-pulse" />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" />
                )}
              </div>
              <p className="text-sm font-black text-indigo-900 mb-1 relative z-10">
                {isScanning ? "Extracting bill details..." : "Scan Expense Bill"}
              </p>
              <p className="text-xs font-medium text-indigo-500 relative z-10">
                {isScanning ? "Processing offline securely" : "Auto-fill Amount & Details (100% Offline AI)"}
              </p>

              <input 
                type="file" 
                accept="image/*,.pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-800">Manual / Verified Entry</h2>
            {scanSuccess && (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Auto-filled
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Category</label>
                <select 
                  {...register("category")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                >
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Travel & Fuel">Travel & Fuel</option>
                  <option value="Food & Refreshments">Food & Refreshments</option>
                  <option value="Repairs & Maintenance">Repairs & Maintenance</option>
                  <option value="Other Misc.">Other Misc.</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="number" 
                    {...register("amount", { required: true, valueAsNumber: true })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" 
                    placeholder="0.00" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paid To / Shop Name</label>
              <div className="relative">
                <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  {...register("paidTo", { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" 
                  placeholder="e.g. Navjivan Stationers" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Details</label>
              <textarea 
                rows="3" 
                {...register("details", { required: true })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none" 
                placeholder="What was this expense for?"
              ></textarea>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Sent to Owner
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting}
              className={`ml-auto w-full sm:w-auto px-8 py-3.5 text-white text-sm font-black rounded-xl shadow-lg transition-colors flex justify-center items-center gap-2 ${isSubmitting ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'}`}
            >
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit to Owner</>}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Recent Expenses Log (Zero State UI) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[250px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Recent Expenses Today
          </h3>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-rose-600" />
              <p className="text-sm font-bold">Loading entries...</p>
            </div>
          ) : recentExpenses.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {/* Map over recentExpenses array here later */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-1">No Expenses Logged</h4>
              <p className="text-xs font-medium text-slate-500 max-w-sm">
                Any expenses you submit for approval today will appear here.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}