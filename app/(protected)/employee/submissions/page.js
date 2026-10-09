"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, Receipt, ScanLine, Sparkles, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function EmployeeSubmissionForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Unified directory states
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoadingDirectories, setIsLoadingDirectories] = useState(true);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      type: "General Expense",
      partyName: "",
      amount: "",
      paymentMode: "Cash",
      paymentMethod: "Cash",
      category: "Operating",
      receiptNumber: "",
      invoiceNumber: "",
      billNumber: "",
      billDate: "",
      gstin: "",
      description: ""
    }
  });

  const selectedType = watch("type");
  const isCustomerType = selectedType === "Customer Received" || selectedType === "Sales Invoice";

  // Fetch unified Customer and Supplier directories strictly by companyId
  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        const [custRes, suppRes] = await Promise.allSettled([
          fetch("/api/khata/customer", { cache: "no-store" }),
          fetch("/api/suppliers", { cache: "no-store" })
        ]);

        if (custRes.status === "fulfilled" && custRes.value.ok) {
          const custJson = await custRes.value.json();
          setCustomers(custJson.customers || custJson.data || []);
        }

        if (suppRes.status === "fulfilled" && suppRes.value.ok) {
          const suppJson = await suppRes.value.json();
          setSuppliers(suppJson.suppliers || suppJson.data || []);
        }
      } catch (err) {
        console.error("Failed to load directories:", err);
      } finally {
        setIsLoadingDirectories(false);
      }
    };

    fetchDirectories();
  }, []);

  // UNIVERSAL OFFLINE AI SCANNER (PDF & IMAGE) - Strict State Mapping Only (No Auto-Submit)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    let imageToScan = file;
    const toastId = toast.loading("AI Scanning document offline...");

    try {
      if (file.type === "application/pdf") {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        // Scale to 2.0 for high OCR resolution
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        imageToScan = canvas.toDataURL("image/png"); 
      }

      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(imageToScan, 'eng');
      const text = result.data.text;

      // Extract details via high-precision regex
      const gstinMatch = text.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/i);
      if (gstinMatch) {
        setValue("gstin", gstinMatch[0].toUpperCase(), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }

      const amountMatch = text.match(/(?:Rs\.?|INR|₹|Total|Grand Total|Net Amount|Amount)[\s:]*([\d,]+\.?\d*)/i);
      if (amountMatch) {
        setValue("amount", amountMatch[1].replace(/,/g, ''), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      } else {
        const allNums = text.match(/\b\d+(\.\d{1,2})?\b/g);
        if (allNums) {
          const numbers = allNums.map(Number).filter(n => n >= 10 && n <= 10000000);
          if (numbers.length > 0) {
            setValue("amount", Math.max(...numbers).toString(), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
        }
      }

      const billMatch = text.match(/(?:Inv|Invoice|Bill|Challan)[\s\w]*No[\.\s:]*([A-Za-z0-9\-_/]+)/i);
      if (billMatch) {
        setValue("invoiceNumber", billMatch[1], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue("billNumber", billMatch[1], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }

      const receiptMatch = text.match(/(?:Receipt|Rec|Voucher|Ref)[\s\w]*No[\.\s:]*([A-Za-z0-9\-_/]+)/i);
      if (receiptMatch) {
        setValue("receiptNumber", receiptMatch[1], { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }

      const catMatch = text.match(/(?:Category|Cat)[\s:]*([A-Za-z0-9\-_ ]+)/i);
      if (catMatch) {
        setValue("category", catMatch[1].trim(), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      }

      // Check extracted vendor against unified directory
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      if (lines.length > 0) {
        const topParty = lines[0].replace(/[^a-zA-Z0-9\s\&\.\-]/g, '').trim().toLowerCase();
        const matchedSupplier = suppliers.find(s => s.name.toLowerCase().includes(topParty) || topParty.includes(s.name.toLowerCase()));
        if (matchedSupplier) {
          setValue("partyName", matchedSupplier.name, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        }
      }

      setValue("description", "Auto-extracted from uploaded document. Please verify before submission.", { shouldValidate: true, shouldDirty: true, shouldTouch: true });
      
      // UX State Updates: strictly NO programmatic submit or router push!
      setIsAutoFilled(true);
      setHasScanned(true);
      setTimeout(() => setIsAutoFilled(false), 3500);

      toast.success("Document scanned! Please review the fields below before submitting.", { id: toastId });

    } catch (error) {
      console.error("AI Scan failed:", error);
      toast.error("Failed to scan document. Please enter details manually.", { id: toastId });
    } finally {
      setIsScanning(false);
      e.target.value = ""; // Reset input so same file can be re-selected
    }
  };

  const onSubmit = async (data) => {
    const toastId = toast.loading("Submitting entry for Owner approval...");
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        totalAmount: Number(data.amount),
        receiptNumber: data.receiptNumber || "",
        invoiceNumber: data.invoiceNumber || data.billNumber || "",
        paymentMethod: data.paymentMethod || data.paymentMode || "Cash",
        category: data.category || "General"
      };

      const res = await fetch("/api/employee/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit entry");
      }

      toast.success("Sent to Business Owner for Approval!", { id: toastId });
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
      setShowSuccess(true);
      setHasScanned(false);
      reset();
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <Receipt className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">New Submission</h2>
            <p className="text-xs font-medium text-slate-500">Log operational expenses, inward bills, or receipts.</p>
          </div>
        </div>

        {/* AI Scanner Button - Only maps state, never auto-submits */}
        <div className="relative">
          <input 
            type="file" 
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            disabled={isScanning}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />
          <button 
            type="button"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isScanning ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> : <ScanLine className="w-4 h-4 text-indigo-500" />}
            {isScanning ? "Scanning..." : "Auto-Scan Bill/PDF"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3"
          >
            <div className="relative h-1.5 w-full bg-indigo-200/50 rounded-full overflow-hidden">
              <motion.div 
                className="absolute top-0 bottom-0 bg-gradient-to-r from-indigo-500 via-emerald-400 to-indigo-500 w-1/3 rounded-full"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              />
            </div>
            <p className="text-[11px] font-bold text-indigo-700 text-center mt-2">
              ⚡ Local OCR scanning: extracting amount, invoice number & vendor...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAutoFilled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2 p-3.5 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Document details extracted! Please review the form before clicking Submit.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className={`space-y-5 rounded-3xl p-6 bg-white border border-slate-200 transition-colors duration-500 ${
          isAutoFilled ? "bg-emerald-50/10" : ""
        }`}
      >
        {/* Entry Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Entry Type</label>
            <select 
              {...register("type", { required: true })} 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
            >
              <option value="General Expense">General Expense / Petty Cash</option>
              <option value="Vendor Payment">Vendor Payment (Payment to Give)</option>
              <option value="Customer Received">Customer Payment (Advance to Adjust Later)</option>
              <option value="Sales Invoice">Sales Invoice (Payment to Collect)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₹)</label>
            <input 
              type="number" 
              step="0.01" 
              {...register("amount", { required: true, min: 1 })} 
              placeholder="0.00" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
            />
          </div>
        </div>

        {/* Unified Dropdown for Party (Customer vs Supplier) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {isCustomerType ? <Users className="w-3.5 h-3.5 text-indigo-600" /> : <Building2 className="w-3.5 h-3.5 text-indigo-600" />}
              {isCustomerType ? "Customer Name" : "Supplier / Vendor"}
            </label>
            
            {isCustomerType ? (
              <select 
                {...register("partyName", { required: true })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name} {c.balance ? `(Due: ₹${c.balance})` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <select 
                {...register("partyName", { required: true })} 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map((s) => (
                  <option key={s._id || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
            <input type="text" {...register("category")} placeholder="e.g. Operating, Travel, Office" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Method</label>
            <select {...register("paymentMethod")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Cheque">Cheque</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
        </div>

        {/* Invoice / Reference Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Invoice / Bill #</label>
            <input type="text" {...register("invoiceNumber")} placeholder="#INV-001" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Receipt #</label>
            <input type="text" {...register("receiptNumber")} placeholder="#REC-001" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bill Date</label>
            <input type="date" {...register("billDate")} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">GSTIN</label>
            <input type="text" {...register("gstin")} placeholder="Optional" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 uppercase" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Notes</label>
          <textarea {...register("description", { required: true })} rows="2" placeholder="What was this entry for?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"></textarea>
        </div>

        <div className="pt-4 flex items-center justify-between">
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> Sent to Business Owner for Approval!
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Submit Button with Guided Pulse Animation when scanned */}
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            animate={hasScanned ? {
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
                "0 10px 15px -3px rgba(79, 70, 229, 0.4)",
                "0 4px 6px -1px rgba(79, 70, 229, 0.2)"
              ]
            } : {}}
            transition={hasScanned ? { repeat: Infinity, duration: 1.8 } : {}}
            type="submit" 
            disabled={isSubmitting || isScanning}
            className={`px-8 py-3.5 text-white text-sm font-black rounded-xl shadow-lg transition-colors flex items-center gap-2 ml-auto cursor-pointer ${
              (isSubmitting || isScanning) ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <><Send className="w-5 h-5" /> Submit Entry</>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}