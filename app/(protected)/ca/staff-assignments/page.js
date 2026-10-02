"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Plus, User, Briefcase, ChevronRight, Loader2, Users } from "lucide-react";

export default function StaffAssignmentsUI() {
  // ✨ FIX: State setup for API integration (Zero-State by default)
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);

  // ✨ Mock API Call
  useEffect(() => {
    const fetchStaff = async () => {
      // Later: const res = await fetch('/api/ca/staff-assignments');
      setTimeout(() => {
        // True zero-state for a new CA firm
        setStaffMembers([]);
        setIsLoading(false);
      }, 800);
    };
    fetchStaff();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Staff Assignments
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage your team and distribute client workloads.</p>
        </div>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="w-full">
        {isLoading ? (
          // Loading State
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
            <p className="text-sm font-bold">Loading your team...</p>
          </div>
        ) : staffMembers.length > 0 ? (
          // Data State
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffMembers.map((staff, idx) => (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={staff.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{staff.name}</h3>
                      <p className="text-xs font-bold text-indigo-600">{staff.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold uppercase">Assigned Clients</span>
                  </div>
                  <span className="text-lg font-black text-slate-900">{staff.clients}</span>
                </div>
                
                <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                  Manage Workload <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          // ✨ FIX: Zero-State UI for empty staff list
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">No Staff Members Yet</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm mb-6">
              You haven't added any audit staff or article assistants to your firm. Share your CA Invite Link with them to get started.
            </p>
            <button className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors">
              Get Invite Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}