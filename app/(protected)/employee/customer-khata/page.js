"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import Tesseract from "tesseract.js";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Plus, Loader2, IndianRupee, ArrowDownToLine, 
  ReceiptText, X, Sparkles
} from "lucide-react";

export default function EmployeeKhata() {
  const [khataEntries, setKhataEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: "Sales Invoice", partyName: "", amount: "", paymentMode: "UPI", description: "" }
  });
  
  const selectedType = watch("type");

  useEffect(() => {
    const fetchKhata = async () => {
      try {
        const res = await fetch("/api/submissions");
        if (res.ok) {
          const json = await res.json();
          const customerData = (json.data || []).filter(
            item => item.type === "Sales Invoice" || item.type === "Customer Received"
          );
          setKhataEntries(customerData);

          const custMap = {};
          customerData.forEach((entry) => {
            if (entry.status !== "Rejected" && entry.partyName) {
              const name = entry.partyName.trim();
              if (!custMap[name]) custMap[name] = { name, balance: 0 };
              
              if (entry.status === "Approved") {
                if (entry.type === "Sales Invoice") custMap[name].balance += entry.amount;
                if (entry.type === "Customer Received") custMap[name].balance -= entry.amount;
              }
            }
          });
          setCustomers(Object.values(custMap).sort((a, b) => b.balance - a.balance));
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKhata();
  }, []);

  const handleAiScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const result = await Tesseract.recognize(file, "eng");

      const rawText = result.data.text;
      const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      let extAmount = "", extParty = "";

      if (lines.length > 0) extParty = lines[0].replace(/[^a-zA-Z\s\&\-]/g, "").trim();

      const amountMatches = rawText.match(/\b\d+(\.\d{1,2})?\b/g);
      if (amountMatches) {
          const numbers = amountMatches.map(Number).filter(n => n > 10);
          if (numbers.length > 0) extAmount = Math.max(...numbers).toString();
      }

      setValue("type", "Sales Invoice"); 
      if (extParty) setValue("partyName", extParty);
      if (extAmount) setValue("amount", extAmount);
      setValue("description", "Auto-scanned Sales Entry");

    } catch (error) {
      console.error("Local Scan Error:", error);
      alert("Scanning failed. Please enter details manually.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        employeeId: typeof window !== "undefined" ? (localStorage.getItem("fineOpsUserId") || "emp-temp-123") : "emp-temp-123",
        ...data,
        amount: data.amount ? parseFloat(data.amount) : 0,
        status: "Pending" 
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save");

      const savedEntry = (await res.json()).data;
      
      // Instantly append to the local state without requiring a full reload or sockets
      setKhataEntries([savedEntry, ...khataEntries]);
      reset(); 
      setIsModalOpen(false);

    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Customer Khata
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">Log new sales and customer payments.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Khata Entry
        </motion.button>
      </div>

      {isLoading ? (
        <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        </div>
      ) : customers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">No Customers Yet</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Record your first sale or payment to start building the customer ledger.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {customers.map((cust, idx) => (
              <motion.div 
                layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                key={cust.name} 
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="font-black text-slate-400">{cust.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 line-clamp-1">{cust.name}</h4>
                </div>
                
                <div className={`rounded-xl p-4 flex justify-between items-center border ${cust.balance > 0 ? 'bg-rose-50 border-rose-100' : cust.balance < 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${cust.balance > 0 ? 'text-rose-500' : cust.balance < 0 ? 'text-emerald-500' : 'text-slate-500'}`}>
                    {cust.balance > 0 ? 'To Collect (Udhaar)' : cust.balance < 0 ? 'Advance Received' : 'Settled (Zero)'}
                  </p>
                  <p className={`text-sm font-black flex items-center ${cust.balance > 0 ? 'text-rose-600' : cust.balance < 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {Math.abs(cust.balance).toLocaleString("en-IN")}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
                <h2 className="text-lg font-black text-slate-900">New Khata Entry</h2>
                <button onClick={() => { reset(); setIsModalOpen(false); }} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto scrollbar-hide flex-1">
                
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="mb-6 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-1 relative cursor-pointer group shadow-sm" onClick={() => !isScanning && fileInputRef.current?.click()}>
                  <input type="file" accept="image/*,application/pdf" ref={fileInputRef} onChange={handleAiScan} className="hidden" />
                  <div className="border border-dashed border-indigo-200/60 rounded-xl p-4 text-center bg-white/50 group-hover:bg-white/80 transition-all">
                    {isScanning ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-2" />
                        <p className="text-xs font-bold text-indigo-800">Reading Sales Invoice...</p>
                        <p className="text-[10px] font-medium text-indigo-500 mt-1">Extracting Customer & Amount</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1">
                        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-md shadow-indigo-200 group-hover:-translate-y-1 transition-transform">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs font-bold text-indigo-900 mb-1">Auto-fill Sales Bill</p>
                        <p className="text-[10px] font-medium text-indigo-500">Upload a photo of the invoice (100% Offline)</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button type="button" onClick={() => setValue("type", "Sales Invoice")} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedType === "Sales Invoice" ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <ReceiptText className="w-6 h-6" />
                    <span className="text-xs font-black">Sales Invoice (Given)</span>
                  </button>
                  <button type="button" onClick={() => setValue("type", "Customer Received")} className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${selectedType === "Customer Received" ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    <ArrowDownToLine className="w-6 h-6" />
                    <span className="text-xs font-black">Payment Received</span>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Customer Name</label>
                  <input type="text" placeholder="e.g. Sharma Traders" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register("partyName", { required: true })} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="number" className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register("amount", { required: true })} />
                    </div>
                  </div>
                  {selectedType === "Customer Received" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mode</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register("paymentMode")}>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="NEFT/RTGS">NEFT / RTGS</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Remarks / Bill Info</label>
                  <input type="text" placeholder="Details..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" {...register("description", { required: true })} />
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSubmitting} className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}