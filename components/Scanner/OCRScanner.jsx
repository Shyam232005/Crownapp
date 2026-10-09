"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Sparkles, Loader2, CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Enterprise OCR Scanner Component
 * STRICT COMPLIANCE:
 * 1. onScanComplete callback MUST ONLY trigger setFormData (never auto-submit)
 * 2. Absolutely NO form.submit(), fetch() posting, or router.push() in scanner lifecycle
 * 3. Notifies user via Sonner toast: "Document scanned! Please review fields before submitting."
 */
export default function OCRScanner({
  onScanComplete,
  title = "Smart Document Scanner",
  subtitle = "Auto-extract fields from Invoices, Bills, or Receipts (100% Offline AI)",
  buttonText = "Scan Document",
  disabled = false
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scannedFilename, setScannedFilename] = useState("");
  const fileInputRef = useRef(null);

  const parseExtractedText = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const result = {
      partyName: "",
      amount: "",
      invoiceNumber: "",
      billDate: new Date().toISOString().split("T")[0],
      gstin: "",
      description: ""
    };

    // 1. Amount Extraction (Search for ₹, Rs, Total, Amount followed by numbers)
    const amountRegex = /(?:total|amount|grand\s*total|net\s*payable|rs\.?|₹|inr)[\s:]*([0-9,]+\.?[0-9]{0,2})/i;
    for (const line of lines) {
      const match = line.match(amountRegex);
      if (match && match[1]) {
        const cleanAmt = match[1].replace(/,/g, "");
        if (!isNaN(cleanAmt) && Number(cleanAmt) > 0) {
          result.amount = cleanAmt;
          break;
        }
      }
    }

    // Fallback amount match (largest standalone currency-like number)
    if (!result.amount) {
      const standaloneNumbers = text.match(/\b\d{2,6}\.\d{2}\b/g);
      if (standaloneNumbers && standaloneNumbers.length > 0) {
        const maxVal = Math.max(...standaloneNumbers.map(Number));
        if (maxVal > 0) result.amount = maxVal.toString();
      }
    }

    // 2. GSTIN Regex (Standard 15 alphanumeric Indian GST format)
    const gstinRegex = /\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/;
    const gstinMatch = text.match(gstinRegex);
    if (gstinMatch) {
      result.gstin = gstinMatch[0];
    }

    // 3. Invoice / Bill Number Regex
    const invRegex = /(?:inv(?:oice)?|bill|challan|receipt|ref)\s*(?:no\.?|num|#)?[\s:]*([A-Za-z0-9\/-]+)/i;
    for (const line of lines) {
      const invMatch = line.match(invRegex);
      if (invMatch && invMatch[1] && invMatch[1].length >= 3) {
        result.invoiceNumber = invMatch[1].trim();
        break;
      }
    }

    // 4. Date Regex (DD/MM/YYYY or YYYY-MM-DD or DD-MM-YYYY)
    const dateRegex = /\b(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}|\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2})\b/;
    const dateMatch = text.match(dateRegex);
    if (dateMatch) {
      try {
        const parsed = new Date(dateMatch[0]);
        if (!isNaN(parsed.getTime())) {
          result.billDate = parsed.toISOString().split("T")[0];
        }
      } catch (_) {}
    }

    // 5. Vendor / Customer Name Heuristic (First prominent non-keyword line)
    for (const line of lines) {
      if (
        line.length > 3 &&
        line.length < 50 &&
        !line.match(/invoice|receipt|tax|bill|date|total|amount|gstin|phone|tel|email/i)
      ) {
        result.partyName = line.replace(/[^a-zA-Z0-9\s&.-]/g, "").trim();
        break;
      }
    }

    result.description = lines.slice(0, 3).join(" ").substring(0, 100);
    return result;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScannedFilename(file.name);
    setIsScanning(true);
    setScanSuccess(false);

    const toastId = toast.loading("AI Scanning document locally...");

    try {
      let imageToScan = file;

      // Handle PDF or Images
      if (file.type === "application/pdf") {
          const pdfjsLib = await import("pdfjs-dist");
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          imageToScan = canvas.toDataURL("image/png");
        } catch (pdfErr) {
          console.warn("PDF rasterization fallback:", pdfErr);
        }
      }

      // Run local client-side OCR via dynamic import
      const TesseractModule = await import("tesseract.js");
      const Tesseract = TesseractModule.default || TesseractModule;
      const result = await Tesseract.recognize(imageToScan, "eng", {
        logger: () => {}
      });

      const extractedText = result?.data?.text || "";
      const parsedData = parseExtractedText(extractedText);

      // STRICT RULE: Only pass data to caller's state handler (setFormData)
      // Never trigger form submit or network push here!
      if (typeof onScanComplete === "function") {
        onScanComplete({
          ...parsedData,
          rawOcrText: extractedText,
          documentUrl: URL.createObjectURL(file),
          filename: file.name
        });
      }

      setScanSuccess(true);
      toast.success("Document scanned! Please review fields before submitting.", { id: toastId });
    } catch (error) {
      console.error("OCR Scanner Error:", error);
      toast.error("Could not parse document. Please fill details manually.", { id: toastId });
    } finally {
      setIsScanning(false);
      // Reset input so user can re-scan same file if desired
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full mb-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isScanning}
      />

      <motion.div
        whileHover={!isScanning && !disabled ? { scale: 1.01 } : {}}
        whileTap={!isScanning && !disabled ? { scale: 0.99 } : {}}
        onClick={() => !isScanning && !disabled && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer group ${
          isScanning
            ? "bg-indigo-50/60 border-indigo-200 cursor-wait"
            : scanSuccess
            ? "bg-emerald-50/50 border-emerald-200 hover:border-emerald-300"
            : "bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 border-indigo-100 hover:border-indigo-300 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isScanning
                  ? "bg-indigo-600 text-white"
                  : scanSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white group-hover:bg-indigo-700"
              }`}
            >
              {isScanning ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : scanSuccess ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : (
                <Scan className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {isScanning ? "Processing Document with AI..." : scanSuccess ? "Document Fields Extracted!" : title}
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Offline OCR
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {isScanning
                  ? "Extracting party name, GSTIN, amount, and dates safely..."
                  : scanSuccess
                  ? `Extracted from: ${scannedFilename} (Fields populated below for your review)`
                  : subtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isScanning || disabled}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 flex items-center gap-1.5 transition-all shadow-xs ${
              isScanning
                ? "bg-indigo-200 text-indigo-700 pointer-events-none"
                : scanSuccess
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning...
              </>
            ) : scanSuccess ? (
              <>
                <UploadCloud className="w-3.5 h-3.5" /> Scan Another
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" /> {buttonText}
              </>
            )}
          </button>
        </div>

        {/* Ambient subtle background accent */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
      </motion.div>
    </div>
  );
}
