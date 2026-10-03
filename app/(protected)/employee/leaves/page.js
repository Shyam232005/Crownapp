"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  CalendarDays, Send, Clock, CheckCircle2, 
  XCircle, AlertCircle, Loader2, Inbox 
} from "lucide-react";

export default function LeaveRequestsUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      leaveType: "Casual Leave",
      fromDate: "",
      toDate: "",
      reason: ""
    }
  });

  // ✨ Mock API Call: Fetch Leave History
  useEffect(() => {
    const fetchLeaves = async () => {
      // Later: const res = await fetch('/api/employee/leaves');
      setTimeout(() => {
        // True zero-state for a new employee
        setLeaves([]);
        setIsLoading(false);
      }, 800);
    };
    fetchLeaves();
  }, []);

  const onSubmit = async (data) => {
    // Later: await fetch('/api/employee/leaves', { method: 'POST', body: JSON.stringify(data) });
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate API delay
    
    // Optimistic UI update
    const newLeave = {
      id: Math.random(),
      type: data.leaveType,
      dates: `${data.fromDate} to ${data.toDate}`,
      status: "Pending",
      reason: data.reason
    };
    
    setLeaves([newLeave, ...leaves]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    reset();
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Leave Form */}
      <div className="lg:col-span-1">
        <div className="mb-6">
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" /> Apply Leave
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Submit your time-off request.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
              <select 
                {...register("leaveType")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Date</label>
                <input 
                  type="date" 
                  {...register("fromDate", { required: true })}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
                <input 
                  type="date" 
                  {...register("toDate", { required: true })}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
              <textarea 
                rows="3" 
                {...register("reason", { required: true })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none" 
                placeholder="Briefly explain your reason..."
              ></textarea>
            </div>

            <div className="pt-2">
              <AnimatePresence>
                {showSuccess && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm mb-3">
                    <CheckCircle2 className="w-5 h-5" /> Request Submitted!
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3.5 text-white text-sm font-black rounded-xl shadow-lg flex justify-center items-center gap-2 transition-colors ${
                  isSubmitting ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Request</>}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Column: Leave History */}
      <div className="lg:col-span-2 flex flex-col">
        <div className="mb-6 flex items-end h-[52px]">
          <h2 className="text-lg font-black text-slate-800">Leave History</h2>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
          <div className="divide-y divide-slate-100 flex-1 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
                <p className="text-sm font-bold">Loading your leave history...</p>
              </div>
            ) : leaves.length > 0 ? (
              <>
                <AnimatePresence>
                  {leaves.map((leave) => (
                    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={leave.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${leave.status === 'Approved' ? 'bg-emerald-50' : leave.status === 'Pending' ? 'bg-amber-50' : 'bg-rose-50'}`}>
                          {leave.status === 'Approved' ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : 
                           leave.status === 'Pending' ? <Clock className="w-6 h-6 text-amber-500" /> : 
                           <XCircle className="w-6 h-6 text-rose-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm sm:text-base font-black text-slate-900">{leave.type}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              leave.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                              leave.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {leave.status}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 mb-1">{leave.dates}</p>
                          <p className="text-xs font-medium text-slate-400">{leave.reason}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className="p-6 bg-slate-50 flex items-start gap-3 mt-auto">
                  <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    Your leave requests are sent directly to the Owner's approval queue. You will be notified here once a decision is made.
                  </p>
                </div>
              </>
            ) : (
              // ✨ FIX: Zero-State UI for empty leave history
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-base font-black text-slate-800 mb-1">No Leaves Applied</h4>
                <p className="text-sm font-medium text-slate-500 max-w-sm">
                  You haven't requested any time off yet. When you submit a leave request, its status will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}