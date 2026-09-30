"use client";
import { motion } from "framer-motion";
import { Landmark, Check, X, FileSpreadsheet, ArrowRightLeft } from "lucide-react";

export default function BankRecoUI() {
  const recoData = [
    { id: 1, date: "10 Oct 2026", desc: "NEFT- Sharma Traders", bankAmt: 12500, bookAmt: 12500, match: true },
    { id: 2, date: "11 Oct 2026", desc: "UPI- Office Supplies", bankAmt: -3500, bookAmt: null, match: false }, // Entry missing in books
    { id: 3, date: "12 Oct 2026", desc: "IMPS- Vendor Pay", bankAmt: -45000, bookAmt: -45000, match: true },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-600" /> Bank Reconciliation
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Match bank statement transactions with software ledger entries.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors">
          <FileSpreadsheet className="w-4 h-4" /> Upload Statement
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-100 p-4">
          <div className="col-span-4 text-xs font-bold text-slate-400 uppercase">Bank Statement (HDFC)</div>
          <div className="col-span-2 text-center text-xs font-bold text-slate-400 uppercase"><ArrowRightLeft className="w-4 h-4 mx-auto" /></div>
          <div className="col-span-4 text-xs font-bold text-slate-400 uppercase">FineOps Ledger (Books)</div>
          <div className="col-span-2 text-right text-xs font-bold text-slate-400 uppercase">Status</div>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recoData.map((row) => (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={row.id} className="grid grid-cols-12 p-4 items-center hover:bg-slate-50 transition-colors">
              {/* Bank Side */}
              <div className="col-span-4">
                <p className="text-sm font-black text-slate-900">{row.desc}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400">{row.date}</span>
                  <span className={`text-xs font-black ${row.bankAmt > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                    ₹{Math.abs(row.bankAmt).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="col-span-2 flex justify-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                  {row.match ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />}
                </div>
              </div>
              
              {/* Books Side */}
              <div className="col-span-4">
                {row.bookAmt !== null ? (
                  <div>
                    <p className="text-sm font-black text-slate-900">{row.desc} (Auto-Matched)</p>
                    <span className={`text-xs font-black mt-1 ${row.bookAmt > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      ₹{Math.abs(row.bookAmt).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="p-2 border border-dashed border-rose-200 bg-rose-50 rounded-lg text-rose-600 text-xs font-bold inline-block">
                    Missing Entry in Books
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="col-span-2 text-right">
                {!row.match && (
                  <button className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[10px] font-bold uppercase transition-colors">
                    Add Entry
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}