"use client"
import { useSession } from "next-auth/react"
import LNavbar from "@/components/LandingNavbar"
import SMain from "@/components/MainSection";

export default function Home() {
  const { data: session, status } = useSession()
  console.log(session)
  if (status === "loading") {
    return <p>Loading session... Please wait.</p>;
  }
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased text-center">
      {/* Top Compliance Ribbon */}
      <span className="border-b border-slate-200/80 bg-slate-50/90 px-4 py-2 text-center text-xs text-slate-600 sm:text-sm">
        <strong className="font-semibold text-emerald-800">Compliance &amp; Reliability:</strong> Immutable MCA Audit Trail (Edit Log) • Direct GSTR-2B ITC Matching • Standard Double-Entry Ledger for Global Audits
      </span>
      {/*This is navbar for landing page */}
      <LNavbar />
      {/* Main Sections */}
      <SMain />
    </div>
  );
}
