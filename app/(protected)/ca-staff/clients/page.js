"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    Briefcase, Search, Building2, ChevronRight, 
    CheckCircle2, Clock, Loader2, Inbox 
} from "lucide-react";
import { toast } from "sonner";

export default function MyClientsUI() {
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [assignedClients, setAssignedClients] = useState([]);

  useEffect(() => {
    const fetchAssignedClients = async () => {
      try {
        const res = await fetch('/api/ca-staff/clients');
        if (res.ok) {
          const json = await res.json();
          setAssignedClients(json.data || []);
        } else {
            throw new Error("Failed to load assigned clients");
        }
      } catch (error) {
        console.error("Failed to fetch assigned clients:", error);
        toast.error("Failed to load your client portfolio.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignedClients();
  }, []);

  const filteredClients = assignedClients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    (client.gstin && client.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" /> My Assigned Clients
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage and track progress for businesses assigned to you[cite: 23].</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search my clients..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all outline-none" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-slate-200 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                    <div className="h-4 w-16 bg-slate-200 rounded" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-4 w-8 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-10 w-full bg-slate-200 rounded-xl" />
              </div>
            ))}
          </>
        ) : filteredClients.length > 0 ? (
          <AnimatePresence>
            {filteredClients.map((client, idx) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={client.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 line-clamp-1">{client.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">GSTIN: {client.gstin || "N/A"}</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100 mb-5 flex-1">
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
                
                <Link 
                  href={`/ca-staff/voucher-scrutiny?client=${client.id}`}
                  className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-md shadow-slate-200"
                >
                  Open Workspace <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">No Clients Assigned</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              {search ? "No clients match your search." : "You haven't been assigned any clients yet. Ask your Firm Admin to assign audits to you[cite: 23]."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}