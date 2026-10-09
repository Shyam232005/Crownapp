"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { 
  FileSpreadsheet, Plus, CheckCircle2, IndianRupee, 
  Clock, Send, Loader2, Inbox, X, Building2, Calculator, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function DraftTaxSheetsUI() {
  const [isLoading, setIsLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonthStr, setCurrentMonthStr] = useState("");

  // GST Bracket Aggregation State from Double-Entry Journal Entries
  const [gstSummary, setGstSummary] = useState({
    brackets: [
      { rate: 5, outputTax: 0, inputTax: 0, netLiability: 0 },
      { rate: 12, outputTax: 0, inputTax: 0, netLiability: 0 },
      { rate: 18, outputTax: 0, inputTax: 0, netLiability: 0 }
    ],
    totalOutputTax: 0,
    totalInputTax: 0,
    totalNetLiability: 0
  });

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { clientId: "", month: "", outputTax: "", itc: "" }
  });

  useEffect(() => {
    const currentPeriod = new Date().toLocaleString("default", { month: "long", year: "numeric" });
    setCurrentMonthStr(currentPeriod);
    reset({ month: currentPeriod });
    
    fetchDrafts();
    fetchClients();
  }, [reset]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/ca-staff/tax-drafts");
      if (res.ok) {
        const json = await res.json();
        setDrafts(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch tax drafts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/ca-staff/clients");
      if (res.ok) {
        const json = await res.json();
        const clientList = Array.isArray(json.data) ? json.data : (json.data?.clients || []);
        setClients(clientList);
        if (clientList.length > 0) {
          const firstId = clientList[0].id || clientList[0]._id;
          setSelectedClient(firstId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  // Fetch GST Brackets aggregated from Journal Entries for selected client
  useEffect(() => {
    if (!selectedClient) return;

    const fetchGstBrackets = async () => {
      try {
        const res = await fetch(`/api/accounting?type=gst-summary&companyId=${selectedClient}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.brackets) {
            setGstSummary(json.data);
            setValue("clientId", selectedClient);
            setValue("outputTax", json.data.totalOutputTax);
            setValue("itc", json.data.totalInputTax);
          }
        }
      } catch (err) {
        console.error("Failed to fetch GST brackets:", err);
      }
    };

    fetchGstBrackets();
  }, [selectedClient, setValue]);

  const onSubmit = async (data) => {
    const loadingToast = toast.loading("Saving tax draft computation...");
    try {
      const selectedClientObj = clients.find(
        (c) => (c.id || c._id) === (data.clientId || selectedClient)
      );

      const outputNum = Number(data.outputTax) || 0;
      const itcNum = Number(data.itc) || 0;

      const payload = {
        ...data,
        clientId: data.clientId || selectedClient,
        clientName: selectedClientObj?.companyName || selectedClientObj?.name || "Client SME",
        outputTax: outputNum,
        itc: itcNum,
        liability: outputNum - itcNum
      };

      const res = await fetch("/api/ca-staff/tax-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create draft");
      }

      toast.success("Draft tax sheet saved successfully!", { id: loadingToast });
      try {
        confetti({ particleCount: 35, spread: 60 });
      } catch (_) {}
      fetchDrafts();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const sendToCA = async (id) => {
    const loadingToast = toast.loading("Sending computation to Principal CA...");
    try {
      const res = await fetch("/api/ca-staff/tax-drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Pending CA Approval" })
      });

      if (!res.ok) throw new Error("Failed to send draft");

      toast.success("Sent for Principal CA review!", { id: loadingToast });
      setDrafts(drafts.map((d) => (d._id === id ? { ...d, status: "Pending CA Approval" } : d)));
    } catch (error) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"
          >
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" /> Draft Tax Sheets & GST Brackets
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Aggregate Journal Entries by GST brackets (5%, 12%, 18%) to calculate Input Tax Credit vs Output Liability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-600 shadow-sm transition-all outline-none cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id || c._id} value={c.id || c._id}>
                  {c.companyName}
                </option>
              ))}
            </select>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> New Draft
          </motion.button>
        </div>
      </div>

      {/* Structured GST Tax Brackets Table (5%, 12%, 18%) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900">
              GST Tax Bracket Computation (Journal Aggregation)
            </h2>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Current Period: {currentMonthStr}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">GST Rate</th>
                <th className="py-3 px-4 text-right">Output Tax (Sales GST)</th>
                <th className="py-3 px-4 text-right">Input Tax Credit (ITC)</th>
                <th className="py-3 px-4 text-right">Net Tax Liability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {[5, 12, 18].map((rate) => {
                const b = gstSummary.brackets?.find((x) => x.rate === rate) || {
                  rate,
                  outputTax: 0,
                  inputTax: 0,
                  netLiability: 0
                };
                return (
                  <tr key={rate} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      {rate}% GST Bracket
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-900">
                      ₹{b.outputTax?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-600">
                      ₹{b.inputTax?.toLocaleString("en-IN")}
                    </td>
                    <td className={`py-3.5 px-4 text-right font-mono font-black ${
                      (b.outputTax - b.inputTax) >= 0 ? "text-rose-600" : "text-emerald-600"
                    }`}>
                      ₹{(b.outputTax - b.inputTax)?.toLocaleString("en-IN")}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
                <td className="py-3.5 px-4 uppercase tracking-wider">Total Aggregation</td>
                <td className="py-3.5 px-4 text-right font-mono">
                  ₹{gstSummary.totalOutputTax?.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-600">
                  ₹{gstSummary.totalInputTax?.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-600 text-sm">
                  ₹{gstSummary.totalNetLiability?.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Computations List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[350px]">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800">Saved Tax Computations</h2>
        </div>
        
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="p-6 divide-y divide-slate-100">
              {[1, 2, 3].map((n) => (
                <div key={n} className="py-4 flex flex-col sm:flex-row items-center justify-between animate-pulse gap-4">
                  <div className="h-6 w-40 bg-slate-100 rounded"></div>
                  <div className="h-6 w-24 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : drafts.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {drafts.map((draft, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={draft._id}
                  className="p-5 sm:p-6 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      draft.status === "Draft" ? "bg-amber-50 text-amber-500" : "bg-indigo-50 text-indigo-500"
                    }`}>
                      {draft.status === "Draft" ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">{draft.clientName || draft.client}</h4>
                      <p className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded mt-1 inline-block">
                        {draft.month}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 sm:gap-12">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Output Tax</p>
                      <p className="text-sm font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-3 h-3 mr-0.5" />{draft.outputTax?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ITC</p>
                      <p className="text-sm font-black text-emerald-600 flex items-center">
                        <IndianRupee className="w-3 h-3 mr-0.5" />{draft.itc?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Liability</p>
                      <p className="text-sm font-black text-rose-600 flex items-center">
                        <IndianRupee className="w-3 h-3 mr-0.5" />{draft.liability?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 xl:pt-0">
                    {draft.status === "Draft" ? (
                      <button 
                        onClick={() => sendToCA(draft._id)}
                        className="w-full xl:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer"
                      >
                        <Send className="w-4 h-4" /> Send to Principal CA
                      </button>
                    ) : (
                      <span className="w-full xl:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <CheckCircle2 className="w-4 h-4" /> Sent for CA Review
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
              <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h4 className="text-base font-black text-slate-800 mb-1">No Saved Draft Computations</h4>
              <p className="text-xs font-medium text-slate-400 max-w-sm">
                Click &ldquo;New Draft&rdquo; to prepare monthly tax computations and dispatch to your Principal CA.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Draft Computation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black text-slate-900">New GST Tax Draft</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Target Client *</label>
                  <select
                    {...register("clientId", { required: true })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600"
                  >
                    {clients.map((c) => (
                      <option key={c.id || c._id} value={c.id || c._id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Filing Month / Period</label>
                  <input
                    type="text"
                    {...register("month", { required: true })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Output Tax (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("outputTax", { required: true })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Input Tax Credit (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("itc", { required: true })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Save Draft
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