"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  LayoutDashboard, Users, AlertCircle, FileCheck, 
  ArrowRight, DownloadCloud, Clock, Building2,
  Loader2, Inbox, ShieldCheck, Sparkles
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } 
  }
};

export default function CADashboardUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeClients: 0,
    pendingAudits: 0,
    readyForSync: 0
  });
  const [clientAlerts, setClientAlerts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/ca/dashboard');
        if (res.ok) {
          const json = await res.json();
          setStats(json.data.stats || {});
          setClientAlerts(json.data.clientAlerts || []);
        }
      } catch (error) {
        console.error("Failed to fetch CA dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              CA Practice Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-400 pl-10.5">
            Client portfolio compliance, verification queues, and audit readiness.
          </p>
        </div>
        <Link href="/ca/data-sync">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-slate-900/10 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <DownloadCloud className="w-4 h-4 text-emerald-400" /> Bulk ERP Sync
          </motion.button>
        </Link>
      </motion.div>

      {/* Main Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Total Active Clients */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-indigo-50/80 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100/80 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Active Client Businesses</p>
          <div className="min-h-[44px] flex items-center mb-4">
            {isLoading ? (
              <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stats.activeClients} <span className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">SMEs</span>
              </h2>
            )}
          </div>
          <Link href="/ca/clients" className="text-indigo-600 text-xs font-black uppercase tracking-wider hover:text-indigo-700 flex items-center gap-1.5 w-max">
            View Directory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pending Scrutiny */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5">
          <div className="w-12 h-12 bg-amber-50/80 rounded-2xl flex items-center justify-center mb-4 border border-amber-100/80 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Pending Audit Scrutiny</p>
          <div className="min-h-[44px] flex items-center mb-4">
            {isLoading ? (
              <div className="h-9 w-28 bg-slate-100 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stats.pendingAudits} <span className="text-xs font-black uppercase tracking-wider text-amber-600 ml-1">vouchers</span>
              </h2>
            )}
          </div>
          <Link href="/ca/audit-reports" className="text-amber-600 text-xs font-black uppercase tracking-wider hover:text-amber-700 flex items-center gap-1.5 w-max">
            Audit Pipeline <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Data Ready for Tally */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-xl shadow-emerald-500/15 relative overflow-hidden group hover:-translate-y-0.5 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm group-hover:scale-105 transition-transform relative z-10">
            <FileCheck className="w-6 h-6 text-white" />
          </div>
          <p className="text-emerald-100 text-xs font-black uppercase tracking-wider mb-1 relative z-10">Data Ready for Tally ERP</p>
          <div className="min-h-[44px] flex items-center mb-4 relative z-10">
            {isLoading ? (
              <div className="h-9 w-28 bg-white/20 rounded-lg animate-pulse" />
            ) : (
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {stats.readyForSync} <span className="text-xs font-black uppercase tracking-wider text-emerald-200 ml-1">clients</span>
              </h2>
            )}
          </div>
          <Link href="/ca/data-sync" className="text-white text-xs font-black uppercase tracking-wider hover:text-emerald-100 flex items-center gap-1.5 w-max bg-white/15 hover:bg-white/20 px-3.5 py-2 rounded-xl backdrop-blur-md transition-colors relative z-10 cursor-pointer">
            Export XML/CSV <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Client Alerts List */}
      <motion.div variants={itemVariants} className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[320px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Recent Client Compliance Feed
          </h3>
        </div>
        
        <div className="divide-y divide-slate-100/80 flex-1 flex flex-col">
          {isLoading ? (
            /* Shimmering Skeletons */
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200/60 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-slate-200/60 rounded-md" />
                      <div className="h-3 w-20 bg-slate-100 rounded-md" />
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-slate-200/60 rounded-lg" />
                </div>
              ))}
            </div>
          ) : clientAlerts.length > 0 ? (
            <AnimatePresence>
              {clientAlerts.map((alert, idx) => (
                <motion.div 
                  key={alert.id || idx}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50/80 transition-colors gap-4 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform ${
                      alert.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{alert.client}</h4>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">{alert.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                      {alert.type}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      alert.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {alert.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            /* Organic Zero State */
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center bg-gradient-to-br from-slate-50/60 via-indigo-50/20 to-slate-50/60">
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-white border border-slate-200/80 rounded-3xl flex items-center justify-center mb-4 shadow-sm"
              >
                <Inbox className="w-7 h-7 text-slate-400 animate-pulse" />
              </motion.div>
              <h4 className="text-base font-black text-slate-800 tracking-tight mb-1">Portfolio Queue Idle</h4>
              <p className="text-xs font-semibold text-slate-400 max-w-sm leading-relaxed">
                No active audit queries or client alerts at the moment. Share your firm's invite code in the sidebar to onboard new SME businesses.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}