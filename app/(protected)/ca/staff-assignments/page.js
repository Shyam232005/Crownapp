"use client";
import { motion } from "framer-motion";
import { ClipboardCheck, Plus, User, Briefcase, ChevronRight } from "lucide-react";

export default function StaffAssignmentsUI() {
  const staffMembers = [
    { id: 1, name: "Ravi Kumar", role: "Senior Auditor", clients: 12 },
    { id: 2, name: "Amit Shah", role: "Article Assistant", clients: 8 },
    { id: 3, name: "Priya Singh", role: "Tax Consultant", clients: 15 },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
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
    </div>
  );
}