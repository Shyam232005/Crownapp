"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert, Users, Building2, Briefcase, Calendar,
  Clock, Trash2, PlusCircle, Search, RefreshCw,
  CheckCircle2, AlertTriangle, LogOut, Loader2, Sparkles,
  ArrowUpRight, Phone, Mail, Award, KeyRound, Eye
} from "lucide-react";
import { toast } from "sonner";
import { handleUserSignOut } from "@/lib/logout";

export default function SuperAdminConsole() {
  const router = useRouter();

  // State
  const [activeTab, setActiveTab] = useState("users"); // "users" | "subscriptions" | "provision"
  const [roleFilter, setRoleFilter] = useState("all"); // "all" | "Owner" | "Employee" | "CA"
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [stats, setStats] = useState({
    totalOwners: 0,
    totalEmployees: 0,
    totalCAs: 0,
    activeTrials: 0,
    expiredTrials: 0,
    totalUsers: 0
  });
  const [owners, setOwners] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cas, setCas] = useState([]);

  // Modals & Forms
  const [deleteTarget, setDeleteTarget] = useState(null); // { user, role }
  const [isDeleting, setIsDeleting] = useState(false);

  // Extend Subscription Form State
  const [extPhone, setExtPhone] = useState("");
  const [extDays, setExtDays] = useState(15);
  const [extCustomDate, setExtCustomDate] = useState("");
  const [extPlan, setExtPlan] = useState("Free Trial");
  const [isExtending, setIsExtending] = useState(false);

  // Provisioning Form State
  const [provRole, setProvRole] = useState("Owner");
  const [provName, setProvName] = useState("");
  const [provEmail, setProvEmail] = useState("");
  const [provPhone, setProvPhone] = useState("");
  const [provPassword, setProvPassword] = useState("");
  const [provCompany, setProvCompany] = useState("");
  const [provGstin, setProvGstin] = useState("");
  const [provTrialDays, setProvTrialDays] = useState(30);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Fetch Users & Data
  const loadConsoleData = async (query = "") => {
    try {
      setIsLoading(true);
      const url = query ? `/api/admin/users?query=${encodeURIComponent(query)}` : "/api/admin/users";
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load console data.");
      }
      const data = await res.json();
      setStats(data.stats || {});
      setOwners(data.owners || []);
      setEmployees(data.employees || []);
      setCas(data.cas || []);
    } catch (err) {
      toast.error(err.message || "Network error loading console.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConsoleData();
  }, []);

  // Handle Search Input Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadConsoleData(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extend Trial Action
  const handleExtendSubscription = async (e) => {
    e?.preventDefault();
    if (!extPhone) {
      toast.error("Please provide an Owner phone number.");
      return;
    }
    setIsExtending(true);
    const toastId = toast.loading("Updating subscription...");
    try {
      const res = await fetch("/api/admin/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: extPhone.trim(),
          extendDays: extDays,
          customExpiryDate: extCustomDate || null,
          planName: extPlan
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update subscription");

      toast.success(data.message, { id: toastId });
      setExtPhone("");
      setExtCustomDate("");
      loadConsoleData(searchQuery);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsExtending(false);
    }
  };

  // Cascading Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const toastId = toast.loading("Executing cascading delete...");
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: deleteTarget.user.id,
          role: deleteTarget.role
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      toast.success(data.message, { id: toastId });
      setDeleteTarget(null);
      loadConsoleData(searchQuery);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  // Manual Provisioning Action
  const handleProvisionAccount = async (e) => {
    e.preventDefault();
    setIsProvisioning(true);
    const toastId = toast.loading("Provisioning new account...");
    try {
      const res = await fetch("/api/admin/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: provRole,
          name: provName,
          email: provEmail,
          phoneNumber: provPhone,
          password: provPassword,
          companyName: provCompany,
          gstin: provGstin,
          trialDays: provTrialDays
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Provisioning failed");

      toast.success(data.message, { id: toastId });
      // Reset form
      setProvName("");
      setProvEmail("");
      setProvPhone("");
      setProvPassword("");
      setProvCompany("");
      setProvGstin("");
      loadConsoleData(searchQuery);
      setActiveTab("users");
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsProvisioning(false);
    }
  };

  // Filtered List Assembly
  const combinedUsers = useMemo(() => {
    const list = [];
    if (roleFilter === "all" || roleFilter === "Owner") {
      owners.forEach((o) => list.push({ ...o, role: "Owner" }));
    }
    if (roleFilter === "all" || roleFilter === "Employee") {
      employees.forEach((e) => list.push({ ...e, role: "Employee" }));
    }
    if (roleFilter === "all" || roleFilter === "CA") {
      cas.forEach((c) => list.push({ ...c, role: "CA" }));
    }
    return list;
  }, [owners, employees, cas, roleFilter]);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">

      {/* ========================================================= */}
      {/* 🚀 TOP ADMINISTRATIVE COMMAND BAR                         */}
      {/* ========================================================= */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white uppercase">FineOps Console</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                Root Super-Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Master Orchestration & Workspace Governance</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-lg text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>shyamsangani23@gmail.com</span>
          </div>

          <button
            onClick={() => loadConsoleData(searchQuery)}
            disabled={isLoading}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>

          <button
            onClick={handleUserSignOut}
            className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-xs font-bold text-rose-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 📊 PLATFORM METRIC OVERVIEW CARDS                         */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>SME Workspaces</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalOwners}</div>
            <p className="text-[11px] text-slate-500 mt-1">Total registered business owners</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Active Trials</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.activeTrials}</div>
            <p className="text-[11px] text-emerald-400 mt-1">Within valid 30-day window</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Locked Trials</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.expiredTrials}</div>
            <p className="text-[11px] text-rose-400 mt-1">Read-only state (0 days left)</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Network</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalUsers}</div>
            <p className="text-[11px] text-slate-500 mt-1">Owners, Staff, and CA Firms</p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🎛️ CONTROL CENTER TABS NAVIGATION                        */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("users")}
              className={`relative px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "users" ? "text-emerald-300" : "text-slate-400 hover:text-white"
              }`}
            >
              {activeTab === "users" && (
                <motion.div layoutId="consoleTab" className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm" />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Platform Users ({combinedUsers.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`relative px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "subscriptions" ? "text-emerald-300" : "text-slate-400 hover:text-white"
              }`}
            >
              {activeTab === "subscriptions" && (
                <motion.div layoutId="consoleTab" className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm" />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Extend Trials
              </span>
            </button>

            <button
              onClick={() => setActiveTab("provision")}
              className={`relative px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "provision" ? "text-emerald-300" : "text-slate-400 hover:text-white"
              }`}
            >
              {activeTab === "provision" && (
                <motion.div layoutId="consoleTab" className="absolute inset-0 bg-slate-800 rounded-lg shadow-sm" />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" /> Provision Account
              </span>
            </button>
          </div>

          {activeTab === "users" && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Role Filter Pills */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Owner">Owners Only</option>
                <option value="Employee">Staff Only</option>
                <option value="CA">CA Firms Only</option>
              </select>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 📋 TAB 1: USERS AND WORKSPACES TABLE                      */}
        {/* ========================================================= */}
        {activeTab === "users" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Entity & Identity</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Contact Details</th>
                    <th className="py-3.5 px-4">Organization / Link</th>
                    <th className="py-3.5 px-4">Trial / Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                        <span>Scanning database records...</span>
                      </td>
                    </tr>
                  ) : combinedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                        <span className="font-bold">No matching records found.</span>
                      </td>
                    </tr>
                  ) : (
                    combinedUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* Identity */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">ID: {item.id}</div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                            item.role === "Owner"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                              : item.role === "Employee"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {item.role === "Owner" ? "Business Owner" : item.role === "Employee" ? "Staff Member" : "Chartered Accountant"}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3 h-3 text-slate-500" /> {item.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 mt-0.5 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" /> {item.phoneNumber}
                          </div>
                        </td>

                        {/* Organization */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">
                            {item.companyName || item.firmName || "N/A"}
                          </div>
                          {item.inviteCode && (
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-800 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              CODE: {item.inviteCode}
                            </span>
                          )}
                        </td>

                        {/* Subscription / Trial */}
                        <td className="py-3.5 px-4">
                          {item.role === "Owner" ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${item.isExpired ? "bg-rose-500" : "bg-emerald-400"}`}></span>
                                <span className={`font-bold ${item.isExpired ? "text-rose-400" : "text-emerald-400"}`}>
                                  {item.isExpired ? "Expired (Locked)" : `${item.daysLeft} days left`}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Plan: {item.planName}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Inherited</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.role === "Owner" && (
                              <button
                                onClick={() => {
                                  setExtPhone(item.phoneNumber);
                                  setActiveTab("subscriptions");
                                }}
                                className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                title="Quick Extend Trial"
                              >
                                + Extend
                              </button>
                            )}

                            <button
                              onClick={() => setDeleteTarget({ user: item, role: item.role })}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-colors cursor-pointer"
                              title="Cascading Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ⏳ TAB 2: SUBSCRIPTION TRIAL EXTENDER                     */}
        {/* ========================================================= */}
        {activeTab === "subscriptions" && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Manual Subscription & Trial Adjuster</h2>
                <p className="text-xs text-slate-400">Grant trial extensions or activate commercial plans for any SME Owner.</p>
              </div>
            </div>

            <form onSubmit={handleExtendSubscription} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Owner Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={extPhone}
                    onChange={(e) => setExtPhone(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Quick Days Extension
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 60, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setExtDays(d); setExtCustomDate(""); }}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        extDays === d && !extCustomDate
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                          : "bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      +{d === 365 ? "1 Year" : `${d} Days`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Or Set Specific Expiry Date
                </label>
                <input
                  type="date"
                  value={extCustomDate}
                  onChange={(e) => { setExtCustomDate(e.target.value); setExtDays(0); }}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assign Plan Tier
                </label>
                <select
                  value={extPlan}
                  onChange={(e) => setExtPlan(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="Free Trial">Free Trial</option>
                  <option value="MSME Starter">MSME Starter</option>
                  <option value="Manufacturing & Growth">Manufacturing & Growth</option>
                  <option value="Enterprise Multi-Unit">Enterprise Multi-Unit</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isExtending}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isExtending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Apply Subscription Extension
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* ➕ TAB 3: MANUAL USER & WORKSPACE PROVISIONING            */}
        {/* ========================================================= */}
        {activeTab === "provision" && (
          <div className="max-w-2xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Direct Account Provisioning</h2>
                <p className="text-xs text-slate-400">Instantly register and bootstrap a new Business Owner or CA Firm.</p>
              </div>
            </div>

            <form onSubmit={handleProvisionAccount} className="space-y-4">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-4">
                <button
                  type="button"
                  onClick={() => setProvRole("Owner")}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-colors cursor-pointer ${
                    provRole === "Owner" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Business Owner
                </button>
                <button
                  type="button"
                  onClick={() => setProvRole("CA")}
                  className={`flex-1 py-2 text-xs font-black uppercase rounded-lg transition-colors cursor-pointer ${
                    provRole === "CA" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Chartered Accountant
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={provName}
                    onChange={(e) => setProvName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={provPhone}
                    onChange={(e) => setProvPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={provPassword}
                    onChange={(e) => setProvPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {provRole === "Owner" ? "Company / Business Name" : "Firm Name"}
                  </label>
                  <input
                    type="text"
                    placeholder={provRole === "Owner" ? "Patel Logistics Pvt Ltd" : "Patel & Associates"}
                    value={provCompany}
                    onChange={(e) => setProvCompany(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    {provRole === "Owner" ? "GSTIN (Optional)" : "ICAI Registration No."}
                  </label>
                  <input
                    type="text"
                    placeholder={provRole === "Owner" ? "24AAAAA0000A1Z5" : "ICAI-402918"}
                    value={provGstin}
                    onChange={(e) => setProvGstin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 uppercase font-mono"
                  />
                </div>
              </div>

              {provRole === "Owner" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Trial Window (Days)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={provTrialDays}
                    onChange={(e) => setProvTrialDays(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isProvisioning}
                className="w-full py-3.5 mt-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProvisioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Provision {provRole} Account
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* ⚠️ CASCADING DELETE CONFIRMATION MODAL                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-black text-white">Permanent Cascading Deletion</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You are about to delete <strong className="text-white">{deleteTarget.user.name}</strong> ({deleteTarget.role}).
              </p>

              {deleteTarget.role === "Owner" && (
                <div className="my-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" /> High Impact Cascading Deletion:
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-rose-300/80 space-y-0.5">
                    <li>All linked Employee accounts will be deleted</li>
                    <li>All Transactions & Double-Entry Ledgers will be wiped</li>
                    <li>All Pending Vouchers & Invoices will be removed</li>
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Confirm Wipe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
