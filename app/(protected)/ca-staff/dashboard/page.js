"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    CheckSquare, MessageSquare, Search,
    ArrowRight, Briefcase, FileText, IndianRupee, AlertCircle
} from "lucide-react";

export default function CAStaffDashboardUI() {
    // Dummy Metrics
    const stats = {
        assignedClients: 8,
        pendingVouchers: 45,
        openQueries: 12
    };

    // Dummy Pending Queue
    const reviewQueue = [
        { id: 1, client: "FineOps Technologies", type: "Vendor Payment", amount: 25000, date: "12 Oct 2026", status: "Needs Scrutiny" },
        { id: 2, client: "Sharma Traders", type: "Sales Invoice", amount: 12500, date: "11 Oct 2026", status: "Missing GSTIN" },
        { id: 3, client: "FineOps Technologies", type: "General Expense", amount: 4500, date: "10 Oct 2026", status: "Needs Scrutiny" },
    ];

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
            {/* Header */}
            <div className="mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-6 h-6 text-indigo-600" /> Review Queue & Dashboard
                </motion.h1>
                <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    Welcome back. Here are your assigned tasks and pending scrutinies for today.
                </motion.p>
            </div>

            {/* Main Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 border border-blue-100">
                        <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Vouchers</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">{stats.pendingVouchers} <span className="text-sm font-bold text-slate-500">entries</span></h2>
                    <Link href="/ca-staff/scrutiny" className="text-blue-600 text-sm font-bold hover:text-blue-700 flex items-center gap-1 w-max">
                        Start Scrutiny <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 border border-amber-100">
                        <MessageSquare className="w-6 h-6 text-amber-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Client Queries Raised</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">{stats.openQueries} <span className="text-sm font-bold text-slate-500">open</span></h2>
                    <Link href="/ca-staff/queries" className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 w-max">
                        Manage Queries <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
                        <Briefcase className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Clients</p>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">{stats.assignedClients} <span className="text-sm font-bold text-slate-500">businesses</span></h2>
                    <Link href="/ca-staff/clients" className="text-indigo-600 text-sm font-bold hover:text-indigo-700 flex items-center gap-1 w-max">
                        View Clients <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>

            {/* Priority Review Queue List */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" /> Priority Scrutiny Queue
                    </h3>
                    <Link href="/ca-staff/scrutiny" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                        View All
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                    {reviewQueue.map((item) => (
                        <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">{item.client}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                            {item.type}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">{item.date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                                <p className="text-sm font-black text-slate-900 flex items-center">
                                    <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {item.amount.toLocaleString("en-IN")}
                                </p>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${item.status === 'Missing GSTIN' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    {item.status}
                                </span>
                                <button className="bg-white border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 px-4 py-2 rounded-lg text-xs font-bold transition-all">
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}