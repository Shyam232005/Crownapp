"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    CheckSquare, MessageSquare, Search,
    ArrowRight, Briefcase, FileText, IndianRupee, AlertCircle,
    Loader2, Coffee, ClipboardCheck, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
    }
};

export default function CAStaffDashboardUI() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        assignedClients: 0,
        pendingVouchers: 0,
        openQueries: 0
    });
    const [performance, setPerformance] = useState({
        pending: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
        completionRate: 100
    });
    const [reviewQueue, setReviewQueue] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/ca-staff/dashboard');
                if (res.ok) {
                    const json = await res.json();
                    setStats(json.data.stats || {});
                    setPerformance(json.data.performance || { pending: 0, inProgress: 0, completed: 0, total: 0, completionRate: 100 });
                    setReviewQueue(json.data.reviewQueue || []);
                } else {
                    throw new Error("Failed to load staff dashboard");
                }
            } catch (error) {
                console.error("Failed to fetch staff dashboard data:", error);
                toast.error("Could not fetch dashboard metrics");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black">
                        <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Audit Staff Review Queue
                    </h1>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 pl-10.5">
                    Assigned SME client portfolios, pending voucher scrutiny, and raised queries.
                </p>
            </motion.div>

            {/* Main Metric Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
                    <div className="w-12 h-12 bg-blue-50/80 rounded-2xl flex items-center justify-center mb-4 border border-blue-100/80 group-hover:scale-105 transition-transform">
                        <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Pending Vouchers</p>
                    <div className="min-h-[44px] flex items-center mb-4">
                        {isLoading ? (
                            <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                {stats.pendingVouchers} <span className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">entries</span>
                            </h2>
                        )}
                    </div>
                    <Link href="/ca-staff/voucher-scrutiny" className="text-blue-600 text-xs font-black uppercase tracking-wider hover:text-blue-700 flex items-center gap-1.5 w-max">
                        Start Scrutiny <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
                    <div className="w-12 h-12 bg-amber-50/80 rounded-2xl flex items-center justify-center mb-4 border border-amber-100/80 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Client Queries Raised</p>
                    <div className="min-h-[44px] flex items-center mb-4">
                        {isLoading ? (
                            <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                {stats.openQueries} <span className="text-xs font-black uppercase tracking-wider text-amber-600 ml-1">open</span>
                            </h2>
                        )}
                    </div>
                    <Link href="/ca-staff/voucher-scrutiny?filter=queries" className="text-amber-600 text-xs font-black uppercase tracking-wider hover:text-amber-700 flex items-center gap-1.5 w-max">
                        Manage Queries <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>

                <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
                    <div className="w-12 h-12 bg-indigo-50/80 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100/80 group-hover:scale-105 transition-transform">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Assigned SME Clients</p>
                    <div className="min-h-[44px] flex items-center mb-4">
                        {isLoading ? (
                            <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
                        ) : (
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                {stats.assignedClients} <span className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">businesses</span>
                            </h2>
                        )}
                    </div>
                    <Link href="/ca/clients" className="text-indigo-600 text-xs font-black uppercase tracking-wider hover:text-indigo-700 flex items-center gap-1.5 w-max">
                        View Directory <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </motion.div>

            {/* CA-Staff Work Performance Tracker */}
            <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Audit Scrutiny Performance Tracker</h3>
                            <p className="text-xs font-semibold text-slate-400">Real-time status breakdown across all assigned client vouchers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Overall Completion:</span>
                        <span className="text-xs font-black bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                            {performance.completionRate}% Done
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden my-4">
                    <div
                        className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, performance.completionRate))}%` }}
                    />
                </div>

                {/* 3 Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Review</p>
                            <h4 className="text-xl font-black text-amber-900 mt-0.5">{performance.pending}</h4>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Queries Raised (In Progress)</p>
                            <h4 className="text-xl font-black text-blue-900 mt-0.5">{performance.inProgress}</h4>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-blue-400" />
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Completed / Approved</p>
                            <h4 className="text-xl font-black text-emerald-900 mt-0.5">{performance.completed}</h4>
                        </div>
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                </div>
            </motion.div>

            {/* Priority Review Queue List */}
            <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[320px]">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" /> Priority Scrutiny Queue
                    </h3>
                    {reviewQueue.length > 0 && (
                        <Link href="/ca-staff/voucher-scrutiny" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                            View All Queue
                        </Link>
                    )}
                </div>
                
                <div className="divide-y divide-slate-100/80 flex-1 flex flex-col">
                    {isLoading ? (
                        /* Shimmering Skeletons */
                        <div className="p-6 space-y-4">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 animate-pulse">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-200/60 rounded-xl" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-40 bg-slate-200/60 rounded-md" />
                                            <div className="h-3 w-20 bg-slate-100 rounded-md" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-24 bg-slate-200/60 rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : reviewQueue.length > 0 ? (
                        <AnimatePresence>
                            {reviewQueue.map((item, idx) => (
                                <motion.div 
                                    key={item.id || idx}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/80 transition-colors gap-4 group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <FileText className="w-5 h-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 tracking-tight">{item.client}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    {item.type}
                                                </span>
                                                <span className="text-[11px] font-semibold text-slate-400">{item.date}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                                        <p className="text-sm font-black text-slate-900 flex items-center font-mono">
                                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" /> {Number(item.amount).toLocaleString("en-IN")}
                                        </p>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                                            item.status === 'Missing GSTIN' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                            item.status === 'Query Raised' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <Link 
                                            href={`/ca-staff/voucher-scrutiny?client=${item.clientId || ''}`}
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="button"
                                                className="bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-center cursor-pointer shadow-xs"
                                            >
                                                Review
                                            </motion.button>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        /* Organic Zero State */
                        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-br from-slate-50/60 via-indigo-50/20 to-slate-50/60">
                            <motion.div 
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="w-16 h-16 bg-white border border-slate-200/80 rounded-3xl flex items-center justify-center mb-4 shadow-sm"
                            >
                                <Coffee className="w-7 h-7 text-slate-400 animate-pulse" />
                            </motion.div>
                            <h4 className="text-base font-black text-slate-800 tracking-tight mb-1">Queue is Clear</h4>
                            <p className="text-xs font-semibold text-slate-400 max-w-sm leading-relaxed">
                                You have no pending scrutinies or priority alerts right now. When clients submit approved records, they will automatically appear here.
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}