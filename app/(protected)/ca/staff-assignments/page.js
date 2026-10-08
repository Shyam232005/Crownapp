"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  ClipboardCheck, Plus, User, Briefcase, 
  ChevronRight, Loader2, Users, X 
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function StaffAssignmentsUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: { name: "", email: "", role: "Audit Assistant", clientsCount: 0 }
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/ca/staff');
      if (res.ok) {
        const json = await res.json();
        setStaffMembers(json.data || []);
      } else {
        throw new Error("Failed to load");
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to load staff members");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Adding staff member...");
    try {
      const res = await fetch('/api/ca/staff', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add staff member.");
      }

      const json = await res.json();
      setStaffMembers([json.data, ...staffMembers]);
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      toast.success("Staff member added!", { id: loadingToast });
      reset();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Staff Assignments
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Manage your team and distribute client workloads[cite: 20].</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </motion.button>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm animate-pulse space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-5 w-8 bg-slate-200 rounded" />
                </div>
                <div className="h-10 w-full bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : staffMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {staffMembers.map((staff, idx) => (
                <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} key={staff._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-500" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 line-clamp-1">{staff.name}</h3>
                        <p className="text-xs font-bold text-indigo-600">{staff.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-100 mb-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold uppercase">Assigned Clients</span>
                    </div>
                    <span className="text-lg font-black text-slate-900">{staff.clientsCount || 0}</span>
                  </div>
                  
                  <button className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
                    Manage Workload <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">No Staff Members Yet</h4>
            <p className="text-sm font-medium text-slate-500 max-w-sm mb-6">
              You haven't added any audit staff or article assistants to your firm. Click below to add your first team member[cite: 20].
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors"
            >
              Add First Member
            </button>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-slate-900">Add Staff Member</h2>
                <button onClick={() => { reset(); setIsModalOpen(false); }} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Staff Name</label>
                  <input 
                    type="text" 
                    {...register("name", { required: true })} 
                    placeholder="e.g. Amit Sharma"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    {...register("email", { required: true })} 
                    placeholder="e.g. amit@cafirm.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                    <input 
                      type="text" 
                      {...register("role", { required: true })} 
                      placeholder="e.g. Senior Auditor"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assigned Clients</label>
                    <input 
                      type="number" 
                      {...register("clientsCount", { valueAsNumber: true })} 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600" 
                    />
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2 mt-4"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Staff Member"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}