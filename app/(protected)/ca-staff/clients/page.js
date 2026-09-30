"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Search, Building2, ChevronRight, CheckCircle2, Clock } from "lucide-react";

export default function MyClientsUI() {
  const [search, setSearch] = useState("");

  const assignedClients = [
    { id: 1, name: "FineOps Technologies", gstin: "24AAACC1206D1Z0", auditStatus: "In Progress", pendingVouchers: 12 },
    { id: 2, name: "Sharma Traders", gstin: "24BBBBB0000B1Z5", auditStatus: "Clean (Verified)", pendingVouchers: 0 },
    { id: 3, name: "Patel Manufacturing", gstin: "Pending", auditStatus: "Not Started", pendingVouchers: 45 },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" /> My Assigned Clients
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage and track progress for businesses assigned to you.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Search my clients..." className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedClients.map((client, idx) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={client.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 line-clamp-1">{client.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">GSTIN: {client.gstin}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100 mb-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  client.auditStatus === 'Clean (Verified)' ? 'bg-emerald-100 text-emerald-700' : 
                  client.auditStatus === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {client.auditStatus === 'Clean (Verified)' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {client.auditStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Vouchers</span>
                <span className={`text-sm font-black ${client.pendingVouchers > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                  {client.pendingVouchers}
                </span>
              </div>
            </div>
            
            <button className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-slate-200">
              Open Workspace <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}