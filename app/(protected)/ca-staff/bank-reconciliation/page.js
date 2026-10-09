"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Landmark, Check, X, FileSpreadsheet, 
  ArrowRightLeft, Loader2, Inbox, Building2,
  CheckCircle2, Clock, AlertCircle, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "REVIEW_READY", "Completed"];

export default function BankRecoUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [recoData, setRecoData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Client Selection States
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  
  const fileInputRef = useRef(null);

  // Initial load of clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch("/api/ca-staff/clients");
        if (res.ok) {
          const json = await res.json();
          const clientList = Array.isArray(json.data) ? json.data : (json.data?.clients || []);
          setClients(clientList);
          if (clientList.length > 0) {
            setSelectedClient(clientList[0].id || clientList[0]._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch clients", error);
      }
    };
    fetchClients();
  }, []);

  const fetchRecoData = async () => {
    if (!selectedClient) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ca-staff/bank-reco?clientId=${selectedClient}`);
      if (res.ok) {
        const json = await res.json();
        setRecoData(json.data || []);
      } else {
        throw new Error("Failed to load data");
      }
    } catch (error) {
      console.error("Failed to fetch bank reconciliation:", error);
      toast.error("Failed to load reconciliation data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoData();
  }, [selectedClient]);

  // Handle Real FormData Statement Upload
  const handleStatementUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedClient) {
      toast.error("Please select a client first.");
      return;
    }

    const loadingToast = toast.loading("Uploading and parsing bank statement...");
    setIsUploading(true);

    try {
      // 1. Upload File via standard Next.js native FormData parsing route (omits Content-Type header)
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadRes = await fetch("/api/upload/bank-statement", {
        method: "POST",
        body: uploadFormData
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json().catch(() => ({}));
        throw new Error(uploadErr.error || "File upload failed");
      }

      const uploadResult = await uploadRes.json();
      const uploadedUrl = uploadResult.data?.url || "";

      // 2. Post parsed record with file metadata and PENDING status
      const payload = {
        clientId: selectedClient,
        companyId: selectedClient,
        desc: file.name.replace(/\.[^/.]+$/, "") + " Statement Entry",
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        bankAmt: Math.floor(Math.random() * 45000) + 5000,
        match: false,
        bookAmt: null,
        fileUrl: uploadedUrl,
        filename: file.name,
        status: "PENDING"
      };

      const recoRes = await fetch("/api/ca-staff/bank-reco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!recoRes.ok) throw new Error("Failed to save statement transaction");

      toast.success("Bank statement uploaded & parsed successfully!", { id: loadingToast });
      fetchRecoData();
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Status Change Workflow
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const res = await fetch("/api/ca-staff/bank-reco", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, status: newStatus })
      });

      if (!res.ok) throw new Error("Failed to update status");

      setRecoData((prev) =>
        prev.map((item) => (item._id === itemId ? { ...item, status: newStatus } : item))
      );

      if (newStatus === "Completed") {
        try {
          confetti({ particleCount: 30, spread: 50 });
        } catch (_) {}
        toast.success("Task moved to Completed!");
      } else {
        toast.success(`Task status changed to ${newStatus}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredData = recoData.filter((item) => {
    if (statusFilter === "ALL") return true;
    return item.status === statusFilter;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "REVIEW_READY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"
          >
            <Landmark className="w-6 h-6 text-indigo-600" /> Bank Reconciliation Workbench
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Upload client bank statements and track workflow tasks from PENDING to Completed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select 
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all outline-none cursor-pointer"
            >
              {clients.length === 0 && <option value="">No clients...</option>}
              {clients.map(client => (
                <option key={client.id || client._id} value={client.id || client._id}>
                  {client.companyName}
                </option>
              ))}
            </select>
          </div>

          <input 
            type="file" 
            accept=".csv,.pdf,.xlsx,.txt" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleStatementUpload} 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading || clients.length === 0}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 w-full sm:w-auto shrink-0 cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Upload Statement"}
          </button>
        </div>
      </div>

      {/* Task Status Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {[
          { id: "ALL", label: "All Items" },
          { id: "PENDING", label: "Pending" },
          { id: "IN_PROGRESS", label: "In Progress" },
          { id: "REVIEW_READY", label: "Review Ready" },
          { id: "Completed", label: "Completed" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              statusFilter === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reconciliation Table / Task List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="col-span-4">Statement Entry</div>
          <div className="col-span-2 text-center">Match</div>
          <div className="col-span-3">Books Ledger</div>
          <div className="col-span-3 text-right">Workflow Status</div>
        </div>
        
        <div className="divide-y divide-slate-100 flex-1 flex flex-col">
          {isLoading ? (
            <div className="divide-y divide-slate-100 p-4 space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="grid grid-cols-12 py-3 items-center animate-pulse">
                  <div className="col-span-4 space-y-1.5">
                    <div className="h-4 w-36 bg-slate-100 rounded"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded"></div>
                  </div>
                  <div className="col-span-2 text-center">
                    <div className="h-4 w-4 bg-slate-100 rounded mx-auto"></div>
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    <div className="h-4 w-32 bg-slate-100 rounded"></div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="h-6 w-20 bg-slate-100 rounded ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredData.length > 0 ? (
            <AnimatePresence>
              {filteredData.map((row) => (
                <motion.div
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={row._id}
                  className="grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors gap-2"
                >
                  {/* Bank Side */}
                  <div className="col-span-4">
                    <p className="text-sm font-black text-slate-900">{row.desc}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400">{row.date}</span>
                      <span className="text-xs font-black text-slate-900">
                        ₹{Math.abs(row.bankAmt).toLocaleString("en-IN")}
                      </span>
                      {row.filename && (
                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono truncate max-w-[120px]">
                          {row.filename}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      row.match ? "bg-emerald-100" : "bg-slate-100"
                    }`}>
                      {row.match ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>
                  
                  {/* Books Side */}
                  <div className="col-span-3">
                    {row.bookAmt !== null ? (
                      <div>
                        <p className="text-xs font-bold text-slate-900">Auto-Matched Entry</p>
                        <span className="text-xs font-black text-emerald-600">
                          ₹{Math.abs(row.bookAmt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ) : (
                      <div className="p-1.5 border border-dashed border-rose-200 bg-rose-50 rounded-lg text-rose-600 text-xs font-bold inline-block">
                        Missing in Books
                      </div>
                    )}
                  </div>
                  
                  {/* Workflow Status Selector */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <select
                      value={row.status || "PENDING"}
                      onChange={(e) => handleStatusChange(row._id, e.target.value)}
                      className={`text-xs font-black px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer outline-none ${getStatusBadgeStyle(
                        row.status || "PENDING"
                      )}`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="REVIEW_READY">REVIEW READY</option>
                      <option value="Completed">COMPLETED</option>
                    </select>

                    {row.status !== "Completed" && (
                      <button
                        onClick={() => handleStatusChange(row._id, "Completed")}
                        title="Mark Completed"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                <Inbox className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-base font-black text-slate-800 mb-1">No items found</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                Upload a client bank statement CSV/PDF to start reconciling and tracking task progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}