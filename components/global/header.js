"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, User as UserIcon, Loader2, Clock, Menu } from "lucide-react";
import LiveComplianceTicker from "@/components/dynamic/LiveComplianceTicker";

export default function GlobalHeader() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    // 1. Dynamic Greeting Logic based on Local Time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // 2. Fetch User Profile & Plan Details
    const fetchHeaderData = async () => {
      try {
        const res = await fetch("/api/user/header-profile");
        
        // Security: Redirect if unauthorized
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch header data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();

    // 3. Instant Profile Sync across settings updates
    const handleProfileUpdate = () => {
      fetchHeaderData();
    };

    window.addEventListener("fineops_profile_updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("fineops_profile_updated", handleProfileUpdate);
    };
  }, [router]);

  const isTrialLocked = (userData?.role === "Owner" || userData?.role === "Employee") && userData?.daysLeft <= 0;

  return (
    <>
      {/* ⚠️ EXPIRY LOCK BANNER: Read-Only Mode Notice */}
      {isTrialLocked && (
        <div className="bg-gradient-to-r from-rose-600 to-amber-600 text-white px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs sm:text-sm font-bold shadow-md sticky top-0 z-30 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span>Free Trial Expired (0 Days Remaining). Workspace is operating in Read-Only Mode. Historical records are preserved.</span>
          </div>
          <button 
            type="button"
            onClick={() => router.push(userData?.role === "Owner" ? "/owner/settings" : "#")}
            className="px-3.5 py-1.5 min-h-[36px] bg-white text-rose-700 rounded-lg text-xs font-black shadow-sm hover:bg-rose-50 transition-colors uppercase tracking-wider shrink-0 ml-4 cursor-pointer"
          >
            Upgrade Workspace
          </button>
        </div>
      )}

      <header className="h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 transition-all duration-300">
        
        {/* LEFT SIDE: Mobile Menu Trigger + Dynamic Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={() => window.dispatchEvent(new CustomEvent("fineops_toggle_mobile_sidebar"))}
            className="lg:hidden w-10 h-10 min-h-[40px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all cursor-pointer shrink-0 border border-slate-200/60"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col justify-center min-w-0">
            {loading ? (
              <div className="space-y-1.5">
                <div className="h-5 w-28 bg-slate-200/60 animate-pulse rounded-lg"></div>
                <div className="h-3 w-40 bg-slate-100/60 animate-pulse rounded-md hidden sm:block"></div>
              </div>
            ) : (
              <>
                <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight truncate">
                  {greeting}, {userData?.name?.split(' ')[0] || "User"} 👋
                </h2>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5 truncate hidden sm:block">
                  {userData?.companyName ? `${userData.companyName} • ` : ""}Real-time Financial Operations OS
                </p>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Plan Info / Profile Details */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Dynamic Live Status Indicator */}
          <LiveComplianceTicker variant="header" />

          {loading ? (
            <div className="w-24 sm:w-28 h-9 bg-slate-100/60 animate-pulse rounded-full"></div>
          ) : userData?.isSuperAdmin || userData?.role === "Admin" ? (
            // SUPER ADMIN BADGE
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-emerald-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase">Super Admin</span>
            </div>
          ) : userData?.role === "Owner" || userData?.role === "Employee" ? (
            // OWNER / EMPLOYEE BADGE: Shows Plan and Validity Countdown
            <div className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border shadow-sm transition-all ${
              userData?.daysLeft <= 0 
                ? 'bg-rose-50/80 border-rose-200 text-rose-700' 
                : userData?.daysLeft <= 5 
                ? 'bg-amber-50/80 border-amber-200 text-amber-800' 
                : 'bg-indigo-50/60 border-indigo-100 text-indigo-900 backdrop-blur-xs'
            }`}>
              <div className="flex items-center gap-1.5 sm:border-r sm:border-indigo-200/50 sm:pr-3">
                <Crown className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-black">{userData.planName}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 pl-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span className={`text-xs font-black ${
                  userData.daysLeft <= 0 ? 'text-rose-600' : userData.daysLeft <= 5 ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {userData.daysLeft <= 0 ? 'Trial Expired' : `${userData.daysLeft}d left`}
                </span>
              </div>
            </div>
          ) : (
            // CA FIRM / CA STAFF BADGE
            <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm">
              <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-black text-slate-700">
                {userData?.role === "CA" ? "Principal CA" : 
                 userData?.role === "CAStaff" || userData?.role === "CA-Employee" ? "Audit Staff" : userData?.role}
              </span>
            </div>
          )}
          
          {/* User Initial Avatar */}
          {!loading && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-md shadow-indigo-500/20 border-2 border-white ring-2 ring-indigo-50 hover:scale-105 transition-transform cursor-pointer shrink-0">
              {userData?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
      </header>
    </>
  );
}