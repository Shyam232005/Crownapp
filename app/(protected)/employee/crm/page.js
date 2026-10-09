"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, CheckCircle2, Clock,
  Send, IndianRupee, Trash2, ArrowRight, UserCheck,
  Building2, Phone, Mail, FileCheck, Loader2, Sparkles,
  Kanban, List, XCircle, ArrowUpRight, ChevronRight, User
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const KANBAN_STAGES = [
  { id: "LEAD", label: "Leads & Inquiries", color: "border-t-indigo-500", badge: "bg-indigo-50 text-indigo-700" },
  { id: "OFFER_SENT", label: "Quotes & Offers Sent", color: "border-t-amber-500", badge: "bg-amber-50 text-amber-700" },
  { id: "WON", label: "Won & Invoiced", color: "border-t-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  { id: "LOST", label: "Closed / Lost", color: "border-t-slate-400", badge: "bg-slate-100 text-slate-600" }
];

export default function EmployeeCRMUI() {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("KANBAN"); // "KANBAN" | "LIST"
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    dealType: "QUOTE",
    stage: "LEAD",
    title: "",
    notes: "",
    items: [{ name: "", quantity: 1, rate: 0, taxRate: 18, amount: 0 }]
  });

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/employee/crm");
      if (res.ok) {
        const json = await res.json();
        setDeals(json.data || []);
      } else {
        toast.error("Failed to load CRM pipeline.");
      }
    } catch (err) {
      console.error("Fetch deals error:", err);
      toast.error("Network error loading deals.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/khata/customer");
      if (res.ok) {
        const json = await res.json();
        setCustomers(json.customers || json.data || []);
      }
    } catch (err) {
      console.warn("Failed to load customers for CRM select:", err);
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchCustomers();
  }, []);

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;

    const qty = Number(updated[index].quantity) || 1;
    const rate = Number(updated[index].rate) || 0;
    updated[index].amount = qty * rate;

    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, rate: 0, taxRate: 18, amount: 0 }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const totalDealAmount = formData.items.reduce((acc, item) => acc + (item.amount || 0), 0);

  const handleSelectCustomer = (e) => {
    const custName = e.target.value;
    const matched = customers.find((c) => c.name === custName);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        customerId: matched._id || "",
        customerName: matched.name,
        customerPhone: matched.phone || "",
        customerEmail: matched.email || ""
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        customerName: custName
      }));
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.title.trim() || totalDealAmount <= 0) {
      toast.error("Please fill in Customer Name, Title, and valid items.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Generating B2B Document...");
    try {
      const initialStage = formData.dealType === "INVOICE" ? "WON" : formData.dealType === "OFFER" ? "OFFER_SENT" : formData.stage;

      const payload = {
        ...formData,
        stage: initialStage,
        amount: totalDealAmount
      };

      const res = await fetch("/api/employee/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create deal.");

      toast.success(`${formData.dealType} created and moved to pipeline!`, { id: toastId });
      try {
        confetti({ particleCount: 40, spread: 70 });
      } catch (_) {}

      setIsModalOpen(false);
      setFormData({
        customerId: "",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        dealType: "QUOTE",
        stage: "LEAD",
        title: "",
        notes: "",
        items: [{ name: "", quantity: 1, rate: 0, taxRate: 18, amount: 0 }]
      });
      fetchDeals();
    } catch (err) {
      toast.error(err.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveStage = async (dealId, nextStage) => {
    const toastId = toast.loading(`Moving deal to ${nextStage}...`);
    try {
      const res = await fetch("/api/employee/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, stage: nextStage })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update deal stage.");

      if (nextStage === "WON") {
        try {
          confetti({ particleCount: 50, spread: 80, origin: { y: 0.6 } });
        } catch (_) {}
      }

      toast.success(`Deal moved to ${nextStage.replace("_", " ")}!`, { id: toastId });
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, stage: nextStage } : d))
      );
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      (deal.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deal.title || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    totalQuotes: deals.filter((d) => d.dealType === "QUOTE").length,
    totalOffers: deals.filter((d) => d.dealType === "OFFER").length,
    totalInvoices: deals.filter((d) => d.dealType === "INVOICE").length,
    pipelineValue: deals.reduce((acc, d) => acc + (d.amount || 0), 0)
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"
          >
            <FileText className="w-6 h-6 text-indigo-600" /> Employee CRM & Quotations Pipeline
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Build Quotes, Special Offers, and Invoices. Internal SME data (strictly hidden from CA firm).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "KANBAN" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "LIST" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Quote / Invoice
          </motion.button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs border-l-4 border-l-indigo-600">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pipeline Volume
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
            {stats.pipelineValue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs border-l-4 border-l-amber-500">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Quotes
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{stats.totalQuotes}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs border-l-4 border-l-purple-500">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Special Offers
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{stats.totalOffers}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs border-l-4 border-l-emerald-500">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Sales Invoices
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{stats.totalInvoices}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals, quotes, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs font-bold text-slate-400">Loading deals...</p>
        </div>
      ) : viewMode === "KANBAN" ? (
        /* Framer Motion Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {KANBAN_STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter(
              (d) => (d.stage || (d.dealType === "INVOICE" ? "WON" : d.dealType === "OFFER" ? "OFFER_SENT" : "LEAD")) === stage.id
            );
            const stageTotal = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

            return (
              <div
                key={stage.id}
                className={`bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 border-t-4 ${stage.color} flex flex-col min-h-[480px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 tracking-tight">{stage.label}</h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      ₹{stageTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${stage.badge}`}>
                    {stageDeals.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {stageDeals.length === 0 ? (
                      <div className="py-12 text-center text-slate-300">
                        <p className="text-xs font-semibold">No deals in this stage</p>
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          whileHover={{ y: -2 }}
                          key={deal._id}
                          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                  deal.dealType === "INVOICE"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : deal.dealType === "OFFER"
                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                }`}
                              >
                                {deal.dealType}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {new Date(deal.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-slate-900 mb-1 line-clamp-1">{deal.title}</h4>
                            <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1 mb-2">
                              <User className="w-3 h-3 text-slate-400" /> {deal.customerName}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold text-slate-400">Value</span>
                              <span className="text-sm font-black text-slate-900">
                                ₹{Number(deal.amount || 0).toLocaleString("en-IN")}
                              </span>
                            </div>

                            {/* Stage Shifting Controls */}
                            <div className="flex items-center gap-1.5 pt-1">
                              {stage.id === "LEAD" && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(deal._id, "OFFER_SENT")}
                                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  Send Offer <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                              {stage.id === "OFFER_SENT" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveStage(deal._id, "WON")}
                                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-black py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    Won <CheckCircle2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveStage(deal._id, "LOST")}
                                    className="px-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                                    title="Mark Lost"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {stage.id === "WON" && (
                                <div className="w-full text-center py-1 text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-lg flex items-center justify-center gap-1">
                                  <FileCheck className="w-3 h-3" /> Invoice Ready
                                </div>
                              )}
                              {stage.id === "LOST" && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveStage(deal._id, "LEAD")}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  Re-open Lead
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {filteredDeals.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-bold">No deals found matching your search.</p>
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <div key={deal._id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-slate-900">{deal.title}</h4>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {deal.dealType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Customer: {deal.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₹{Number(deal.amount || 0).toLocaleString("en-IN")}</p>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">{deal.stage || "LEAD"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* New Deal / Quote Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div>
                  <h2 className="text-lg font-black text-slate-900">New CRM Quote / Invoice</h2>
                  <p className="text-xs font-semibold text-slate-400">
                    Directly linked to your business&apos;s customer directory
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full cursor-pointer text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDeal} className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Document Type Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "QUOTE", label: "Quotation" },
                    { id: "OFFER", label: "Special Offer" },
                    { id: "INVOICE", label: "Sales Invoice" }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, dealType: type.id })}
                      className={`py-3 px-2 rounded-xl text-xs font-black border transition-all cursor-pointer text-center ${
                        formData.dealType === type.id
                          ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-xs"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Customer Directory Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Select Customer <span className="text-rose-500">*</span>
                  </label>
                  {customers.length > 0 ? (
                    <select
                      value={formData.customerName}
                      onChange={handleSelectCustomer}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 mb-2 cursor-pointer"
                    >
                      <option value="">-- Choose Customer from Directory --</option>
                      {customers.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} ({c.phone || "No phone"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="Customer or Organization Name"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Customer Phone</label>
                    <input
                      type="text"
                      placeholder="Phone number"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Deal Title / Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. Bulk Supply 50 units"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Line Items Builder */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700">Item Details</label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <input
                          type="text"
                          placeholder="Item name / description"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Rate"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                          className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-700 w-24 text-right">
                          ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">Total Calculated Amount:</span>
                    <span className="text-base font-black text-indigo-700">
                      ₹{totalDealAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
                    Create {formData.dealType}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
