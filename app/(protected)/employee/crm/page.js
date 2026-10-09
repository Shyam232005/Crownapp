"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, CheckCircle2, Clock,
  Send, IndianRupee, Trash2, ArrowRight, UserCheck,
  Building2, Phone, Mail, FileCheck, Loader2, Sparkles, Filter
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function EmployeeCRMUI() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, QUOTE, OFFER, INVOICE
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    dealType: "QUOTE",
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

  useEffect(() => {
    fetchDeals();
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

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.title.trim() || totalDealAmount <= 0) {
      toast.error("Please fill in Customer Name, Title, and valid items.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Generating B2B Document...");
    try {
      const payload = {
        ...formData,
        amount: totalDealAmount
      };

      const res = await fetch("/api/employee/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create deal.");

      toast.success(`${formData.dealType} generated successfully!`, { id: toastId });
      try {
        confetti({ particleCount: 35, spread: 60 });
      } catch (_) {}

      setIsModalOpen(false);
      setFormData({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        dealType: "QUOTE",
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

  const handleUpdateStatus = async (dealId, nextStatus) => {
    const toastId = toast.loading(`Updating deal to ${nextStatus}...`);
    try {
      const res = await fetch("/api/employee/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, status: nextStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update deal.");

      toast.success(`Status updated to ${nextStatus}!`, { id: toastId });
      setDeals((prev) =>
        prev.map((d) => (d._id === dealId ? { ...d, status: nextStatus } : d))
      );
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesTab = activeTab === "ALL" || deal.dealType === activeTab;
    const matchesSearch =
      deal.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
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
            <FileText className="w-6 h-6 text-indigo-600" /> Employee CRM & Quotations
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Generate Quotes, Special Offers, and Invoices for customers.
          </p>
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-indigo-600">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pipeline Value
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900 flex items-center">
            <IndianRupee className="w-4 h-4 mr-0.5 text-slate-500" />
            {stats.pipelineValue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Active Quotes
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{stats.totalQuotes}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-purple-500">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Special Offers
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{stats.totalOffers}</p>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Sales Invoices
          </p>
          <p className="text-lg sm:text-xl font-black text-slate-900">{stats.totalInvoices}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Deals" },
            { id: "QUOTE", label: "Quotes" },
            { id: "OFFER", label: "Offers" },
            { id: "INVOICE", label: "Invoices" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals or customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Deals Listing */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-100 rounded w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
              <div className="h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredDeals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredDeals.map((deal) => (
              <motion.div
                key={deal._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                          deal.dealType === "INVOICE"
                            ? "bg-emerald-100 text-emerald-700"
                            : deal.dealType === "OFFER"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {deal.dealType}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          deal.status === "ACCEPTED" || deal.status === "CONVERTED"
                            ? "bg-emerald-50 text-emerald-600"
                            : deal.status === "SENT"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {deal.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400">
                      {new Date(deal.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <h3 className="text-base font-black text-slate-900 mb-1">{deal.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-500" /> {deal.customerName}
                    </span>
                    {deal.customerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {deal.customerPhone}
                      </span>
                    )}
                  </div>

                  {deal.items && deal.items.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-1 text-xs">
                      {deal.items.slice(0, 2).map((item, i) => (
                        <div key={i} className="flex justify-between text-slate-600">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-bold">₹{item.amount?.toLocaleString("en-IN")}</span>
                        </div>
                      ))}
                      {deal.items.length > 2 && (
                        <p className="text-[10px] font-semibold text-slate-400">
                          +{deal.items.length - 2} more items
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Amount
                    </p>
                    <p className="text-base font-black text-slate-900 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-600" />
                      {deal.amount?.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {deal.dealType !== "INVOICE" && (
                      <button
                        onClick={() => handleUpdateStatus(deal._id, "CONVERTED")}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Convert to Invoice
                      </button>
                    )}
                    {deal.status === "DRAFT" && (
                      <button
                        onClick={() => handleUpdateStatus(deal._id, "SENT")}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Mark Sent
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="w-full bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-800 mb-1">No deals found</h3>
          <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto mb-6">
            Create your first Quotation or Special Offer for customers now.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            + Create Deal
          </button>
        </div>
      )}

      {/* Modal: Create Quote / Invoice */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 my-8"
            >
              <h2 className="text-lg font-black text-slate-900 mb-1">
                New Customer Quotation / Invoice
              </h2>
              <p className="text-xs font-medium text-slate-500 mb-6">
                Prepare formal pricing offer. (Data feeds business owner CRM and remains hidden from external CAs).
              </p>

              <form onSubmit={handleCreateDeal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Document Type
                    </label>
                    <select
                      value={formData.dealType}
                      onChange={(e) => setFormData({ ...formData, dealType: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="QUOTE">Quotation (Pricing Estimate)</option>
                      <option value="OFFER">Special Offer (Discounted Deal)</option>
                      <option value="INVOICE">Sales Invoice (Final Bill)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Deal Title / Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bulk Order 100 Pcs"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Client / Company"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Customer Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      placeholder="client@mail.com"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-black text-slate-800">Item Line Items</label>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-indigo-600 text-xs font-bold hover:underline cursor-pointer"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Item Name"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, "name", e.target.value)}
                          className="flex-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                          className="w-16 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-center"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Rate ₹"
                          min="0"
                          value={item.rate}
                          onChange={(e) => handleItemChange(idx, "rate", e.target.value)}
                          className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-right"
                          required
                        />
                        <span className="w-24 text-right text-xs font-bold text-slate-800">
                          ₹{item.amount?.toLocaleString("en-IN")}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">Total Net Amount:</span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{totalDealAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Notes & Terms
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Payment terms, delivery timeline..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Create Document
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
