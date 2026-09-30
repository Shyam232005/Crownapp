"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    LayoutDashboard, IndianRupee, Clock, Users,
    ArrowRight, ShieldCheck, Building, Receipt,
    ChevronRight, CheckCircle2
} from "lucide-react";

export default function OwnerDashboardUI() {
    // Dummy Data for UI phase
    const stats = {
        pendingApprovals: 12,
        cashBalance: 245000,
        pendingDues: 85000
    };

    const recentApprovals = [
        { id: 1, type: "General Expense", party: "Office Supplies", amount: 2500, time: "2 hours ago" },
        { id: 2, type: "Vendor Payment", party: "Sharma Hardware", amount: 15000, time: "4 hours ago" },
        { id: 3, type: "Leave", party: "Ramesh (Staff)", amount: 0, time: "5 hours ago" },
    ];

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
                    <h2 className="text-4xl font-black mb-4 relative z-10">{stats.pendingApprovals} <span className="text-lg font-bold text-amber-200">pending</span></h2>
                    <Link href="/owner/approvals" className="inline-flex relative z-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                        Review Queue <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden group">
                    <Building className="w-24 h-24 absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Total Balance (Galla + Bank)</p>
                    <h2 className="text-4xl font-black flex items-center mb-4 relative z-10">
                        <IndianRupee className="w-8 h-8 mr-1 opacity-80" /> {stats.cashBalance.toLocaleString("en-IN")}
                    </h2>
                    <Link href="/owner/cash-banking" className="inline-flex relative z-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                        View Ledger <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 relative overflow-hidden group">
                    <Users className="w-24 h-24 absolute -right-4 -top-4 opacity-20 group-hover:scale-110 transition-transform" />
                    <p className="text-rose-100 text-sm font-bold uppercase tracking-wider mb-1 relative z-10">Pending Recoveries (Udhaar)</p>
                    <h2 className="text-4xl font-black flex items-center mb-4 relative z-10">
                        <IndianRupee className="w-8 h-8 mr-1 opacity-80" /> {stats.pendingDues.toLocaleString("en-IN")}
                    </h2>
                    <Link href="/owner/sales" className="inline-flex relative z-10 items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm transition-colors">
                        Track Customers <ArrowRight className="w-4 h-4" />
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
                        <Link href="/owner/approvals" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            View All <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="divide-y divide-slate-100 flex-1">
                        {recentApprovals.map((item) => (
                            <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                                        <Receipt className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900">{item.party}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{item.type}</span>
                                            <span className="text-[10px] font-medium text-slate-400">{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                                {item.amount > 0 && (
                                    <p className="text-sm font-black text-slate-900 flex items-center">
                                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {item.amount.toLocaleString("en-IN")}
                                    </p>
                                )}
                            </div>
                        ))}
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
                            Your CA has not requested any new data recently. Your financial records are locked and secure.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <p className="text-xs font-bold text-slate-300">August Data Exported</p>
                        </div>
                        <Link href="/owner/ca-access" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold transition-colors shadow-sm">
                            Manage CA Access
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}