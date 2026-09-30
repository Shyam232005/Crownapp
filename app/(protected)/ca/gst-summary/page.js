"use client";
import { motion } from "framer-motion";
import { FileText, Download, CheckCircle2, Clock } from "lucide-react";

export default function GSTSummaryUI() {
  const clientsGST = [
    { name: "FineOps Technologies", gstr1: "Filed", gstr3b: "Pending", turnover: "4.5L" },
    { name: "Sharma Traders", gstr1: "Filed", gstr3b: "Filed", turnover: "12.2L" },
    { name: "Patel Manufacturing", gstr1: "Pending Data", gstr3b: "Pending Data", turnover: "-" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> GST Summary (Sept 2026)
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Track return filing status for all active clients.</p>
        </div>
        <button className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 hover:bg-indigo-700 transition-colors">
          <Download className="w-4 h-4" /> Download Master Report
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Client Name</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Est. Turnover</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">GSTR-1 Status</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">GSTR-3B Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clientsGST.map((client, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-black text-slate-900 text-sm">{client.name}</td>
                <td className="p-5 text-sm font-bold text-slate-600">{client.turnover}</td>
                <td className="p-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    client.gstr1 === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {client.gstr1 === 'Filed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {client.gstr1}
                  </span>
                </td>
                <td className="p-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    client.gstr3b === 'Filed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {client.gstr3b === 'Filed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {client.gstr3b}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}