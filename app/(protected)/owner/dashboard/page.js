"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    LayoutDashboard, IndianRupee, Clock, Users,
    ArrowRight, ShieldCheck, Building, Receipt,
    ChevronRight, CheckCircle2, Coffee, Sparkles,
    TrendingUp, ArrowUpRight, FolderCheck, Copy, Check
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

export default function OwnerDashboardUI() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingApprovals: 0,
        cashBalance: 0, // Total Sales (Income)
        pendingDues: 0  // Total Purchases + Expenses
    });
    const [profile, setProfile] = useState({
        inviteCode: "",
        companyName: "",
        name: ""
    });
    const [copied, setCopied] = useState(false);
    
    const [recentApprovals, setRecentApprovals] = useState([]);

    const handleCopyInviteCode = async () => {
        if (!profile.inviteCode) return;
        try {
            await navigator.clipboard.writeText(profile.inviteCode);
            setCopied(true);
            toast.success("Team Invite Code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy invite code.");
        }
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Aggregated Stats
                const statsRes = await fetch("/api/owner/stats");
                if (statsRes.ok) {
                    const statsJson = await statsRes.json();
                    setStats({
                        pendingApprovals: statsJson.data.pendingApprovals || 0,
                        cashBalance: statsJson.data.totalIncome || 0,
                        pendingDues: statsJson.data.totalExpense || 0
                    });
                }

                // 2. Fetch Pending Review Queue
                const queueRes = await fetch("/api/owner/pending-transactions");
                if (queueRes.ok) {
                    const queueJson = await queueRes.json();
                    setRecentApprovals(queueJson.data || []);
                }

                // 3. Fetch Owner Profile & Invite Code
                const profileRes = await fetch("/api/owner/profile");
                if (profileRes.ok) {
                    const profileJson = await profileRes.json();
                    if (profileJson.success) {
                        setProfile({
                            inviteCode: profileJson.inviteCode || "",
                            companyName: profileJson.companyName || "",
                            name: profileJson.name || ""
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to fetch owner dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="mb-6">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-black">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Business Executive Overview
                    </h1>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-400 pl-10.5">
                    Real-time cash flow metrics, verification pipeline, and double-entry health.
                </p>
            </motion.div>

            {/* Team Onboarding & Invite Code Banner */}
            <motion.div 
                variants={itemVariants}
                className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-slate-50/50 border border-indigo-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex items-start sm:items-center gap-3.5 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                                Team Onboarding Passcode
                            </h3>
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                                Staff Access
                            </span>
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                            Share this unique invite code with your employees so they link directly to{" "}
                            <span className="font-bold text-slate-700">{profile.companyName || "your business"}</span> during registration.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10 shrink-0">
                    {isLoading || !profile.inviteCode ? (
                        <div className="h-11 w-44 bg-slate-200/70 rounded-xl animate-pulse" />
                    ) : (
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-indigo-200/80 shadow-sm">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Code:</span>
                            <code className="text-base font-black text-indigo-700 tracking-wider font-mono select-all">
                                {profile.inviteCode}
                            </code>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={handleCopyInviteCode}
                                className="ml-2 p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center cursor-pointer"
                                title="Copy Invite Code"
                                aria-label="Copy Invite Code"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                ) : (
                                    <Copy className="w-4 h-4 text-indigo-600" />
                                )}
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Main Metric Cards Grid (Staggered Entrance) */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* 1. Action Required Card */}
                <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-500/15 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                    <Clock className="w-24 h-24 absolute -right-4 -top-4 opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <span className="w-2 h-2 rounded-full bg-amber-200 animate-ping" />
                        <p className="text-amber-100 text-xs font-black uppercase tracking-wider">Action Required</p>
                    </div>

                    <div className="min-h-[52px] flex items-center mb-5 relative z-10">
                        {isLoading ? (
                            <div className="h-10 w-32 bg-white/20 rounded-xl animate-pulse" />
                        ) : (
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-4xl sm:text-5xl font-black tracking-tight">{stats.pendingApprovals}</h2>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-200/90 bg-white/15 px-2 py-0.5 rounded-full">
                                    Vouchers
                                </span>
                            </div>
                        )}
                    </div>

                    <Link href="/owner/approvals" className="inline-block relative z-10">
                        <motion.button 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                        >
                            Review Queue <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </Link>
                </div>

                {/* 2. Total Income Card */}
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/15 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                    <Building className="w-24 h-24 absolute -right-4 -top-4 opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                        <p className="text-emerald-100 text-xs font-black uppercase tracking-wider">Realized Revenue</p>
                    </div>

                    <div className="min-h-[52px] flex items-center mb-5 relative z-10">
                        {isLoading ? (
                            <div className="h-10 w-40 bg-white/20 rounded-xl animate-pulse" />
                        ) : (
                            <h2 className="text-3xl sm:text-4xl font-black flex items-center tracking-tight">
                                <IndianRupee className="w-7 h-7 mr-0.5 opacity-80" /> 
                                {stats.cashBalance.toLocaleString("en-IN")}
                            </h2>
                        )}
                    </div>

                    <Link href="/owner/banking" className="inline-block relative z-10">
                        <motion.button 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                        >
                            View Ledger <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </Link>
                </div>

                {/* 3. Total Expenses Card */}
                <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-500/15 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                    <Receipt className="w-24 h-24 absolute -right-4 -top-4 opacity-15 group-hover:scale-110 transition-transform duration-500 pointer-events-none" />
                    
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <Users className="w-3.5 h-3.5 text-rose-200" />
                        <p className="text-rose-100 text-xs font-black uppercase tracking-wider">Outflow & Expenses</p>
                    </div>

                    <div className="min-h-[52px] flex items-center mb-5 relative z-10">
                        {isLoading ? (
                            <div className="h-10 w-40 bg-white/20 rounded-xl animate-pulse" />
                        ) : (
                            <h2 className="text-3xl sm:text-4xl font-black flex items-center tracking-tight">
                                <IndianRupee className="w-7 h-7 mr-0.5 opacity-80" /> 
                                {stats.pendingDues.toLocaleString("en-IN")}
                            </h2>
                        )}
                    </div>

                    <Link href="/owner/sales" className="inline-block relative z-10">
                        <motion.button 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase backdrop-blur-md transition-colors shadow-sm cursor-pointer"
                        >
                            Track Outflows <ArrowRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Bottom Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Approvals Queue Container */}
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-black text-slate-800">Waiting for Owner Approval</h3>
                        </div>
                        {recentApprovals.length > 0 && (
                            <Link href="/owner/approvals" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                                Review Queue <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                    
                    <div className="divide-y divide-slate-100/80 flex-1 flex flex-col max-h-[380px] overflow-y-auto">
                        {isLoading ? (
                            /* Shimmering High-Fidelity Skeletons */
                            <div className="p-6 space-y-4">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 animate-pulse">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                                            <div className="space-y-2">
                                                <div className="h-4 w-40 bg-slate-200 rounded-md" />
                                                <div className="h-3 w-24 bg-slate-100 rounded-md" />
                                            </div>
                                        </div>
                                        <div className="h-4 w-20 bg-slate-200 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ) : recentApprovals.length > 0 ? (
                            <AnimatePresence>
                                {recentApprovals.map((item, idx) => (
                                    <motion.div 
                                        key={item._id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                                        transition={{ duration: 0.25, delay: idx * 0.04 }}
                                        className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                <Receipt className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">
                                                    {item.metadata?.vendorName || item.metadata?.customerName || "Internal Expense"}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                        item.type === 'SALES' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' :
                                                        item.type === 'PURCHASE' ? 'bg-blue-50 text-blue-700 border border-blue-200/60' :
                                                        'bg-amber-50 text-amber-700 border border-amber-200/60'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                    <span className="text-[11px] font-semibold text-slate-400">
                                                        {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 flex items-center font-mono">
                                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" /> 
                                            {item.totalAmount?.toLocaleString("en-IN")}
                                        </p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            /* Organic Zero State (Phase 2 requirement) */
                            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-br from-slate-50/60 via-indigo-50/30 to-slate-50/60">
                                <motion.div 
                                    animate={{ y: [0, -6, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-16 h-16 bg-white border border-indigo-100 rounded-3xl flex items-center justify-center mb-4 shadow-sm shadow-indigo-100/50"
                                >
                                    <Coffee className="w-7 h-7 text-indigo-500 animate-pulse" />
                                </motion.div>
                                <h4 className="text-base font-black text-slate-800 tracking-tight">Queue is Clear & Balanced</h4>
                                <p className="text-xs font-semibold text-slate-400 max-w-sm mt-1 leading-relaxed">
                                    All staff-submitted vouchers have been approved or processed. New entries logged by your team will appear here in real-time.
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* CA Sync & Data Vault Mini-Card */}
                <motion.div variants={itemVariants} className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700/80 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-black tracking-tight mb-2">Zero-Trust Data Vault</h3>
                        <p className="text-xs font-medium text-slate-400 leading-relaxed mb-6">
                            Lock or unlock monthly ledgers for your appointed Chartered Accountant firm. All transfers are cryptographically scoped.
                        </p>
                    </div>

                    <div className="relative z-10 pt-4 border-t border-slate-800">
                        <Link href="/owner/ca-hub" className="block">
                            <motion.button 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.97 }}
                                type="button"
                                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20 cursor-pointer"
                            >
                                <FolderCheck className="w-4 h-4" /> Open CA Hub
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}