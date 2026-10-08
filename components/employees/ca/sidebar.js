"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Landmark,
  FileSpreadsheet,
  Download,
  ClipboardCheck,
  MessageSquare,
  ShieldAlert,
  Briefcase,
  FileSearch,
  X
} from "lucide-react";
import SignOutModal from "@/components/global/SignOutModal";

const navConfig = [
  {
    category: "Audit Tasks",
    items: [
      { name: "Review Queue", icon: ClipboardCheck, pathname: "/ca-staff/dashboard" },
      { name: "Query Manager", icon: MessageSquare, pathname: "/ca-staff/query-manager" },
    ],
  },
  {
    category: "Assigned Work",
    items: [
      { name: "My Clients", icon: Briefcase, pathname: "/ca-staff/clients" },
      { name: "Voucher Scrutiny", icon: FileSearch, pathname: "/ca-staff/voucher-scrutiny" },
    ],
  },
  {
    category: "Working Papers",
    items: [
      { name: "Bank Reconciliation", icon: Landmark, pathname: "/ca-staff/bank-reconciliation" },
      { name: "Draft Tax Sheets", icon: FileSpreadsheet, pathname: "/ca-staff/tax-sheets" },
    ],
  },
];

function CAStaffSidebarContent({ pathname, onSignOutClick, onItemClick }) {
  const linkClasses = (isActive) =>
    `w-full min-h-[44px] flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
      isActive
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

      {/* Bottom Items */}
      <div className="px-4 pt-3 border-t border-gray-100 space-y-1 mt-auto shrink-0">
        <Link
          href="/ca-staff/export"
          onClick={onItemClick}
          aria-current={pathname === "/ca-staff/export" ? "page" : undefined}
          className={linkClasses(pathname === "/ca-staff/export")}
        >
          <div className="flex items-center">
            <Download className={`w-5 h-5 mr-3 shrink-0 ${pathname === "/ca-staff/export" ? "text-white" : "text-gray-400"}`} />
            <span>Export Data</span>
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

export default function CAEmployeeSidebar() {
  const pathname = usePathname();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  return (
    <>
      {/* DESKTOP ASIDE */}
      <aside className="hidden lg:flex w-64 bg-white h-screen border-r border-gray-100 flex-col pt-6 pb-4 shrink-0">
        <div className="px-8 flex items-center mb-8 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md shadow-indigo-600/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">FineOps</span>
        </div>

        <CAStaffSidebarContent
          pathname={pathname}
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

              <CAStaffSidebarContent
                pathname={pathname}
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
