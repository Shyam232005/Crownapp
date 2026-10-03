"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  Settings, Building2, User, Phone, 
  Save, ShieldCheck, FileText, MapPin,
  CheckCircle2, Loader2 
} from "lucide-react";

export default function FirmSettingsUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firmName: "",
      frn: "",
      gstin: "",
      principalCa: "",
      address: "",
      supportPhone: "",
      exportFormat: "Tally XML"
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/ca/settings');
        if (res.ok) {
          const json = await res.json();
          const ca = json.data;
          
          reset({
            firmName: ca.firmName || "FineOps & Associates",
            frn: ca.frn || "",
            gstin: ca.gstin || "",
            principalCa: ca.principalCa || "",
            address: ca.address || "",
            supportPhone: ca.supportPhone || "",
            exportFormat: ca.exportFormat || "Tally XML"
          });
        }
      } catch (error) {
        console.error("Failed to load firm settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [reset]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/ca/settings', { 
        method: 'PATCH', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
      });
      
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      alert("Network error while saving settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
        <p className="text-sm font-bold">Loading firm profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="mb-8">
        <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" /> Firm Settings
        </motion.h1>
        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
          Manage your CA firm's profile, registration details, and workspace preferences[cite: 20].
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Firm Profile Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-black text-slate-800">Firm Details</h2>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Firm Name</label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    {...register("firmName", { required: true })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Firm Registration No. (FRN)</label>
                <div className="relative">
                  <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    {...register("frn")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all uppercase" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Firm GSTIN</label>
                <div className="relative">
                  <FileText className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    {...register("gstin")}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all uppercase" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Principal CA Name</label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    {...register("principalCa", { required: true })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Office Address</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3 top-4" />
                <textarea 
                  rows="2" 
                  {...register("address")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact & Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-500" />
            <h2 className="text-sm font-black text-slate-800">Contact & Support</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Support Phone Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="tel" 
                  {...register("supportPhone")}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Default Export Format</label>
              <select 
                {...register("exportFormat")}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
              >
                <option value="Tally XML">Tally XML</option>
                <option value="Excel (CSV)">Excel (CSV)</option>
                <option value="Zoho Books Format">Zoho Books Format</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Action Button */}
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
              isSaving ? 'bg-slate-700' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
            }`}
          >
            {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Firm Profile</>}
          </motion.button>
        </div>
      </form>
    </div>
  );
}