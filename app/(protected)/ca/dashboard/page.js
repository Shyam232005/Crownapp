"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  LayoutDashboard, Users, AlertCircle, FileCheck, 
  ArrowRight, DownloadCloud, Clock, Building2
} from "lucide-react";

export default function CADashboardUI() {
  // Dummy Analytics Data for UI
  const stats = {
    activeClients: 24,
    pendingAudits: 8,
    readyForSync: 12
  };

  const clientAlerts = [
    { id: 1, client: "FineOps Technologies", status: "Data Unlocked", type: "Ready for Tally", time: "1 hour ago" },
    { id: 2, client: "Sharma Traders", status: "Pending Approval", type: "Awaiting Owner", time: "3 hours ago" },
    { id: 3, client: "Patel Manufacturing", status: "Action Needed", type: "Missing GSTIN", time: "5 hours ago" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-slate-900" /> Firm Dashboard
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Overview of your client portfolio and pending compliance tasks.
          </motion.p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2">
          <DownloadCloud className="w-4 h-4" /> Bulk ERP Sync
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Active Clients</p>
          <h2 className="text-3xl font-black text-slate-900 mb-4">{stats.activeClients} <span className="text-sm font-bold text-slate-500">businesses</span></h2>
          <Link href="/ca/clients" className="text-indigo-600 text-sm font-bold hover:text-indigo-700 flex items-center gap-1 w-max">
            View Directory <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 border border-amber-100">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Scrutiny / Audits</p>
          <h2 className="text-3xl font-black text-slate-900 mb-4">{stats.pendingAudits} <span className="text-sm font-bold text-slate-500">tasks</span></h2>
          <Link href="/ca/staff" className="text-amber-600 text-sm font-bold hover:text-amber-700 flex items-center gap-1 w-max">
            Check Staff Queue <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-3xl p-6 shadow-lg shadow-emerald-200">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Data Ready for Tally</p>
          <h2 className="text-3xl font-black mb-4">{stats.readyForSync} <span className="text-sm font-bold text-emerald-200">clients</span></h2>
          <Link href="/ca/tally-sync" className="text-white text-sm font-bold hover:text-emerald-100 flex items-center gap-1 w-max bg-white/10 px-3 py-1.5 rounded-lg">
            Start Export <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Client Alerts List */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" /> Recent Client Alerts
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {clientAlerts.map((alert) => (
            <div key={alert.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  alert.status === 'Data Unlocked' ? 'bg-emerald-50 text-emerald-500' :
                  alert.status === 'Pending Approval' ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{alert.client}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{alert.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                  {alert.type}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                  alert.status === 'Data Unlocked' ? 'bg-emerald-100 text-emerald-700' :
                  alert.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {alert.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}