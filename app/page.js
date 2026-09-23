"use client"
import Navbar from "@/components/home/Navbar";
import Main from "@/components/home/Main";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAFA] font-sans text-slate-900 antialiased selection:bg-emerald-200 selection:text-emerald-900">
      <div className="relative z-50 bg-slate-950 px-4 py-3 text-center text-xs font-medium tracking-wide text-slate-300 sm:text-sm animate-slide-down">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4">
          <span className="hidden items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 sm:inline-flex animate-fade-in delay-200">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            100% Compliant
          </span>
          <p className="flex items-center gap-2 animate-fade-in delay-300">
            <span className="text-white">Immutable MCA Audit Trail</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block"></span>
            <span className="text-white">Direct GSTR-2B ITC Matching</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:inline-block"></span>
            <span className="text-white">Standard Double-Entry Ledger</span>
          </p>
        </div>
      </div>
      <div className="flex w-full flex-1 flex-col">
        <Navbar />
        <main className="flex-1 animate-slide-up delay-400">
          <Main />
        </main>
      </div>
      <div className="animate-fade-in delay-700">
        <Footer />
      </div>
    </div>
  );
}
