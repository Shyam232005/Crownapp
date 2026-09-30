"use client";
import { motion } from "framer-motion";
import { FileSpreadsheet, Plus, CheckCircle2, IndianRupee, Clock, Send } from "lucide-react";

export default function DraftTaxSheetsUI() {
  const drafts = [
    { id: 1, client: "FineOps Technologies", month: "Sept 2026", outputTax: 45000, itc: 12500, liability: 32500, status: "Draft" },
    { id: 2, client: "Sharma Traders", month: "Sept 2026", outputTax: 21000, itc: 24000, liability: 0, status: "Sent for CA Review" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" /> Draft Tax Sheets
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Prepare GST computations and send to Principal CA for final approval.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> New Draft
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-black text-slate-800">Recent Computations</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {drafts.map((draft, idx) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={draft.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
              
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${draft.status === 'Draft' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-500'}`}>
                  {draft.status === 'Draft' ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">{draft.client}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded mt-1 inline-block">
                    {draft.month}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 sm:gap-12">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Output Tax</p>
                  <p className="text-sm font-black text-slate-900 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{draft.outputTax.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ITC</p>
                  <p className="text-sm font-black text-emerald-600 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{draft.itc.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Liability</p>
                  <p className="text-sm font-black text-rose-600 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" />{draft.liability.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                {draft.status === 'Draft' ? (
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors">
                    <Send className="w-4 h-4" /> Send to CA
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {draft.status}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}