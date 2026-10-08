"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, User as UserIcon, Loader2, Clock } from "lucide-react";

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
        
        // ✨ SECURITY ENFORCEMENT: Redirect if not authenticated
        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch header data", error);
        router.push("/login"); // Catch network errors and redirect
      } finally {
        setLoading(false);
      }
    };

    fetchHeaderData();
  }, [router]);

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      
      {/* LEFT SIDE: Dynamic Greeting */}
      <div className="flex flex-col justify-center">
        {loading ? (
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-100 animate-pulse rounded"></div>
            <div className="h-3 w-48 bg-slate-50 animate-pulse rounded"></div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-slate-800">
              {greeting}, {userData?.name?.split(' ')[0] || "User"} 👋
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Here is what's happening in your workspace today.
            </p>
          </>
        )}
      </div>

      {/* RIGHT SIDE: Plan Info / Profile Details */}
      <div className="flex items-center gap-5">
        {loading ? (
          <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        ) : userData?.role === "Owner" ? (
          // OWNER BADGE: Shows Plan and Validity
          <div className="flex items-center gap-3 bg-indigo-50/50 border border-indigo-100 px-4 py-2 rounded-full">
            <div className="flex items-center gap-1.5 border-r border-indigo-200 pr-3">
              <Crown className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">{userData.planName}</span>
            </div>
            <div className="flex items-center gap-1.5 pl-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className={`text-xs font-bold ${userData.daysLeft <= 7 ? 'text-rose-600' : 'text-slate-600'}`}>
                {userData.daysLeft} days left
              </span>
            </div>
          </div>
        ) : (
          // EMPLOYEE / CA BADGE: Shows Simple Role
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-full">
            <UserIcon className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">
              {userData?.role === "Employee" ? "Staff Member" : 
               userData?.role === "CA" ? "Principal CA" : 
               userData?.role === "CAStaff" ? "Audit Staff" : userData?.role}
            </span>
          </div>
        )}
        
        {/* User Initial Avatar */}
        {!loading && (
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md border-2 border-white ring-2 ring-indigo-50">
            {userData?.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    </header>
  );
}