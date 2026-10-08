"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Database, IndianRupee, Landmark, Wallet, 
  CheckCircle2, Loader2, ArrowRight 
} from "lucide-react";
import toast from "react-hot-toast";

export default function DataSetupUI() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "Owner";
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      cashInHand: "",
      bankBalance: "",
      closingDate: new Date().toISOString().split('T')[0] // Defaults to today
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Establishing secure opening balances...");

    try {
      const payload = {
        role,
        cashInHand: Number(data.cashInHand) || 0,
        bankBalance: Number(data.bankBalance) || 0,
        asOfDate: data.closingDate
      };

      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save opening balances");
      }

      toast.success("Setup complete! Your workspace is ready.", { id: loadingToast });
      
      // Redirect to login as requested
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (error) {
      toast.error(error.message, { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
      >
        <div className="p-8 md:p-12 text-center bg-indigo-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <Database className="w-12 h-12 text-indigo-300 mx-auto mb-4 relative z-10" />
          <h1 className="text-3xl font-black mb-2 relative z-10">Let's Pick Up Where You Left Off</h1>
          <p className="text-indigo-200 font-medium relative z-10">
            Enter your closing balances from last month so FineOps can seamlessly integrate with your existing records.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-8">
          
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-2">
              {role === "Owner" ? "Business Opening Balances" : "Your Petty Cash & Float"}
            </h3>

            {/* Cash In Hand */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Cash in Hand (Closing Balance)
              </label>
              <div className="relative">
                <Wallet className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <IndianRupee className="w-4 h-4 text-slate-600 absolute left-11 top-1/2 -translate-y-1/2" />
                <input 
                  type="number" 
                  step="0.01"
                  {...register("cashInHand", { required: true })}
                  placeholder="0.00"
                  className="w-full pl-16 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-2">
                {role === "Owner" ? "Total physical cash available in the business." : "Total petty cash currently assigned to you."}
              </p>
            </div>

            {/* Bank Balance - Only for Owners */}
            {role === "Owner" && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Primary Bank Balance
                </label>
                <div className="relative">
                  <Landmark className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <IndianRupee className="w-4 h-4 text-slate-600 absolute left-11 top-1/2 -translate-y-1/2" />
                  <input 
                    type="number" 
                    step="0.01"
                    {...register("bankBalance", { required: true })}
                    placeholder="0.00"
                    className="w-full pl-16 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
                  />
                </div>
              </div>
            )}

            {/* As Of Date */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                As Of Date
              </label>
              <input 
                type="date" 
                {...register("closingDate", { required: true })}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all" 
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl text-sm font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing Setup...</>
              ) : (
                <>Save & Continue to Login <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}