"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Search, AlertCircle, Box } from "lucide-react";

export default function StockCheckUI() {
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy inventory data
  const inventory = [
    { id: 1, name: "Copper Wire 2mm", qty: 450, unit: "Meters", status: "In Stock" },
    { id: 2, name: "LED Bulbs 15W", qty: 12, unit: "Pcs", status: "Low Stock" },
    { id: 3, name: "Switchboard Panels", qty: 85, unit: "Boxes", status: "In Stock" },
    { id: 4, name: "Insulation Tape", qty: 4, unit: "Rolls", status: "Critical" },
  ];

  const filteredStock = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Stock Check
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Real-time view of available inventory in the godown.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name / SKU</th>
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Available Qty</th>
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Unit</th>
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                        <Box className="w-4 h-4 text-slate-500" />
                      </div>
                      <p className="font-black text-slate-900 text-sm">{item.name}</p>
                    </div>
                  </td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className="text-base font-black text-slate-900">{item.qty}</span>
                  </td>
                  <td className="p-4 sm:p-5 text-sm font-bold text-slate-500">{item.unit}</td>
                  <td className="p-4 sm:p-5 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {item.status !== 'In Stock' && <AlertCircle className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}