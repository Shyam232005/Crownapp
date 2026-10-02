"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  PackageOpen, Plus, Save, Box, Building2, 
  FileText, CheckCircle2, Loader2, History, Inbox,
  Scan, UploadCloud, Camera, Sparkles
} from "lucide-react";

export default function StockInwardUI() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [recentEntries, setRecentEntries] = useState([]);
  
  // ✨ NEW: AI Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue, // Used to auto-fill form from AI
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      itemName: "",
      quantity: "",
      unit: "Pieces (Pcs)",
      supplierName: "",
      challanNumber: "",
      remarks: ""
    }
  });

  useEffect(() => {
    const fetchRecentEntries = async () => {
      setTimeout(() => {
        setRecentEntries([]); 
        setIsLoadingHistory(false);
      }, 800);
    };
    fetchRecentEntries();
  }, []);

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setShowSuccess(true);
    setScanSuccess(false); // Reset scan badge on submit
    setTimeout(() => setShowSuccess(false), 3000);
    reset(); 
  };

  // ✨ MOCK: Offline AI Processing Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setScanSuccess(false);

    // Simulate sending file to Next.js Backend -> Tesseract (OCR) -> Local Ollama LLM
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      
      // AI extracts data and auto-fills the form!
      setValue("supplierName", "Ramesh Hardware & Tools");
      setValue("challanNumber", "CH-2026/892");
      setValue("itemName", "Copper Wire 2mm Roll");
      setValue("quantity", "15");
      setValue("unit", "Kilograms (Kg)");
      setValue("remarks", "Auto-extracted by Offline AI. Please verify.");
      
    }, 2500); // 2.5 sec local processing time
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <PackageOpen className="w-6 h-6 text-indigo-600" /> Inward Stock Entry
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Log new inventory manually or use the Offline AI Scanner.
        </p>
      </div>

      {/* ✨ NEW: OFFLINE AI SCANNER BLOCK */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-3xl p-1 shadow-lg shadow-indigo-200">
        <div className="bg-white rounded-[22px] p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
            {/* Background pattern */}
            <Scan className="w-40 h-40 absolute -right-10 -top-10 text-indigo-50 opacity-50 pointer-events-none" />
            
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 relative z-10">
                {isScanning ? (
                    <Scan className="w-8 h-8 text-indigo-600 animate-pulse" />
                ) : (
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                )}
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-2 relative z-10">
                {isScanning ? "AI is processing document..." : "Smart Offline Scanner"}
            </h3>
            <p className="text-sm font-medium text-slate-500 max-w-md mb-6 relative z-10">
                {isScanning 
                    ? "Running local OCR and extracting bill details securely on your device." 
                    : "Upload a photo or PDF of the vendor bill. Our 100% offline AI will auto-fill the form instantly."}
            </p>

            <input 
                type="file" 
                accept="image/*,.pdf" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
            />

            <div className="flex gap-4 relative z-10">
                <button 
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={isScanning}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                    {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                    {isScanning ? "Scanning..." : "Upload Bill"}
                </button>
                
                <button 
                    type="button"
                    disabled={isScanning}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                    <Camera className="w-4 h-4" /> Open Camera
                </button>
            </div>
        </div>
      </motion.div>

      {/* Entry Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-500" /> Manual / AI-Verified Entry
          </h2>
          {scanSuccess && (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Auto-filled by AI
              </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item Name / SKU</label>
              <div className="relative">
                <Box className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  {...register("itemName", { required: true })} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  placeholder="e.g. Copper Wire 2mm" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  {...register("quantity", { required: true, valueAsNumber: true })} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  placeholder="0" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unit</label>
                <select 
                  {...register("unit")} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                >
                  <option value="Pieces (Pcs)">Pieces (Pcs)</option>
                  <option value="Kilograms (Kg)">Kilograms (Kg)</option>
                  <option value="Meters (M)">Meters (M)</option>
                  <option value="Boxes">Boxes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supplier / Vendor Name</label>
              <div className="relative">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  {...register("supplierName", { required: true })} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  placeholder="e.g. Ramesh Traders" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Challan / Bill Number</label>
              <div className="relative">
                <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  {...register("challanNumber")} 
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all uppercase" 
                  placeholder="e.g. CH-2026/01" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Condition & Remarks</label>
            <textarea 
              rows="3" 
              {...register("remarks")} 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none" 
              placeholder="Add any notes about packaging or damages..."
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <AnimatePresence>
              {showSuccess && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" /> Stock Logged Successfully!
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={isSubmitting}
              className={`ml-auto px-8 py-3.5 rounded-xl text-sm font-black text-white shadow-lg flex justify-center items-center gap-2 transition-colors ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
            >
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Entry</>}
            </motion.button>
          </div>
        </form>
      </motion.div>

      {/* Recent Entries Log (Zero State UI) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[250px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" /> Recent Entries Today
          </h3>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-bold">Loading entries...</p>
            </div>
          ) : recentEntries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {/* Map over recentEntries array here later */}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-sm font-black text-slate-800 mb-1">No Entries Yet</h4>
              <p className="text-xs font-medium text-slate-500 max-w-sm">
                Any inward stock you log today will appear here for quick reference.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}