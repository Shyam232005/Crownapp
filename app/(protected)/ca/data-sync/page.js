"use client";
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { 
    DownloadCloud, Lock, Unlock, Loader2, Database, 
    FileText, CheckCircle2, Inbox 
} from "lucide-react";

let socket;

export default function TallySyncPage() {
    // ✨ FIX: Client state setup for Zero-State handling
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [assignedClients, setAssignedClients] = useState([]);

    // Export/Sync States
    const [isRequesting, setIsRequesting] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Real-world scenario mein yeh dynamic hoga (e.g., dropdown se select karna)
    const targetMonth = "September 2026";

    useEffect(() => {
        // ✨ Mock API Call: Fetch assigned clients
        const fetchClients = async () => {
            // Later: const res = await fetch('/api/ca/clients');
            setTimeout(() => {
                setAssignedClients([]); // True zero-state: 0 clients assigned
                setIsLoadingClients(false);
            }, 800);
        };
        fetchClients();

        // Check if previously unlocked (Local persistence)
        const accessStatus = localStorage.getItem(`ca_access_${targetMonth}`);
        if (accessStatus === "granted") {
            setIsUnlocked(true);
        }

        socket = io();

        // Listen for Owner's Approval
        socket.on("ca-data-unlocked", (data) => {
            if (data.month === targetMonth) {
                setIsRequesting(false);
                setIsUnlocked(true);
                localStorage.setItem(`ca_access_${targetMonth}`, "granted");
            }
        });

        return () => { if (socket) socket.disconnect(); };
    }, []);

    const requestAccess = () => {
        setIsRequesting(true);
        if (socket) {
            socket.emit("ca-request-data", { month: targetMonth, caName: "Firm Admin" });
        }
    };

    // 🔴 REAL DATABASE FETCH & EXPORT LOGIC
    const downloadTallyData = async () => {
        setIsDownloading(true);
        try {
            // 1. Fetch REAL data from MongoDB
            const res = await fetch("/api/submissions");
            const json = await res.json();

            // 2. Filter only "Approved" entries (CA ko pending/rejected nahi dikhna chahiye)
            const approvedData = (json.data || []).filter(item => item.status === "Approved");

            if (approvedData.length === 0) {
                alert("No approved entries found for this client yet.");
                setIsDownloading(false);
                return;
            }

            // 3. Format into Tally-ready CSV
            const headers = ["Date", "Party Name", "GSTIN", "Bill No", "Operation Type", "Payment Mode", "Total Amount", "Description"];

            const csvRows = [
                headers.join(","), // Header row
                ...approvedData.map(item => {
                    const date = item.billDate || new Date(item.createdAt).toLocaleDateString('en-IN');
                    // Quotes "" wrap karna zaroori hai taaki description ka comma CSV na tode
                    return `"${date}","${item.partyName || ''}","${item.gstin || ''}","${item.billNumber || ''}","${item.type}","${item.paymentMode || ''}","${item.amount}","${item.description || ''}"`;
                })
            ].join("\n");

            // 4. Trigger Auto-Download in Browser
            const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `FineOps_Tally_Export_${targetMonth.replace(" ", "_")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to sync with database. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="p-8 w-full max-w-5xl">
            <div className="mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <DownloadCloud className="w-6 h-6 text-indigo-600" /> Tally / ERP Sync
                </motion.h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Export approved client data directly to your accounting software.</p>
            </div>

            {isLoadingClients ? (
                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-20 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
                    <p className="text-sm font-bold">Loading sync modules...</p>
                </div>
            ) : assignedClients.length > 0 ? (
                // MAP THROUGH CLIENTS (Using the first one as a demo implementation)
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                <Database className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">FineOps Technologies</h2>
                                <p className="text-sm font-medium text-slate-500">Accounting Period: <span className="font-bold text-slate-700">{targetMonth}</span></p>
                            </div>
                        </div>
                        <div>
                            {isUnlocked ? (
                                <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">
                                    <Unlock className="w-3.5 h-3.5" /> Access Granted
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-xs font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg border border-rose-100">
                                    <Lock className="w-3.5 h-3.5" /> Locked by Client
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 text-center">
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
                                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-70"
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
                                <p className="text-xs font-medium text-slate-500 mt-1 max-w-xs mx-auto">Waiting for client to open their FineOps app and click "Approve & Send".</p>
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
                                    className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Lock className="w-4 h-4" /> Request Access to Sync
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                // ✨ FIX: Zero-State UI for empty client list
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