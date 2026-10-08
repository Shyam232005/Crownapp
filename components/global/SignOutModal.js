"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Loader2, ShieldCheck } from "lucide-react";
import { handleUserSignOut } from "@/lib/logout";

export default function SignOutModal({ isOpen, onClose }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onConfirm = async () => {
    setIsLoggingOut(true);
    await handleUserSignOut();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md">
          {/* Backdrop click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoggingOut ? onClose : undefined}
            className="fixed inset-0"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="bg-white/95 backdrop-blur-xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-200/60 text-center relative overflow-hidden z-10"
          >
            {/* Mobile handle indicator */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Subtle top ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 shadow-sm relative z-10">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight relative z-10">Sign Out Session?</h3>
            <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed relative z-10">
              Are you sure you want to log out? Your HTTP session cookie and active local cache will be securely cleared.
            </p>

            <div className="flex items-center gap-3 mt-6 relative z-10">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onClose}
                disabled={isLoggingOut}
                className="flex-1 min-h-[44px] py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={onConfirm}
                disabled={isLoggingOut}
                className="flex-1 min-h-[44px] py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
