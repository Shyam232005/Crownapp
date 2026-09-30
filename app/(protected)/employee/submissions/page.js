"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { io } from "socket.io-client";
import Tesseract from "tesseract.js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, Clock, CheckCircle2, XCircle, Plus, 
  Loader2, IndianRupee, X, Receipt, CalendarRange, ListTodo, Sparkles, Building2, Calendar
} from "lucide-react";

let socket;

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: "General Expense", partyName: "", amount: "", paymentMode: "UPI", description: "", billNumber: "", billDate: "", gstin: "" }
  });

  const selectedType = watch("type");

  const stats = {
    pending: submissions.filter(s => s.status === "Pending").length,
    approved: submissions.filter(s => s.status === "Approved").length,
    rejected: submissions.filter(s => s.status === "Rejected").length,
  };

  useEffect(() => {
    socket = io();

    const fetchSubmissions = async () => {
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) {
          const json = await res.json();
          setSubmissions(json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();

    socket.on("submission-updated", (data) => {
      setSubmissions((prev) => 
        prev.map((item) => item._id === data.id ? { ...item, status: data.status } : item)
      );
    });

    return () => { if (socket) socket.disconnect(); };
  }, []);

  const filteredSubmissions = activeTab === "All" 
    ? submissions 
    : submissions.filter(s => s.status === activeTab);

  const handleAiScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const result = await Tesseract.recognize(file, "eng");
      const rawText = result.data.text;
      const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let extAmount = "", extParty = "", extGST = "", extDate = "", extBill = "";

      if (lines.length > 0) extParty = lines[0].replace(/[^a-zA-Z\s\&\-]/g, "").trim();
      
      const gstMatch = rawText.match(/\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/i);
      if (gstMatch) extGST = gstMatch[0].toUpperCase();

      const dateMatch = rawText.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/);
      if (dateMatch) extDate = dateMatch[0];

      const billMatch = rawText.match(/(?:inv|invoice|bill)[\s\w\-\.]*(?:no|num|#)[\s\:\-]*([A-Za-z0-9\-\/]+)/i);
      if (billMatch && billMatch[1]) extBill = billMatch[1].toUpperCase();

      const amountMatches = rawText.match(/\b\d+(\.\d{1,2})?\b/g);
      if (amountMatches) {
          const numbers = amountMatches.map(Number).filter(n => n > 10);
          if (numbers.length > 0) extAmount = Math.max(...numbers).toString();
      }

      setValue("type", "Vendor Payment"); 
      if (extParty) setValue("partyName", extParty);
      if (extAmount) setValue("amount", extAmount);
      if (extGST) setValue("gstin", extGST);
      if (extDate) setValue("billDate", extDate);
      if (extBill) setValue("billNumber", extBill);
      setValue("description", "Scanned Bill - Needs Verification");

    } catch (error) {
      alert("Scanning failed. Please enter details manually.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        employeeId: localStorage.getItem("fineOpsUserId") || "emp-temp-123",
        ...data,
        amount: data.amount ? parseFloat(data.amount) : 0,
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");

      const savedEntry = (await res.json()).data;
      socket.emit("new-submission", savedEntry);
      
      setSubmissions([savedEntry, ...submissions]);
      reset(); 
      setIsModalOpen(false);

    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">My Submissions</h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Track your daily logs, expenses, and approvals.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 sm:py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Entry
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[
          { label: "Pending Review", value: stats.pending, icon: Clock, color: "amber" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "emerald" },
          { label: "Rejected", value: stats.rejected, icon: XCircle, color: "rose" }
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}
          >
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-xl sm:text-2xl font-black text-${stat.color}-500`}>{stat.value}</p>
            </div>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-${stat.color}-50 flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${stat.color}-500`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-hide whitespace-nowrap">
        {["All", "Pending", "Approved", "Rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeTab === tab ? "bg-slate-900 text-white" : "bg-transparent text-slate-500 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px] sm:min-h-[400px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-4">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-indigo-500 mb-4" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-slate-300" />
            </div>
            <h3 className="text-base font-black text-slate-800 mb-2">No records found</h3>
          </motion.div>
        ) : (
          <div className="divide-y divide-slate-100 p-2">
            <AnimatePresence mode="popLayout">
              {filteredSubmissions.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  key={item._id} 
                  className="p-3 sm:p-4 mb-2 rounded-xl border border-transparent hover:border-slate-100 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between transition-colors gap-3 sm:gap-0"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                      item.type === 'Task/Report' ? 'bg-orange-50 text-orange-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {item.type === 'Task/Report' ? <ListTodo className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-slate-900">{item.partyName || item.type}</p>
                      </div>
                      <p className="text-xs font-medium text-slate-500 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                    {item.amount > 0 && (
                      <p className="text-sm font-black text-slate-900 flex items-center mb-1">
                        <IndianRupee className="w-3 h-3 mr-0.5" /> {item.amount.toLocaleString("en-IN")}
                      </p>
                    )}
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                      item.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md">
                <h2 className="text-lg font-black text-slate-900">Create New Entry</h2>
                <button onClick={() => { reset(); setIsModalOpen(false); }} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 overflow-y-auto scrollbar-hide pb-24 sm:pb-6 flex-1">
                
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-1 relative cursor-pointer group shadow-sm" onClick={() => !isScanning && fileInputRef.current?.click()}>
                  <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleAiScan} className="hidden" />
                  <div className="border border-dashed border-indigo-200/60 rounded-xl p-4 text-center bg-white/50 group-hover:bg-white/80 transition-all">
                    {isScanning ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                        <p className="text-xs font-bold text-indigo-800">Reading Invoice Data...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-md shadow-indigo-200 group-hover:-translate-y-1 transition-transform">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs font-bold text-indigo-900 mb-1">Auto-fill with Smart Scan</p>
                        <p className="text-[10px] font-medium text-indigo-500">Upload a bill to extract details instantly</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                <div className="mb-5">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Operation Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {["Vendor Payment", "Customer Received", "General Expense", "Task/Report"].map(typeOption => (
                      <button
                        key={typeOption}
                        type="button"
                        onClick={() => setValue("type", typeOption)}
                        className={`py-2 px-2 text-[11px] sm:text-xs font-bold rounded-xl transition-all border ${
                          selectedType === typeOption ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {typeOption}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedType !== "Task/Report" && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Party Name</label>
                        <input type="text" placeholder="e.g. Ramesh Traders" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" {...register("partyName")} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">GSTIN (Optional)</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="text" placeholder="22AAAAA0000A1Z5" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase" {...register("gstin")} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill No</label>
                        <input type="text" placeholder="INV-01" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all uppercase" {...register("billNumber")} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill Date</label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="text" placeholder="DD/MM/YYYY" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" {...register("billDate")} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Total Amount (₹)</label>
                        <div className="relative">
                          <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input type="number" step="0.01" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" {...register("amount")} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mode</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" {...register("paymentMode")}>
                          <option value="UPI">UPI</option>
                          <option value="Cash">Cash</option>
                          <option value="NEFT/RTGS">NEFT / RTGS</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="mb-6">
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference / Note</label>
                  <textarea rows="2" placeholder="Add specifics here..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none" {...register("description", { required: true })}></textarea>
                </div>

                <div className="fixed sm:static bottom-0 left-0 right-0 p-4 sm:p-0 bg-white border-t sm:border-0 border-slate-100 shrink-0 z-20">
                  <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 flex justify-center items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Securely"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}