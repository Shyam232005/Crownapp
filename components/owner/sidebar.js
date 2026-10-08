"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Activity, CheckSquare, Landmark, Users,
  ShoppingCart, FileText, PieChart, Settings, LogOut, ShieldAlert,
  Copy, Check, Sparkles, X, ReceiptText
} from "lucide-react";
import SignOutModal from "@/components/global/SignOutModal";

const navConfig = [
  {
    category: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, pathname: "/owner/dashboard" },
      { name: "Financial Health", icon: Activity, pathname: "/owner/financial" }
    ]
  },
  {
    category: "Operations",
    items: [
      { name: "Approvals Queue", icon: CheckSquare, pathname: "/owner/approvals" },
      { name: "Cash & Banking", icon: Landmark, pathname: "/owner/banking" }
    ]
  },
  {
    category: "Network & Supply",
    items: [
      { name: "Sales & Invoices", icon: ReceiptText, pathname: "/owner/sales" },
      { name: "Customer Khata", icon: Users, pathname: "/owner/khata" },
      { name: "Purchases & Vendors", icon: ShoppingCart, pathname: "/owner/purchases" }
    ]
  },
  {
    category: "Compliance",
    items: [
      { name: "CA Hub", icon: FileText, pathname: "/owner/ca-hub" },
      { name: "Tax Reports", icon: PieChart, pathname: "/owner/tax-reports" }
    ]
  }
];

function SidebarContent({ pathname, inviteCode, copied, handleCopy, onSignOutClick, onItemClick }) {
  const linkClasses = (isActive) =>
    `w-full min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${isActive
      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
      : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
    }`;

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 scrollbar-hide space-y-6">
        {navConfig.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5 px-4">
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
                    onClick={onItemClick}
                    aria-current={isActive ? "page" : undefined}
                    className={linkClasses(isActive)}
                  >
                    <Icon className={`w-5 h-5 mr-3 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Glowing Invite Code Card */}
      <div className="px-4 mt-2 shrink-0">
        <div className="relative group p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200/40">
          <div className="relative z-10 flex flex-col">
            <span className="flex items-center text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-500 shrink-0" />
              Staff Invite Code
            </span>

            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm">
              <code className="text-sm font-black tracking-widest text-slate-800 select-all truncate mr-2">
                {inviteCode}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                disabled={inviteCode === "Loading..."}
                className="min-h-[32px] min-w-[32px] p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                title="Copy Code"
                aria-label="Copy Invite Code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] font-medium text-indigo-600/70 mt-2 text-center">
              Share this to onboard your team
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Items */}
      <div className="px-4 pt-3 border-t border-gray-100 space-y-1 mt-3 shrink-0">
        <Link
          href="/owner/settings"
          onClick={onItemClick}
          aria-current={pathname === "/owner/settings" ? "page" : undefined}
          className={linkClasses(pathname === "/owner/settings")}
        >
          <div className="flex items-center">
            <Settings className={`w-5 h-5 mr-3 shrink-0 ${pathname === "/owner/settings" ? "text-white" : "text-gray-400"}`} />
            <span>Settings</span>
          </div>
        </Link>
        <button
          onClick={onSignOutClick}
          type="button"
          className="w-full min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center">
            <LogOut className="w-5 h-5 mr-3 text-rose-500 group-hover:scale-110 transition-transform shrink-0" />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  // State for Invite Code, Modal, and Mobile Drawer
  const [inviteCode, setInviteCode] = useState("Loading...");
  const [copied, setCopied] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fetch Invite Code from Backend
  useEffect(() => {
    const fetchInviteCode = async () => {
      try {
        const res = await fetch("/api/owner/profile");
        if (res.ok) {
          const data = await res.json();
          setInviteCode(data.inviteCode);
        } else {
          setInviteCode("Error Fetching");
        }
      } catch (error) {
        console.error("Failed to fetch invite code", error);
        setInviteCode("Network Error");
      }
    };

    fetchInviteCode();
  }, []);

  // Listen to GlobalHeader hamburger toggle
  useEffect(() => {
    const toggle = () => setIsMobileOpen((prev) => !prev);
    const close = () => setIsMobileOpen(false);
    window.addEventListener("fineops_toggle_mobile_sidebar", toggle);
    window.addEventListener("fineops_close_mobile_sidebar", close);
    return () => {
      window.removeEventListener("fineops_toggle_mobile_sidebar", toggle);
      window.removeEventListener("fineops_close_mobile_sidebar", close);
    };
  }, []);

  // Auto-close on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleCopy = () => {
    if (inviteCode && inviteCode !== "Loading..." && inviteCode !== "Error Fetching") {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 bg-white h-screen border-r border-gray-100 flex-col pt-6 pb-4 shrink-0">
        <div className="px-8 flex items-center mb-8 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-600/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">FineOps</span>
        </div>

        <SidebarContent
          pathname={pathname}
          inviteCode={inviteCode}
          copied={copied}
          handleCopy={handleCopy}
          onSignOutClick={() => setShowSignOutModal(true)}
          onItemClick={() => {}}
        />
      </aside>

      {/* MOBILE / TABLET OFF-CANVAS DRAWER */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />

            {/* Slide Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col pt-6 pb-4 z-10 border-r border-slate-200"
            >
              <div className="px-6 flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-600/20">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 tracking-tight">FineOps</span>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-9 h-9 min-h-[36px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <SidebarContent
                pathname={pathname}
                inviteCode={inviteCode}
                copied={copied}
                handleCopy={handleCopy}
                onSignOutClick={() => {
                  setIsMobileOpen(false);
                  setShowSignOutModal(true);
                }}
                onItemClick={() => setIsMobileOpen(false)}
              />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <SignOutModal isOpen={showSignOutModal} onClose={() => setShowSignOutModal(false)} />
    </>
  );
}