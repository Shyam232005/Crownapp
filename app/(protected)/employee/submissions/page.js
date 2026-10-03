"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2, Receipt, ScanLine } from "lucide-react";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

export default function EmployeeSubmissionForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm({
    defaultValues: {
      type: "General Expense",
      partyName: "",
      amount: "",
      paymentMode: "Cash",
      description: "",
      billNumber: "",
      billDate: "",
      gstin: ""
    }
  });

  useEffect(() => {
    // Initialize PDF.js worker securely for Next.js client-side execution
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  // 🔴 UNIVERSAL OFFLINE AI SCANNER (PDF & IMAGE)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    let imageToScan = file;

    try {
      // If the file is a PDF, render its first page to an image format Tesseract can read
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        
        // Scale to 2.0 for higher DPI, improving OCR accuracy
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        imageToScan = canvas.toDataURL("image/png"); // Convert PDF page to base64 image
      }

      // Run Tesseract offline OCR
      const result = await Tesseract.recognize(imageToScan, 'eng');
      const text = result.data.text;
      
      console.log("Raw Scanned Text:", text); // Keep for debugging

      // Regex Extraction Engine
      const gstinMatch = text.match(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/i);
      if (gstinMatch) setValue("gstin", gstinMatch[0].toUpperCase());

      const amountMatch = text.match(/(?:Rs\.?|INR|₹|Total|Amount)[\s:]*([\d,]+\.?\d*)/i);
      if (amountMatch) setValue("amount", amountMatch[1].replace(/,/g, ''));

      const billMatch = text.match(/(?:Inv|Invoice|Bill)[\s\w]*No[\.\s:]*([A-Za-z0-9\-_]+)/i);
      if (billMatch) setValue("billNumber", billMatch[1]);

      setValue("description", "Auto-extracted from uploaded document.");

    } catch (error) {
      console.error("AI Scan failed:", error);
      alert("Failed to scan the document. Please enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const onSubmit = async (data) => {
    setServerError("");
    try {
      // Get the verified user ID from wherever you store it after login (e.g., localStorage or Context)
      const employeeId = typeof window !== "undefined" ? localStorage.getItem("fineOpsUserId") || "emp-temp-123" : "emp-temp-123";
      
      const payload = {
        ...data,
        employeeId,
        amount: Number(data.amount),
        status: "Pending" 
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit data");

      setShowSuccess(true);
      reset();
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      setServerError(error.message);
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
            <p className="text-xs font-medium text-slate-500">Log an expense, payment, or invoice.</p>
          </div>
        </div>

        <div className="relative">
          {/* Now accepts PDF in addition to images */}
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
              isScanning ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4 text-indigo-500" />}
            {isScanning ? "AI Scanning..." : "Auto-Scan Bill/PDF"}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Entry Type</label>
            <select {...register("type", { required: true })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="General Expense">General Expense</option>
              <option value="Vendor Payment">Vendor Payment</option>
              <option value="Customer Received">Customer Received</option>
              <option value="Sales Invoice">Sales Invoice</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amount (₹)</label>
            <input type="number" step="0.01" {...register("amount", { required: true, min: 1 })} placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Party / Vendor Name</label>
            <input type="text" {...register("partyName")} placeholder="e.g. Sharma Traders" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payment Mode</label>
            <select {...register("paymentMode")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill Number</label>
            <input type="text" {...register("billNumber")} placeholder="#INV-001" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Bill Date</label>
            <input type="date" {...register("billDate")} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">GSTIN</label>
            <input type="text" {...register("gstin")} placeholder="Optional" className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 uppercase" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description / Notes</label>
          <textarea {...register("description", { required: true })} rows="2" placeholder="What was this for?" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"></textarea>
        </div>

        {serverError && <p className="text-sm font-bold text-rose-500">{serverError}</p>}

        <div className="pt-4 flex items-center justify-between">
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> Sent to Owner for Approval!
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isSubmitting || isScanning}
            className={`px-8 py-3.5 text-white text-sm font-black rounded-xl shadow-lg transition-colors flex items-center gap-2 ml-auto ${
              (isSubmitting || isScanning) ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : <><Send className="w-5 h-5" /> Submit Entry</>}
          </motion.button>
        </div>
      </form>
    </div>
  );
}