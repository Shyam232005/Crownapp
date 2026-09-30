"use client";
import { motion } from "framer-motion";
import { Receipt, Sparkles, IndianRupee, Send, FileText } from "lucide-react";

export default function LogExpenseUI() {
  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-rose-600" /> Log Expense
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Record office expenses, travel, or petty cash usage.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <form className="p-6 sm:p-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* Smart Scan UI */}
          <div className="mb-8 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-2xl p-1 cursor-pointer group shadow-sm">
            <div className="border border-dashed border-indigo-200/60 rounded-xl p-6 text-center bg-white/50 group-hover:bg-white/80 transition-all flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3 shadow-md shadow-indigo-200 group-hover:-translate-y-1 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-black text-indigo-900 mb-1">Scan Expense Bill</p>
              <p className="text-xs font-medium text-indigo-500">Auto-fill Amount & Details (100% Offline AI)</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Category</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all">
                  <option>Office Supplies</option>
                  <option>Travel & Fuel</option>
                  <option>Food & Refreshments</option>
                  <option>Repairs & Maintenance</option>
                  <option>Other Misc.</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="number" required className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" placeholder="0.00" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Paid To / Shop Name</label>
              <div className="relative">
                <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all" placeholder="e.g. Navjivan Stationers" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Details</label>
              <textarea rows="3" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none" placeholder="What was this expense for?"></textarea>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" 
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-colors flex justify-center items-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit to Owner
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}