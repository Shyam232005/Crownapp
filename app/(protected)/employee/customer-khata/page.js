"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Users, Plus, Loader2, IndianRupee, ArrowDownToLine, 
  ReceiptText, X, AlertCircle
} from "lucide-react";

export default function EmployeeKhata() {
  const [khataEntries, setKhataEntries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: "Sales Invoice", partyName: "", amount: "", paymentMode: "UPI", description: "" }
  });
  
  const selectedType = watch("type");

  useEffect(() => {
    const fetchKhata = async () => {
      try {
        const [txRes, custRes] = await Promise.allSettled([
          fetch("/api/employee/transactions?type=SALES", { cache: "no-store" }),
          fetch("/api/khata/customer", { cache: "no-store" })
        ]);

        const custMap = {};

        // 1. Seed strictly with registered customers belonging to the same companyId
        if (custRes.status === "fulfilled" && custRes.value.ok) {
          const custJson = await custRes.value.json();
          const dbCustomers = custJson.customers || custJson.data || [];
          dbCustomers.forEach((c) => {
            if (c.name) {
              custMap[c.name.trim()] = { 
                name: c.name.trim(), 
                balance: Number(c.balance || 0),
                phone: c.phone || "",
                gstin: c.gstin || ""
              };
            }
          });
        }

        // 2. Overlay approved / exported transactions for live running balance
        if (txRes.status === "fulfilled" && txRes.value.ok) {
          const json = await txRes.value.json();
          const customerData = json.data || [];
          setKhataEntries(customerData);

          customerData.forEach((entry) => {
            const party = entry.metadata?.customerName || entry.metadata?.vendorName;
            if (entry.status !== "REJECTED" && party) {
              const name = party.trim();
              if (custMap[name]) {
                if (entry.status === "APPROVED" || entry.status === "EXPORTED") {
                  const amt = Number(entry.totalAmount || entry.amount || 0);
                  if (entry.type === "SALES") {
                    custMap[name].balance += amt;
                  } else if (["ADVANCE_RECEIVED", "COLLECTION", "PAYMENT_IN"].includes(entry.type)) {
                    custMap[name].balance -= amt;
                  }
                }
              }
            }
          });
        }

        setCustomers(Object.values(custMap).sort((a, b) => b.balance - a.balance));
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load customer ledger.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchKhata();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (!data.partyName || !data.partyName.trim()) {
        toast.error("Please select a customer from the directory.");
        return;
      }

      const amountNum = Number(data.amount);
      if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
        toast.error("Please enter a valid positive amount.");
        return;
      }

      const isAdvance = data.type === "Customer Received";
      const txnType = isAdvance ? "ADVANCE_RECEIVED" : "SALES";

      // Map frontend fields to double-entry khata API
      const payload = {
        type: txnType,
        customerName: data.partyName.trim(),
        partyName: data.partyName.trim(),
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        hsnCode: "0000",
        baseAmount: amountNum,
        totalAmount: amountNum,
        amount: amountNum,
        description: data.description || (isAdvance ? "Advance Received from Customer" : "Sales Invoice Entry"),
        paymentMode: data.paymentMode || "UPI"
      };

      let res = await fetch('/api/khata', { 
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });

      if (!res.ok) {
        // Fallback to /api/transactions
        res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save khata entry");
      }

      const savedEntry = await res.json();
      
      // Update local transaction state instantly
      setKhataEntries(prev => [{
        _id: savedEntry.transaction?._id || savedEntry.transactionId || String(Date.now()),
        type: txnType,
        status: 'PENDING_OWNER_APPROVAL',
        totalAmount: payload.totalAmount,
        metadata: { customerName: payload.customerName, vendorName: payload.customerName, description: payload.description }
      }, ...prev]);

      // Update customers balance in UI
      setCustomers(prev => {
        const existingIdx = prev.findIndex(c => c.name.toLowerCase() === payload.customerName.toLowerCase());
        const delta = isAdvance ? -amountNum : amountNum;
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            balance: (updated[existingIdx].balance || 0) + delta
          };
          return updated;
        }
        return prev;
      });
      
      toast.success("Entry recorded and sent for Owner sign-off!");
      reset(); 
      setIsModalOpen(false);

    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Customer Khata & Dues
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            View customer ledgers and log sales or advance payments.
          </p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-200 transition-colors flex items-center justify-center gap-2 hover:bg-indigo-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Log Khata Entry
        </motion.button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-slate-100 rounded"></div>
                  <div className="h-3 w-16 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">No Customers in Directory</h3>
          <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
            Customers are managed by the Business Owner. Once added by the Owner, you can record sales and advances against them here.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {customers.map((cust, idx) => {
              const isDue = cust.balance > 0;
              const isAdvance = cust.balance < 0;

              return (
                <motion.div 
                  layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                  key={cust.name} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="font-black text-slate-600">{cust.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-black text-slate-900 truncate">{cust.name}</h4>
                      {cust.phone && <p className="text-xs text-slate-400 font-medium">{cust.phone}</p>}
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-4 flex justify-between items-center border ${
                    isDue ? 'bg-rose-50 border-rose-100' : isAdvance ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${
                        isDue ? 'text-rose-600' : isAdvance ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {isDue ? 'Payment to Collect' : isAdvance ? 'Advance Received from Customer' : 'Settled (Zero Balance)'}
                      </p>
                    </div>
                    <p className={`text-sm font-black flex items-center shrink-0 ${
                      isDue ? 'text-rose-600' : isAdvance ? 'text-emerald-600' : 'text-slate-700'
                    }`}>
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {Math.abs(cust.balance).toLocaleString("en-IN")}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* New Khata Entry Modal (Owner Unified Customers Dropdown Only) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md shrink-0">
                <h2 className="text-lg font-black text-slate-900">Log Khata Transaction</h2>
                <button 
                  type="button"
                  onClick={() => { reset(); setIsModalOpen(false); }} 
                  className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto scrollbar-hide flex-1">
                
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button 
                    type="button" 
                    onClick={() => setValue("type", "Sales Invoice")} 
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      selectedType === "Sales Invoice" ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <ReceiptText className="w-6 h-6" />
                    <span className="text-xs font-black">Sales Invoice (Payment to Collect)</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setValue("type", "Customer Received")} 
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                      selectedType === "Customer Received" ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownToLine className="w-6 h-6" />
                    <span className="text-xs font-black">Advance Received from Customer</span>
                  </button>
                </div>

                {/* Unified Customer Dropdown */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Select Customer <span className="text-rose-500">*</span>
                  </label>
                  {customers.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>No customers registered yet. Only Business Owners can add customers.</span>
                    </div>
                  ) : (
                    <select 
                      {...register("partyName", { required: true })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose Customer from Directory --</option>
                      {customers.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name} {c.balance > 0 ? `(Payment to Collect: ₹${c.balance.toLocaleString("en-IN")})` : c.balance < 0 ? `(Advance Received: ₹${Math.abs(c.balance).toLocaleString("en-IN")})` : `(Settled)`}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-[11px] font-medium text-slate-400 mt-1">
                    Directly linked to your business&apos;s verified customer directory.
                  </p>
                </div>

                {/* Amount & Mode */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Amount (₹)</label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="number" 
                        min="1" 
                        step="0.01" 
                        placeholder="0.00"
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                        {...register("amount", { required: true })} 
                      />
                    </div>
                  </div>
                  {selectedType === "Customer Received" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Payment Mode</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" {...register("paymentMode")}>
                        <option value="UPI">UPI</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer / NEFT</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Remarks / Note</label>
                  <input 
                    type="text" 
                    placeholder="Reference, bill number, or reason..." 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                    {...register("description")} 
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} 
                  type="submit" 
                  disabled={isSubmitting || customers.length === 0} 
                  className="w-full py-4 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Owner Sign-off"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}