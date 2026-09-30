"use client";
import { motion } from "framer-motion";
import { DownloadCloud, Filter, CheckCircle2, FileText, FileSpreadsheet, Code } from "lucide-react";

export default function ExportDataUI() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <DownloadCloud className="w-6 h-6 text-indigo-600" /> Export Data
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Download clean, scrutinized client data for offline processing.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-black text-slate-800">Export Filters</h2>
        </div>

        <form className="p-6 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Client</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
                <option>FineOps Technologies</option>
                <option>Sharma Traders</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data Period</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all">
                <option>September 2026</option>
                <option>August 2026</option>
                <option>Q2 (Jul - Sep 2026)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Export Format</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="cursor-pointer">
                <input type="radio" name="format" className="peer sr-only" defaultChecked />
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-indigo-600 peer-checked:bg-indigo-50 transition-all hover:bg-slate-50">
                  <Code className="w-6 h-6 text-slate-600 peer-checked:text-indigo-600" />
                  <span className="text-sm font-bold text-slate-700">Tally XML</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="format" className="peer sr-only" />
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 transition-all hover:bg-slate-50">
                  <FileSpreadsheet className="w-6 h-6 text-slate-600 peer-checked:text-emerald-600" />
                  <span className="text-sm font-bold text-slate-700">Excel (XLSX)</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="format" className="peer sr-only" />
                <div className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-slate-100 peer-checked:border-amber-600 peer-checked:bg-amber-50 transition-all hover:bg-slate-50">
                  <FileText className="w-6 h-6 text-slate-600 peer-checked:text-amber-600" />
                  <span className="text-sm font-bold text-slate-700">CSV Standard</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors flex justify-center items-center gap-2"
            >
              <DownloadCloud className="w-5 h-5" /> Generate & Download
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}