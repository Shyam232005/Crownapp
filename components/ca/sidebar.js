"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Briefcase,
  FolderKanban,
  FileSpreadsheet,
  PieChart,
  Download,
  Settings,
  LogOut,
  ShieldAlert,
  Copy,
  Check,
  Users
} from "lucide-react";

const navConfig = [
  {
    category: "Practice Overview",
    items: [
      { name: "Firm Dashboard", icon: LayoutDashboard, pathname: "/ca/dashboard" },
      { name: "Filing Calendar", icon: Calendar, pathname: "/ca/filing-calendar" },
    ],
  },
  {
    category: "Client Management",
    items: [
      { name: "Client Directory", icon: Briefcase, pathname: "/ca/clients" },
      { name: "Staff Assignments", icon: FolderKanban, pathname: "/ca/staff-assignments" },
    ],
  },
  {
    category: "Tax & Compliance",
    items: [
      { name: "GST Summary", icon: FileSpreadsheet, pathname: "/ca/gst-summary" },
      { name: "Audit Reports", icon: PieChart, pathname: "/ca/audit-reports" },
    ],
  },
  {
    category: "Data Hub",
    items: [
      { name: "Tally / ERP Sync", icon: Download, pathname: "/ca/data-sync" },
    ],
  },
];

const bottomConfig = [
  { name: "Firm Settings", icon: Settings, pathname: "/ca/settings" },
  { name: "Sign Out", icon: LogOut, pathname: "/" },
];

export default function CASidebar() {
  const pathname = usePathname();
  
  // ✨ NEW STATES FOR INVITE CODE
  const [inviteCode, setInviteCode] = useState("Loading...");
  const [copied, setCopied] = useState(false);

  // ✨ FETCH CA PROFILE FOR INVITE CODE
  useEffect(() => {
    const fetchCaProfile = async () => {
      try {
        const res = await fetch("/api/ca/profile");
        if (res.ok) {
          const data = await res.json();
          setInviteCode(data.inviteCode);
        } else {
          setInviteCode("Error");
        }
      } catch (error) {
        setInviteCode("Error");
      }
    };
    fetchCaProfile();
  }, []);

  // ✨ MAGIC LINK COPY FUNCTION
  const handleCopy = () => {
    if (inviteCode && inviteCode !== "Loading..." && inviteCode !== "Error") {
      const inviteLink = `${window.location.origin}/signup?invite=${inviteCode}`;
      navigator.clipboard.writeText(inviteLink);
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const linkClasses = (isActive) =>
    `w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-100 flex flex-col pt-6 pb-4">
      {/* Logo */}
      <div className="px-8 flex items-center mb-8">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">FineOps</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide">
        {navConfig.map((section, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              {section.category}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.pathname;
                return (
                  <Link
                    key={itemIdx}
                    href={item.pathname}
                    aria-current={isActive ? "page" : undefined}
                    className={linkClasses(isActive)}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ✨ CA STAFF INVITE LINK BLOCK */}
      <div className="px-4 mb-4">
        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
          <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Staff Invite Link
          </h3>
          <div className="bg-white border border-emerald-100 rounded-xl flex items-center justify-between p-1 pl-3 shadow-sm">
            <span className="text-xs font-bold text-emerald-900 tracking-wide">
              {inviteCode}
            </span>
            <button
              onClick={handleCopy}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                copied 
                  ? "bg-emerald-500 text-white" 
                  : "bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600"
              }`}
              title="Copy Magic Invite Link"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[9px] text-emerald-500/80 font-medium mt-2 leading-relaxed">
            Share this link to onboard your audit staff.
          </p>
        </div>
      </div>

      {/* Bottom Items */}
      <div className="px-4 pt-4 border-t border-gray-100 space-y-1 mt-auto">
        {bottomConfig.map((item, idx) => {
          const Icon = item.icon;
          const isActive = pathname === item.pathname;
          return (
            <Link
              key={idx}
              href={item.pathname}
              aria-current={isActive ? "page" : undefined}
              className={linkClasses(isActive)}
            >
              <div className="flex items-center">
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-white" : "text-gray-400"}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}