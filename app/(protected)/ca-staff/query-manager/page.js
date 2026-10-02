"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, CheckCircle2, Clock, ArrowRight, FileQuestion, Loader2, Inbox } from "lucide-react";

export default function QueryManagerUI() {
  // ✨ FIX: State setup for API integration (Zero-State by default)
  const [isLoading, setIsLoading] = useState(true);
  const [queries, setQueries] = useState([]);

  // ✨ Mock API Call
  useEffect(() => {
    const fetchQueries = async () => {
      // Later: const res = await fetch('/api/ca-staff/queries');
      setTimeout(() => {
        // True zero-state for a new staff member
        setQueries([]); 
        setIsLoading(false);
      }, 800);
    };
    fetchQueries();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" /> Query Manager
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Track issues raised to clients and their resolutions.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          // Loading State
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
            <p className="text-sm font-bold">Loading queries...</p>
          </div>
        ) : queries.length > 0 ? (
          // Data State
          <AnimatePresence>
            {queries.map((q, idx) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={q.id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    q.status === 'Resolved' ? 'bg-emerald-50' : q.status === 'Client Replied' ? 'bg-indigo-50' : 'bg-amber-50'
                  }`}>
                    {q.status === 'Resolved' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <FileQuestion className={`w-6 h-6 ${q.status === 'Client Replied' ? 'text-indigo-600' : 'text-amber-500'}`} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="text-sm font-black text-slate-900">{q.client}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Ref: {q.voucher}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-2">{q.issue}</p>
                    <p className="text-xs font-bold text-slate-400">{q.date}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    q.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 
                    q.status === 'Client Replied' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {q.status === 'Awaiting Client Reply' && <Clock className="w-3 h-3" />} {q.status}
                  </span>
                  
                  {q.status !== 'Resolved' && (
                    <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      View Thread <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          // ✨ FIX: Zero-State UI for empty queries
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">No Active Queries</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              You haven't raised any issues to your clients yet. When you request clarifications during scrutiny, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}