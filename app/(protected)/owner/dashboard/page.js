"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    LayoutDashboard, IndianRupee, Clock, Users,
    ArrowRight, ShieldCheck, Building, Receipt,
    ChevronRight, CheckCircle2, Coffee, Loader2
} from "lucide-react";

export default function OwnerDashboardUI() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingApprovals: 0,
        cashBalance: 0, // Maps to Total Sales (Income)
        pendingDues: 0  // Maps to Total Purchases + Expenses
    });
    
    // We will store the actual Transaction objects here
    const [recentApprovals, setRecentApprovals] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Aggregated Stats from our new Double-Entry engine
                const statsRes = await fetch("/api/owner/stats");
                if (statsRes.ok) {
                    const statsJson = await statsRes.json();
                    setStats({
                        pendingApprovals: statsJson.data.pendingApprovals || 0,
                        cashBalance: statsJson.data.totalIncome || 0,
                        pendingDues: statsJson.data.totalExpense || 0
                    });
                }

                // 2. Fetch the Pending CA Review Queue
                const queueRes = await fetch("/api/owner/pending-transactions");
                if (queueRes.ok) {
                    const queueJson = await queueRes.json();
                    setRecentApprovals(queueJson.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch owner dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        
        // Auto-update stats every 10 seconds
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
            {/* Header */}
            <div className="mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-indigo-600" /> Business Overview
                </motion.h1>
                <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    Welcome back. Here is what's happening in your business today.
                </motion.p>
            </div>

            {/* Main Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-200 relative overflow-hidden group">
                    <Clock className="w-24 h-24 absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-amber-100 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Action Required</p>
                    <h2 className="text-4xl font-black mb-4 relative z-10">
                        {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.pendingApprovals} 
                        {!isLoading && <span className="text-lg font-bold text-amber-200 ml-2">pending</span>}
                    </h2>
                    <Link href="/owner/approvals" className="inline-flex relative z-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                        Review Queue <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
                    <Building className="w-24 h-24 absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Total Income</p>
                    <h2 className="text-4xl font-black flex items-center mb-4 relative z-10">
                        <IndianRupee className="w-8 h-8 mr-1 opacity-80" /> 
                        {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.cashBalance.toLocaleString("en-IN")}
                    </h2>
                    <Link href="/owner/banking" className="inline-flex relative z-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                        View Ledger <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 relative overflow-hidden group">
                    <Users className="w-24 h-24 absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-rose-100 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Total Expenses</p>
                    <h2 className="text-4xl font-black flex items-center mb-4 relative z-10">
                        <IndianRupee className="w-8 h-8 mr-1 opacity-80" /> 
                        {isLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.pendingDues.toLocaleString("en-IN")}
                    </h2>
                    <Link href="/owner/sales" className="inline-flex relative z-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                        Track Spend <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Pending Approvals Mini-List */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" /> Waiting for Approval
                        </h3>
                        {recentApprovals.length > 0 && (
                            <Link href="/owner/approvals" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                View All <ChevronRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                    
                    <div className="divide-y divide-slate-100 flex-1 flex flex-col max-h-[350px] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                                <p className="text-sm font-bold">Loading queue...</p>
                            </div>
                        ) : recentApprovals.length > 0 ? (
                            recentApprovals.map((item) => (
                                <div key={item._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                            <Receipt className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900">
                                                {/* Pull from Transaction metadata */}
                                                {item.metadata?.vendorName || item.metadata?.customerName || "Internal Expense"}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                    item.type === 'SALES' ? 'bg-emerald-100 text-emerald-600' :
                                                    item.type === 'PURCHASE' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-orange-100 text-orange-600'
                                                }`}>
                                                    {item.type}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-slate-900 flex items-center">
                                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {item.totalAmount?.toLocaleString("en-IN")}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-4">
                                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                                    <Coffee className="w-8 h-8 text-slate-400" />
                                </div>
                                <h4 className="text-base font-black text-slate-800 mb-1">You're all caught up!</h4>
                                <p className="text-sm font-medium text-slate-500 max-w-sm">
                                    No pending approvals in your queue right now. Go grab a coffee or review your ledger.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Compliance & Setup Mini-Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-200 flex flex-col justify-between">
                    <div>
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black mb-2">CA Sync Status</h3>
                        <p className="text-sm font-medium text-slate-400 mb-6">
                            Manage permissions and approve pending Data Privacy Vault requests from your CA here.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Link href="/owner/approvals" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                            Manage Data Vault
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}