"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  Settings, Building, User, Phone, 
  KeyRound, Save, CreditCard, Copy, 
  CheckCircle2, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsUI() {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [inviteCode, setInviteCode] = useState(""); 

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      businessName: "",
      gstin: "",
      address: "",
      fullName: "",
      phone: "",
      upiId: "",
      bankAccount: ""
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/owner/settings');
        if (res.ok) {
          const json = await res.json();
          const owner = json.data;
          
          setInviteCode(owner.inviteCode || "PENDING");
          
          reset({
            businessName: owner.companyName || "",
            gstin: owner.gstin || "",
            address: owner.location || "",
            fullName: owner.name || "",
            phone: owner.phoneNumber || "",
            upiId: owner.upiId || "",
            bankAccount: owner.bankAccount || ""
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    const loadingToast = toast.loading("Saving preferences...");
    
    try {
      const res = await fetch('/api/owner/settings', { 
        method: 'PATCH', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
      });
      
      if (res.ok) {
        toast.success("Settings saved successfully!", { id: loadingToast });
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const err = await res.json();
        throw new Error(err.error || "Failed to save settings.");
      }
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
        <p className="text-sm font-bold">Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" /> Settings
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Manage your workspace preferences and business details.
        </p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-black text-indigo-900 mb-1">Workspace Invite Code</h2>
          <p className="text-sm font-medium text-indigo-600 max-w-sm">Share this code with your employees and CA to let them securely join your FineOps workspace.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-indigo-100 w-full sm:w-auto shrink-0">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-indigo-600" />
          </div>
          <span className="text-2xl font-black text-slate-800 tracking-widest">{inviteCode}</span>
          <button 
            type="button"
            onClick={handleCopy} 
            className="ml-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-indigo-600 transition-colors"
          >
            {isCopied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-black text-slate-800">Business Profile</h2>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Name</label>
                <div className="relative">
                  <Building className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    {...register("businessName", { required: true })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GSTIN</label>
                <input 
                  type="text" 
                  placeholder="e.g. 22AAAAA0000A1Z5" 
                  {...register("gstin")}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all uppercase" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Address</label>
              <textarea 
                rows="2" 
                placeholder="Complete business address..." 
                {...register("address")}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-black text-slate-800">Owner Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  {...register("fullName", { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="tel" 
                  {...register("phone", { required: true })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
            <h2 className="text-sm font-black text-slate-800">Receiving Info (Default)</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default UPI ID</label>
              <div className="relative">
                <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  {...register("upiId")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Account Number</label>
              <input 
                type="password" 
                placeholder="e.g. 1234567890" 
                {...register("bankAccount")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
          <AnimatePresence>
            {showSuccess && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" /> Settings Saved!
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isSaving}
            className={`w-full sm:w-auto text-white px-8 py-3.5 rounded-xl text-sm font-black shadow-lg transition-colors flex justify-center items-center gap-2 ml-auto ${
              isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
          </motion.button>
        </div>
      </form>
    </div>
  );
}