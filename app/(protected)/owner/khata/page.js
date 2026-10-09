"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Users, Plus, Loader2, IndianRupee, ArrowDownToLine,
  ReceiptText, Search, Building2, Phone, Mail, MapPin,
  ShieldCheck, X, ArrowUpRight, ArrowDownLeft, AlertCircle
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function OwnerKhataPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, DUE, ADVANCE, SETTLED
  
  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gstin: "",
    billingAddress: "",
    creditLimit: "",
    openingBalance: "",
    balanceType: "DUE" // DUE (+), ADVANCE (-)
  });

  // Fetch Customers
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/khata/customer", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const data = json.customers || json.data || [];
        setCustomers(data);
      } else {
        toast.error("Failed to load customer directory.");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("Network error loading customers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Compute Analytics
  const stats = useMemo(() => {
    let totalReceivables = 0;
    let totalAdvances = 0;
    let customerCount = customers.length;

    customers.forEach((c) => {
      const bal = Number(c.balance || 0);
      if (bal > 0) {
        totalReceivables += bal;
      } else if (bal < 0) {
        totalAdvances += Math.abs(bal);
      }
    });

    return { totalReceivables, totalAdvances, customerCount };
  }, [customers]);

  // Filtered List
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.name?.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.gstin?.toLowerCase().includes(query) ||
        c.billingAddress?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      const bal = Number(c.balance || 0);
      if (filterType === "DUE") return bal > 0;
      if (filterType === "ADVANCE") return bal < 0;
      if (filterType === "SETTLED") return bal === 0;
      return true;
    });
  }, [customers, searchQuery, filterType]);

  // Handle Add Customer Submit
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Customer name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const openingAmt = Number(formData.openingBalance) || 0;
      const initialBal = formData.balanceType === "ADVANCE" ? -openingAmt : openingAmt;

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        gstin: formData.gstin.trim().toUpperCase() || undefined,
        billingAddress: formData.billingAddress.trim(),
        address: formData.billingAddress.trim(),
        creditLimit: Number(formData.creditLimit) || 0,
        openingBalance: initialBal,
        balance: initialBal
      };

      const res = await fetch("/api/khata/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create customer");
      }

      const createdCustomer = data.customer || data.data;
      // Optimistically prepend to list
      setCustomers((prev) => [createdCustomer, ...prev]);

      toast.success(`${createdCustomer.name} added to Customer Khata!`);
      setIsAddCustomerOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        gstin: "",
        billingAddress: "",
        creditLimit: "",
        openingBalance: "",
        balanceType: "DUE"
      });
    } catch (err) {
      console.error("Add Customer error:", err);
      toast.error(err.message || "Failed to add customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2"
          >
            <Users className="w-6 h-6 text-indigo-600" /> Customer Khata & Ledgers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs sm:text-sm font-medium text-slate-500"
          >
            Manage customer accounts, track outstanding Payment to Collect, advance receipts, and GSTIN compliance.
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsAddCustomerOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2 hover:bg-indigo-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Customer
        </motion.button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-rose-500"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Payment to Collect
            </p>
            <p className="text-xl sm:text-2xl font-black text-rose-600 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5 text-rose-600" />
              {stats.totalReceivables.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-5 h-5 text-rose-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Advance Received from Customer
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 flex items-center">
              <IndianRupee className="w-5 h-5 mr-0.5 text-emerald-600" />
              {stats.totalAdvances.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-indigo-500"
        >
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Active Customers
            </p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
              {stats.customerCount} Accounts
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          {[
            { id: "ALL", label: "All Accounts" },
            { id: "DUE", label: "Payment to Collect" },
            { id: "ADVANCE", label: "Advance Received from Customer" },
            { id: "SETTLED", label: "Settled (Zero)" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterType === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-slate-100 rounded"></div>
                  <div className="h-3 w-20 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]"
        >
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">No Customers Found</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm mb-5">
            {searchQuery
              ? "No customer matches your search criteria."
              : "Start by registering your clients to track double-entry transactions and khata balances."}
          </p>
          <button
            onClick={() => setIsAddCustomerOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Customer
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {filteredCustomers.map((cust) => {
              const bal = Number(cust.balance || 0);
              const isDue = bal > 0;
              const isAdvance = bal < 0;
              const isZero = bal === 0;

              return (
                <motion.div
                  variants={itemVariants}
                  layout
                  key={cust._id || cust.name}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Customer Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
                          <span className="font-black text-white text-sm">
                            {cust.name?.charAt(0).toUpperCase() || "C"}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-900 leading-tight">
                            {cust.name}
                          </h4>
                          {cust.phone && (
                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" /> {cust.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {cust.creditLimit > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                          Limit: ₹{cust.creditLimit.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Metadata: GSTIN, Email, Billing Address */}
                    <div className="space-y-1.5 mb-4 text-xs font-medium text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {cust.gstin ? (
                        <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="tracking-wide">GST: {cust.gstin}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 italic">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Unregistered (No GSTIN)</span>
                        </div>
                      )}

                      {cust.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 truncate">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{cust.email}</span>
                        </div>
                      )}

                      {cust.billingAddress && (
                        <div className="flex items-start gap-1.5 text-slate-500 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                          <span className="truncate">{cust.billingAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Balance Ribbon */}
                  <div
                    className={`rounded-xl p-3.5 flex justify-between items-center border ${
                      isDue
                        ? "bg-rose-50/80 border-rose-100"
                        : isAdvance
                        ? "bg-emerald-50/80 border-emerald-100"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          isDue
                            ? "text-rose-600"
                            : isAdvance
                            ? "text-emerald-600"
                            : "text-slate-500"
                        }`}
                      >
                        {isDue
                          ? "Payment to Collect"
                          : isAdvance
                          ? "Advance Received from Customer"
                          : "Settled Balance"}
                      </p>
                      {cust.openingBalance !== undefined && cust.openingBalance !== 0 && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          Opening: ₹{Math.abs(cust.openingBalance).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>

                    <p
                      className={`text-base font-black flex items-center ${
                        isDue
                          ? "text-rose-600"
                          : isAdvance
                          ? "text-emerald-600"
                          : "text-slate-800"
                      }`}
                    >
                      <IndianRupee className="w-4 h-4 mr-0.5" />
                      {Math.abs(bal).toLocaleString("en-IN")}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add New Customer Modal */}
      <AnimatePresence>
        {isAddCustomerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Add New Customer</h2>
                    <p className="text-xs font-medium text-slate-500">
                      Save client details for invoicing, khata, and GST tax filings.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleAddCustomer} className="p-6 overflow-y-auto scrollbar-hide flex-1 space-y-4">
                {/* Customer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Customer / Business Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Industrial Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="accounts@acme.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* GSTIN & Credit Limit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      GSTIN (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={15}
                        placeholder="e.g. 24AAAAA0000A1Z5"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                      Credit Limit (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 100000"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street, City, State, PIN code..."
                    value={formData.billingAddress}
                    onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Opening Balance */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <span className="block text-xs font-black text-slate-700 uppercase">
                    Opening Balance
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, balanceType: "DUE" })}
                      className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.balanceType === "DUE"
                          ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4 text-rose-500" />
                      Payment to Collect (+₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, balanceType: "ADVANCE" })}
                      className={`p-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        formData.balanceType === "ADVANCE"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      Advance Received from Customer (-₹)
                    </button>
                  </div>

                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.openingBalance}
                      onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Save Customer Account
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
