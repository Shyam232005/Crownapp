"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, LockKeyhole, FileKey, Send, CheckCircle2, Clock } from "lucide-react";

let socket;

export default function CAAccessManagement() {
    const [dataRequests, setDataRequests] = useState([]);
    const [sentHistory, setSentHistory] = useState([]);

    useEffect(() => {
        socket = io();

        // Jab CA request bhejega
        socket.on("owner-ca-alert", (req) => {
            setDataRequests((prev) => [{ ...req, id: Date.now(), status: "Pending" }, ...prev]);
        });

        return () => { if (socket) socket.disconnect(); };
    }, []);

    const handleApprove = (request) => {
        // 1. UI se hato aur history mein dalo
        setDataRequests((prev) => prev.filter((r) => r.id !== request.id));
        setSentHistory((prev) => [{ ...request, sentAt: new Date().toLocaleTimeString('en-IN') }, ...prev]);

        // 2. Socket ke through CA ko data unlock ka signal bhejo
        if (socket) {
            socket.emit("owner-approve-data", { month: request.month, status: "Approved", ownerId: "owner-1" });
        }

        // Notification for Owner
        alert(`Success: ${request.month} data securely sent to your CA!`);
    };

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" /> CA Data Access
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">Control what data your CA and their staff can view.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Requests Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <LockKeyhole className="w-4 h-4 text-amber-500" /> Pending Access Requests
                    </h2>

                    {dataRequests.length === 0 ? (
                        <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100 border-dashed">
                            <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-600">Your data is locked & secure.</p>
                            <p className="text-xs font-medium text-slate-400">No pending requests from CA.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {dataRequests.map((req) => (
                                <motion.div
                                    layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                    key={req.id}
                                    className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-3 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">CA requesting <span className="text-indigo-600">{req.month}</span> Data</p>
                                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> Requested just now</p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApprove(req)}
                                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
                                    >
                                        <Send className="w-3 h-3" /> Approve & Send
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* History / Sent Data Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data Sent to CA
                    </h2>
                    <div className="space-y-3">
                        {sentHistory.length === 0 ? (
                            <p className="text-sm font-medium text-slate-400 text-center py-4">No data shared yet.</p>
                        ) : (
                            sentHistory.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileKey className="w-5 h-5 text-emerald-600" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{item.month} Accounting Data</p>
                                            <p className="text-[10px] font-medium text-slate-500">Access granted at {item.sentAt}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Unlocked</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}