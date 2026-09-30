"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Building2, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ClientDirectoryUI() {
  const [search, setSearch] = useState("");

  const clients = [
    { id: 1, name: "FineOps Technologies", gstin: "24AAACC1206D1Z0", staff: "Ravi (Staff)", status: "Data Unlocked" },
    { id: 2, name: "Sharma Traders", gstin: "24BBBBB0000B1Z5", staff: "Amit (Staff)", status: "Locked" },
    { id: 3, name: "Patel Manufacturing", gstin: "Pending", staff: "Unassigned", status: "Action Needed" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Client Directory
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage all your connected businesses and their access.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search clients or GSTIN..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Business Name</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">GSTIN</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Assigned Staff</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase">Access Status</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="font-black text-slate-900 text-sm">{client.name}</p>
                  </div>
                </td>
                <td className="p-5 text-sm font-bold text-slate-600 uppercase">{client.gstin}</td>
                <td className="p-5 text-sm font-semibold text-slate-500">{client.staff}</td>
                <td className="p-5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    client.status === 'Data Unlocked' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                    client.status === 'Locked' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                    'bg-rose-50 text-rose-600 border border-rose-100'
                  }`}>
                    {client.status === 'Data Unlocked' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {client.status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button className="w-8 h-8 inline-flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}