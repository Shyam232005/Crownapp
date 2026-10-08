"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    DownloadCloud, Lock, Unlock, Loader2, Database, 
    FileText, CheckCircle2, Inbox 
} from "lucide-react";
import toast from "react-hot-toast";

export default function TallySyncPage() {
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [assignedClients, setAssignedClients] = useState([]);
    
    // We select the first client by default, but you can expand this to a dropdown later
    const [activeClient, setActiveClient] = useState(null);

    // Export/Sync States
    const [isRequesting, setIsRequesting] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [targetMonth, setTargetMonth] = useState("");

    useEffect(() => {
        // Set dynamic target month
        setTargetMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

        // 1. Fetch assigned clients from API
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/ca/clients');
                if (res.ok) {
                    const json = await res.json();
                    const clientsList = json.data.clients || [];
                    setAssignedClients(clientsList);
                    if (clientsList.length > 0) {
                        setActiveClient(clientsList[0]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch clients", error);
                toast.error("Failed to load connected clients");
            } finally {
                setIsLoadingClients(false);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        if (!activeClient || !targetMonth) return;

        // 2. Serverless Polling for Vault Status
        const checkVaultStatus = async () => {
            try {
                const res = await fetch(`/api/ca/vault-status?clientId=${activeClient.id}`);
                if (res.ok) {
                    const data = await res.json();
                    
                    if (data.status === "Unlocked") {
                        setIsUnlocked(true);
                        setIsRequesting(false);
                    } else if (data.status === "Requested") {
                        setIsRequesting(true);
                        setIsUnlocked(false);
                    } else {
                        setIsUnlocked(false);
                        setIsRequesting(false);
                    }
                }
            } catch (error) {
                console.error("Vault poll error", error);
            }
        };

        checkVaultStatus(); // Initial check
        const interval = setInterval(checkVaultStatus, 4000); // Poll every 4s
        return () => clearInterval(interval);
    }, [activeClient, targetMonth]);

    const requestAccess = async () => {
        if (!activeClient) return;
        
        setIsRequesting(true);
        try {
            const res = await fetch("/api/ca/vault-status", {
                method: "POST", // Creating a request
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId: activeClient.id, action: "REQUEST_ACCESS", month: targetMonth })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to send access request.");
            }
            toast.success("Request sent securely to Owner!");
        } catch (error) {
            toast.error(error.message);
            setIsRequesting(false);
        }
    };

    const downloadTallyData = async () => {
        if (!activeClient) return;
        
        const loadingToast = toast.loading("Generating secure Tally CSV...");
        setIsDownloading(true);
        
        try {
            // Fetch ONLY approved transactions for this specific client
            const res = await fetch(`/api/ca/export?clientId=${activeClient.id}`);
            
            if (!res.ok) throw new Error("Failed to generate export file");
            
            const json = await res.json();
            const approvedData = json.data || [];

            if (approvedData.length === 0) {
                toast.error("No approved entries found for this client.", { id: loadingToast });
                setIsDownloading(false);
                return;
            }

            // Generate Tally-Compatible CSV
            const headers = ["Date", "Party Name", "GSTIN", "Bill No", "Operation Type", "Payment Mode", "Total Amount", "Description"];

            const csvRows = [
                headers.join(","),
                ...approvedData.map(item => {
                    const date = item.transactionDate ? new Date(item.transactionDate).toLocaleDateString('en-IN') : new Date(item.createdAt).toLocaleDateString('en-IN');
                    const meta = item.metadata || {};
                    return `"${date}","${meta.vendorName || meta.customerName || ''}","${meta.gstin || ''}","${meta.invoiceNumber || ''}","${item.type}","${meta.paymentMode || ''}","${item.totalAmount}","${meta.description || ''}"`;
                })
            ].join("\n");

            const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `FineOps_Tally_Export_${activeClient.companyName.replace(/\s+/g, "_")}_${targetMonth.replace(" ", "_")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success("File downloaded successfully!", { id: loadingToast });

        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to sync with database. Please try again.", { id: loadingToast });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto pb-24">
            <div className="mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
                    <DownloadCloud className="w-6 h-6 text-indigo-600" /> Tally / ERP Sync
                </motion.h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Export approved client data directly to your accounting software.</p>
            </div>

            {isLoadingClients ? (
                <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm py-24 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
                    <p className="text-sm font-bold">Loading sync modules...</p>
                </div>
            ) : activeClient ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 shrink-0">
                                <Database className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">{activeClient.companyName}</h2>
                                <p className="text-xs sm:text-sm font-medium text-slate-500">Accounting Period: <span className="font-bold text-slate-700">{targetMonth}</span></p>
                            </div>
                        </div>
                        <div>
                            {isUnlocked ? (
                                <span className="flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100 w-full sm:w-auto">
                                    <Unlock className="w-3.5 h-3.5" /> Access Granted
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100 w-full sm:w-auto">
                                    <Lock className="w-3.5 h-3.5" /> Locked by Client
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 sm:p-8 rounded-xl border border-slate-100 text-center">
                        {isUnlocked ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-base font-black text-slate-800 mb-2">Data is unlocked and ready for sync</h3>
                                <p className="text-sm font-medium text-slate-500 mb-6 max-w-sm mx-auto">
                                    Only entries explicitly approved by the business owner will be exported. Pending items are excluded.
                                </p>

                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={downloadTallyData}
                                        disabled={isDownloading}
                                        className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                                        {isDownloading ? "Generating File..." : "Download Tally CSV"}
                                    </button>
                                </div>
                            </motion.div>
                        ) : isRequesting ? (
                            <div className="flex flex-col items-center py-6">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                                <p className="text-sm font-bold text-slate-800">Secure request sent to owner...</p>
                                <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs mx-auto">Waiting for {activeClient.ownerName} to open their FineOps app and click "Approve & Send".</p>
                            </div>
                        ) : (
                            <div className="py-2">
                                <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <FileText className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-base font-black text-slate-800 mb-2">Data Privacy Lock</h3>
                                <p className="text-sm font-medium text-slate-500 mb-6 max-w-sm mx-auto">
                                    In compliance with data privacy, you need client permission before exporting this month's financial entries.
                                </p>
                                <button
                                    onClick={requestAccess}
                                    className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl text-sm font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <Lock className="w-4 h-4" /> Request Access to Sync
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-6">
                        <Inbox className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-2">No Clients Linked</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-md">
                        You need active, linked clients to export accounting data. Once a business joins your firm using your invite code, their sync modules will appear here.
                    </p>
                </motion.div>
            )}
        </div>
    );
}