"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Search, Building2, ChevronRight, 
  AlertCircle, CheckCircle2, Loader2, Inbox 
} from "lucide-react";

export default function ClientDirectoryUI() {
  const [search, setSearch] = useState("");
  // ✨ FIX: State setup for API integration (Zero-State)
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);

  // ✨ Mock API Call
  useEffect(() => {
    const fetchClients = async () => {
      // Later: const res = await fetch('/api/ca/clients');
      setTimeout(() => {
        // True zero-state for a new CA firm
        setClients([]); 
        setIsLoading(false);
      }, 800);
    };
    fetchClients();
  }, []);

  // Filter logic for future data
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(search.toLowerCase()) || 
    client.gstin.toLowerCase().includes(search.toLowerCase())
  );

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
          <input 
            type="text" 
            placeholder="Search clients or GSTIN..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all" 
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden overflow-x-auto">
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
            {isLoading ? (
              <tr>
                <td colSpan="5" className="p-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                    <p className="text-sm font-bold">Loading client directory...</p>
                  </div>
                </td>
              </tr>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
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
              ))
            ) : (
              // ✨ FIX: Zero-State UI for empty table
              <tr>
                <td colSpan="5" className="p-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                      <Inbox className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-base font-black text-slate-800 mb-1">No Clients Found</h4>
                    <p className="text-sm font-medium text-slate-500 max-w-sm">
                      {search ? "No clients match your search criteria." : "You haven't linked any businesses to your firm yet. Share your invite code to get started."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}