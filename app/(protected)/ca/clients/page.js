"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  Building2, Search, AlertCircle, CheckCircle2, 
  ArrowRight, KeyRound, Copy, Loader2, Inbox, Mail, Phone
} from "lucide-react";
import toast from "react-hot-toast";

export default function CAClientsDirectoryUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/ca/clients');
        if (res.ok) {
          const json = await res.json();
          setClients(json.data.clients || []);
          setInviteCode(json.data.inviteCode || "PENDING");
        } else {
          toast.error("Failed to load client directory");
        }
      } catch (error) {
        console.error("Failed to fetch clients:", error);
        toast.error("Network error while fetching clients");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setIsCopied(true);
    toast.success("Invite code copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" /> Client Directory
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Manage your connected SME businesses and view their audit status.
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Invite Code Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-black text-indigo-900 mb-1">Firm Invite Code</h2>
          <p className="text-sm font-medium text-indigo-600 max-w-md">
            Share this 6-digit code with SME Owners. They will enter this in their CA-Hub to securely link their accounting data to your firm.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-indigo-100 w-full sm:w-auto shrink-0">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-widest uppercase">{inviteCode}</span>
          <button 
            type="button"
            onClick={handleCopyCode} 
            className="ml-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-indigo-600 transition-colors"
          >
            {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Client Grid */}
      {isLoading ? (
        <div className="w-full h-64 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
          <p className="text-sm font-bold">Loading your client portfolio...</p>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredClients.map((client, idx) => (
              <motion.div 
                layout 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ delay: idx * 0.05 }}
                key={client.id} 
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-lg font-black text-slate-400">{client.companyName.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 line-clamp-1">{client.companyName}</h3>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">{client.ownerName}</p>
                    </div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Linked
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {client.phone}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 mt-auto">
                  <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">To Scrutinize</p>
                    <p className="text-xl font-black text-amber-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {client.pendingAudits}
                    </p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Tally Ready</p>
                    <p className="text-xl font-black text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {client.readyForSync}
                    </p>
                  </div>
                </div>

                <Link 
                  href={`/ca-staff/voucher-scrutiny?client=${client.id}`}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 transition-colors flex items-center justify-center gap-2"
                >
                  Audit Ledger <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">
            {searchQuery ? "No Clients Found" : "Your Portfolio is Empty"}
          </h3>
          <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? `No businesses match your search for "${searchQuery}".` 
              : "Share your Firm Invite Code with SME Owners so they can connect their business to your dashboard."}
          </p>
        </div>
      )}
    </div>
  );
}