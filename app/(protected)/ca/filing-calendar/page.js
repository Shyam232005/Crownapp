"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, AlertCircle, Loader2, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

export default function FilingCalendarUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [deadlines, setDeadlines] = useState([]);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    // Set current month for the header dynamically
    setCurrentMonth(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    const fetchDeadlines = async () => {
      try {
        const res = await fetch('/api/ca/filing-calendar');
        if (res.ok) {
          const json = await res.json();
          setDeadlines(json.data || []);
        } else {
            throw new Error("Failed to load calendar");
        }
      } catch (error) {
        console.error("Failed to fetch compliance deadlines:", error);
        toast.error("Failed to load compliance deadlines.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeadlines();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" /> Filing Calendar
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Track compliance deadlines across all your clients.</p>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-black text-slate-800">Upcoming Deadlines ({currentMonth})</h2>
        </div>
        
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/70 border border-slate-100 rounded-2xl animate-pulse gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="space-y-2">
                      <div className="h-5 w-44 bg-slate-200 rounded" />
                      <div className="flex gap-2">
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                        <div className="h-3 w-36 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="space-y-1.5 hidden sm:block">
                      <div className="h-2.5 w-24 bg-slate-200 rounded" />
                      <div className="h-4 w-20 bg-slate-200 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-slate-200 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : deadlines.length > 0 ? (
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {deadlines.map((item, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center border border-indigo-100 shrink-0">
                        <span className="text-xs font-bold text-indigo-500 uppercase">{item.date.split(" ")[1]}</span>
                        <span className="text-xl font-black text-indigo-700">{item.date.split(" ")[0]}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{item.type}</span>
                          <span className="text-xs font-medium text-slate-400">{item.desc}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-slate-100 pt-4 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Applicable Clients</p>
                        <p className="text-sm font-black text-slate-900">{item.clients} Businesses</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                        item.status === 'Urgent' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        <AlertCircle className="w-4 h-4" /> {item.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-4">
                <CalendarCheck className="w-8 h-8 text-indigo-500" />
              </div>
              <h4 className="text-base font-black text-slate-800 mb-1">No Upcoming Deadlines</h4>
              <p className="text-sm font-medium text-slate-500 max-w-sm">
                You currently don't have any clients assigned or compliance filings due. Start by inviting clients to your firm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}