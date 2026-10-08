"use client";

import Navbar from "@/components/home/Navbar";
import Main from "@/components/home/Main";
import Footer from "@/components/home/Footer";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 
        PREMIUM ANNOUNCEMENT BANNER 
        Uses Framer Motion for a smooth slide-down effect on load.
        Fully responsive: Shows minimal info on mobile, expands on larger screens.
      */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50 bg-slate-900 border-b border-slate-800 px-4 py-2.5 text-center text-xs font-medium tracking-wide text-slate-300 shadow-sm"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 sm:gap-5 flex-wrap">
          
          {/* Live Compliance Badge */}
          <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400"
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100% Compliant
          </motion.span>
          
          {/* Features - Responsive Display */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs"
          >
            <span className="text-white font-semibold">Immutable MCA Audit Trail</span>
            
            <span className="hidden h-1 w-1 rounded-full bg-slate-600 sm:inline-block"></span>
            <span className="hidden text-slate-200 sm:inline-block font-semibold">Direct GSTR-2B ITC Matching</span>
            
            <span className="hidden h-1 w-1 rounded-full bg-slate-600 md:inline-block"></span>
            <span className="hidden text-slate-200 md:inline-block font-semibold">Standard Double-Entry Ledger</span>
          </motion.p>

        </div>
      </motion.div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex w-full flex-1 flex-col">
        <Navbar />
        
        {/* Main Content Animation */}
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="flex-1 flex flex-col"
        >
          <Main />
        </motion.main>
      </div>

      {/* FOOTER */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <Footer />
      </motion.div>
      
    </div>
  );
}