"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, ReceiptText, Filter, Loader2, IndianRupee,
    TrendingUp, ArrowDownToLine, CheckCircle2
} from "lucide-react";

export default function SalesAndCustomers() {
    const [salesData, setSalesData] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Sales");

    useEffect(() => {
        const fetchSales = async () => {
            try {
                // Fetching from our new dynamic transaction API
                const res = await fetch("/api/owner/transactions?type=SALES");
                if (res.ok) {
                    const json = await res.json();
                    const data = json.data || [];
                    
                    setSalesData(data);

                    const custMap = {};
                    data.forEach((entry) => {
                        // In our smart backend, the customer name is stored in metadata.vendorName
                        const customerName = entry.metadata?.vendorName; 
                        if (customerName) {
                            const name = customerName.trim();
                            if (!custMap[name]) custMap[name] = { name, totalBilled: 0, totalPaid: 0, pending: 0 };

                            if (entry.type === "SALES") {
                                custMap[name].totalBilled += entry.totalAmount;
                                // For MVP: Assuming pending is total billed until the Collections module is built
                                custMap[name].pending += entry.totalAmount; 
                            }
                        }
                    });

                    setCustomers(Object.values(custMap).sort((a, b) => b.pending - a.pending));
                }
            } catch (error) {
                console.error("Failed to fetch sales:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSales();
    }, []);

    const stats = {
        totalRevenue: customers.reduce((acc, curr) => acc + curr.totalBilled, 0),
        totalRecovered: customers.reduce((acc, curr) => acc + curr.totalPaid, 0),
        totalPending: customers.reduce((acc, curr) => acc + curr.pending, 0)
    };

    const invoiceList = salesData.filter(d => d.type === "SALES");

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
                <div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-600" /> Sales & Customers
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500">
                        Track revenue, collections, and pending dues in real-time.
                    </motion.p>
                </div>
                <Link
                    href="/owner/khata"
                    className="w-full sm:w-auto bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-xl text-sm font-bold border border-indigo-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Users className="w-4 h-4" /> Open Customer Khata
                </Link>
            </div>

            {/* Analytics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-indigo-500 col-span-2 md:col-span-1">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Revenue</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 text-slate-900" />
                            {stats.totalRevenue.toLocaleString("en-IN")}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <ReceiptText className="w-5 h-5 text-indigo-500" />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Amount Recovered</p>
                        <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
                            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 text-slate-900" />
                            {stats.totalRecovered.toLocaleString("en-IN")}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <ArrowDownToLine className="w-5 h-5 text-emerald-500" />
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-rose-500">
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Dues (Udhaar)</p>
                        <p className="text-xl sm:text-2xl font-black text-rose-600 flex items-center">
                            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 text-rose-600" />
                            {stats.totalPending.toLocaleString("en-IN")}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-rose-500" />
                    </div>
                </motion.div>
            </div>

            <div className="flex gap-3 mb-6 border-b border-slate-100 pb-4">
                {["Sales", "Customers"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {activeTab === tab && (
                            <motion.div layoutId="salesTab" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />
                        )}
                        {tab === "Sales" ? "Sales Invoices" : "Customer Ledger"}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-3 sm:gap-4 overflow-hidden p-1">
                {isLoading ? (
                    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                        {[1, 2, 3, 4].map((n) => (
                            <div key={n} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 w-40 bg-slate-200 rounded"></div>
                                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="h-5 w-20 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : activeTab === "Sales" ? (
                    invoiceList.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
                            <ReceiptText className="w-10 h-10 text-slate-300 mb-4" />
                            <h3 className="text-lg font-black text-slate-800 mb-2">No Sales Logged</h3>
                        </motion.div>
                    ) : (
                        <div className="divide-y divide-slate-100 bg-white border border-slate-100 rounded-2xl shadow-sm">
                            <AnimatePresence>
                                {invoiceList.map((item) => (
                                    <motion.div layout key={item._id} className="p-4 sm:p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                <ReceiptText className="w-5 h-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-900">{item.metadata?.vendorName}</h4>
                                                <p className="text-xs font-medium text-slate-500">
                                                    INV: {item.metadata?.invoiceNumber} | {new Date(item.transactionDate || item.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-slate-400 uppercase">
                                                {item.status.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-sm font-black text-slate-900 flex items-center justify-end">
                                                <IndianRupee className="w-3.5 h-3.5" /> {item.totalAmount?.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {customers.map((cust, idx) => (
                                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }} key={cust.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                                            <span className="font-black text-white">{cust.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-slate-900">{cust.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">Total Sales: ₹{cust.totalBilled.toLocaleString("en-IN")}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Dues</p>
                                        <p className={`text-sm font-black flex items-center ${cust.pending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {cust.pending > 0 ? cust.pending.toLocaleString("en-IN") : "Settled"}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}