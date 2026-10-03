"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CheckCircle2, MessageSquare, AlertCircle, 
  FileText, IndianRupee, Filter, Loader2, Inbox
} from "lucide-react";

export default function VoucherScrutinyUI() {
  const [activeTab, setActiveTab] = useState("Pending");
  const [isLoading, setIsLoading] = useState(true);
  const [vouchers, setVouchers] = useState([]);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/ca-staff/vouchers');
      if (res.ok) {
        const json = await res.json();
        setVouchers(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateVoucherStatus = async (id, newStatus) => {
    try {
      const res = await fetch('/api/ca-staff/vouchers', {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });

      if (res.ok) {
        setVouchers(vouchers.map(v => v.id === id ? { ...v, status: newStatus } : v));
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      alert("Network error.");
    }
  };

  const filteredVouchers = vouchers.filter(v => activeTab === "All" || v.status === activeTab);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-600" /> Voucher Scrutiny[cite: 20]
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verify client entries before finalizing them for Tally export.[cite: 20]</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
          <Filter className="w-4 h-4" /> Filter Client[cite: 20]
        </button>
      </div>

      <div className="flex gap-3 mb-6 border-b border-slate-100 pb-4 overflow-x-auto scrollbar-hide">
        {["Pending", "Query Raised", "Verified", "All"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${
              activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {activeTab === tab && <motion.div layoutId="scrutinyTab" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />}
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Voucher Details[cite: 20]</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Client[cite: 20]</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Amount[cite: 20]</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase text-center">Actions[cite: 20]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                      <p className="text-sm font-bold">Loading scrutiny queue...[cite: 20]</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVouchers.length > 0 ? (
                <AnimatePresence>
                  {filteredVouchers.map((voucher) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={voucher.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{voucher.desc}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{voucher.type}</span>
                              <span className="text-xs font-medium text-slate-400">{voucher.date}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-bold text-slate-600">{voucher.client}</td>
                      <td className="p-5">
                        <span className="text-sm font-black text-slate-900 flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />{voucher.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="p-5">
                        {voucher.status === "Pending" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => updateVoucherStatus(voucher.id, "Verified")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Verify[cite: 20]
                            </button>
                            <button 
                              onClick={() => updateVoucherStatus(voucher.id, "Query Raised")}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              <MessageSquare className="w-4 h-4" /> Query[cite: 20]
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                              voucher.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {voucher.status === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {voucher.status}
                            </span>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-base font-black text-slate-800 mb-1">Queue is Clear[cite: 20]</h4>
                      <p className="text-sm font-medium text-slate-500 max-w-sm">
                        {activeTab === "Pending" ? "No pending vouchers waiting for your scrutiny.[cite: 20]" :
                         activeTab === "Query Raised" ? "You haven't raised any queries on client vouchers.[cite: 20]" :
                         activeTab === "Verified" ? "No vouchers have been verified yet.[cite: 20]" :
                         "No vouchers found for your assigned clients.[cite: 20]"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}