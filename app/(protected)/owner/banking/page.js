"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Landmark, Wallet, ArrowUpRight, ArrowDownRight,
    Loader2, IndianRupee, History, Building
} from "lucide-react";

export default function CashAndBanking() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFinances = async () => {
            try {
                // Optimized: Ask the database for only Approved entries to save bandwidth
                const res = await fetch("/api/submissions?status=Approved");
                if (res.ok) {
                    const json = await res.json();
                    
                    // Filter out any entries that don't affect cash flow directly
                    const financialData = (json.data || []).filter(
                        item => item.amount > 0 && item.paymentMode
                    );
                    setTransactions(financialData);
                }
            } catch (error) {
                console.error("Failed to fetch finances:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinances();
    }, []);

    // Galla (Cash) & Bank Logic
    let cashBalance = 0;
    let bankBalance = 0;

    transactions.forEach((txn) => {
        const isMoneyIn = txn.type === "Customer Received";
        const isMoneyOut = txn.type === "Vendor Payment" || txn.type === "General Expense";
        const isCash = txn.paymentMode === "Cash";

        if (isMoneyIn) {
            if (isCash) cashBalance += txn.amount;
            else bankBalance += txn.amount;
        } else if (isMoneyOut) {
            if (isCash) cashBalance -= txn.amount;
            else bankBalance -= txn.amount;
        }
    });

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-6 sm:mb-8">
                <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Landmark className="w-6 h-6 text-indigo-600" /> Cash & Banking
                </motion.h1>
                <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                    Real-time view of your physical cash box and digital bank balances.
                </motion.p>
            </div>

            {isLoading ? (
                <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
                </div>
            ) : (
                <>
                    {/* Main Balances */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <Wallet className="w-24 h-24" />
                            </div>
                            <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-2">Cash in Hand (Galla)</p>
                            <h2 className="text-3xl sm:text-5xl font-black flex items-center mb-6">
                                <IndianRupee className="w-8 h-8 sm:w-10 sm:h-10 mr-1 opacity-80" />
                                {cashBalance.toLocaleString("en-IN")}
                            </h2>
                            <div className="flex items-center gap-2 text-emerald-100 text-sm font-semibold bg-emerald-800/30 w-max px-4 py-2 rounded-full backdrop-blur-sm">
                                <ArrowUpRight className="w-4 h-4" /> Updated in real-time
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <Building className="w-24 h-24" />
                            </div>
                            <p className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-2">Bank & UPI Balance</p>
                            <h2 className="text-3xl sm:text-5xl font-black flex items-center mb-6">
                                <IndianRupee className="w-8 h-8 sm:w-10 sm:h-10 mr-1 opacity-80" />
                                {bankBalance.toLocaleString("en-IN")}
                            </h2>
                            <div className="flex items-center gap-2 text-indigo-100 text-sm font-semibold bg-indigo-900/30 w-max px-4 py-2 rounded-full backdrop-blur-sm">
                                NEFT / RTGS / UPI Aggregated
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Ledger */}
                    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <History className="w-4 h-4 text-slate-500" /> Recent Financial Movements
                            </h3>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm font-medium">No approved cash/bank transactions yet.</div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                <AnimatePresence>
                                    {transactions.slice(0, 15).map((txn) => {
                                        const isMoneyIn = txn.type === "Customer Received";
                                        return (
                                            <motion.div layout key={txn._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isMoneyIn ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                                                        {isMoneyIn ? <ArrowDownRight className="w-5 h-5 text-emerald-500" /> : <ArrowUpRight className="w-5 h-5 text-rose-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{txn.partyName || "General"}</p>
                                                        <p className="text-xs font-bold text-slate-400 mt-0.5">{txn.type}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-sm font-black flex items-center justify-end ${isMoneyIn ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                        {isMoneyIn ? '+' : '-'}<IndianRupee className="w-3.5 h-3.5 mx-0.5" />{txn.amount.toLocaleString("en-IN")}
                                                    </p>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                        Via {txn.paymentMode}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}