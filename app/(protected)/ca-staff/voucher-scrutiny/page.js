"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, CheckCircle2, MessageSquare, AlertCircle, 
  FileText, IndianRupee, Filter, Eye
} from "lucide-react";

export default function VoucherScrutinyUI() {
  const [activeTab, setActiveTab] = useState("Pending");

  const vouchers = [
    { id: 1, client: "FineOps Technologies", type: "Vendor Payment", amount: 45000, date: "15 Oct 2026", desc: "Server Renewal", status: "Pending" },
    { id: 2, client: "Sharma Traders", type: "Sales Invoice", amount: 12500, date: "14 Oct 2026", desc: "Bill #102", status: "Pending" },
    { id: 3, client: "FineOps Technologies", type: "General Expense", amount: 3500, date: "12 Oct 2026", desc: "Office Supplies", status: "Query Raised" },
  ];

  const filteredVouchers = vouchers.filter(v => activeTab === "All" || v.status === activeTab);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-600" /> Voucher Scrutiny
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Verify client entries before finalizing them for Tally export.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
          <Filter className="w-4 h-4" /> Filter Client
        </button>
      </div>

      <div className="flex gap-3 mb-6 border-b border-slate-100 pb-4">
        {["Pending", "Query Raised", "Verified", "All"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
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
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Voucher Details</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Client</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase">Amount</th>
                <th className="p-5 text-xs font-bold text-slate-400 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
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
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            <CheckCircle2 className="w-4 h-4" /> Verify
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white rounded-lg text-xs font-bold transition-colors">
                            <MessageSquare className="w-4 h-4" /> Query
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}