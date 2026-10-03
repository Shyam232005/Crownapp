"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    CheckSquare, MessageSquare, Search,
    ArrowRight, Briefcase, FileText, IndianRupee, AlertCircle,
    Loader2, Coffee
} from "lucide-react";

export default function CAStaffDashboardUI() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        assignedClients: 0,
        pendingVouchers: 0,
        openQueries: 0
    });
    const [reviewQueue, setReviewQueue] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/ca-staff/dashboard');
                if (res.ok) {
                    const json = await res.json();
                    setStats(json.data.stats);
                    setReviewQueue(json.data.reviewQueue || []);
                }
            } catch (error) {
                console.error("Failed to fetch staff dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
            {/* Header */}
            <div className="mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-indigo-600" /> Review Queue & Dashboard[cite: 20]
                </motion.h1>
                <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    Welcome back. Here are your assigned tasks and pending scrutinies for today[cite: 20].
                </motion.p>
            </div>

            {/* Main Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                        <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Vouchers[cite: 20]</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center">
                        {isLoading ? <Loader2 className="w-7 h-7 animate-spin text-slate-400" /> : stats.pendingVouchers}[cite: 20]
                        {!isLoading && <span className="text-sm font-bold text-slate-500 ml-2">entries[cite: 20]</span>}
                    </h2>
                    <Link href="/ca-staff/scrutiny" className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center gap-1 w-max">
                        Start Scrutiny <ArrowRight className="w-4 h-4" />[cite: 20]
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 border border-amber-100">
                        <MessageSquare className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Queries Raised[cite: 20]</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center">
                        {isLoading ? <Loader2 className="w-7 h-7 animate-spin text-slate-400" /> : stats.openQueries}[cite: 20]
                        {!isLoading && <span className="text-sm font-bold text-slate-500 ml-2">open[cite: 20]</span>}
                    </h2>
                    <Link href="/ca-staff/queries" className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 w-max">
                        Manage Queries <ArrowRight className="w-4 h-4" />[cite: 20]
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Clients[cite: 20]</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center">
                        {isLoading ? <Loader2 className="w-7 h-7 animate-spin text-slate-400" /> : stats.assignedClients}[cite: 20]
                        {!isLoading && <span className="text-sm font-bold text-slate-500 ml-2">businesses[cite: 20]</span>}
                    </h2>
                    <Link href="/ca-staff/clients" className="text-indigo-600 text-sm font-bold hover:text-indigo-700 flex items-center gap-1 w-max">
                        View Clients <ArrowRight className="w-4 h-4" />[cite: 20]
                    </Link>
                </motion.div>
            </div>

            {/* Priority Review Queue List */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[300px]">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Priority Scrutiny Queue[cite: 20]
                    </h3>
                    {reviewQueue.length > 0 && (
                        <Link href="/ca-staff/scrutiny" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            View All[cite: 20]
                        </Link>
                    )}
                </div>
                
                <div className="divide-y divide-slate-100 flex-1 flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                            <p className="text-sm font-bold">Loading tasks...[cite: 20]</p>
                        </div>
                    ) : reviewQueue.length > 0 ? (
                        reviewQueue.map((item) => (
                            <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{item.client}[cite: 20]</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                                {item.type}[cite: 20]
                                            </span>
                                            <span className="text-xs font-medium text-slate-400">{item.date}[cite: 20]</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                                    <p className="text-sm font-black text-slate-900 flex items-center">
                                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {item.amount.toLocaleString("en-IN")}[cite: 20]
                                    </p>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.status === 'Missing GSTIN' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {item.status}[cite: 20]
                                    </span>
                                    <button className="bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                        Review[cite: 20]
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Coffee className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="text-base font-black text-slate-800 mb-1">Queue is Clear[cite: 20]</h4>
                            <p className="text-sm font-medium text-slate-500 max-w-sm">
                                You have no pending scrutinies or priority alerts right now. Enjoy the break![cite: 20]
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}