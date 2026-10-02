"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CreditCard, Smartphone, ShieldCheck, 
  IndianRupee, CheckCircle2, Loader2, Lock, ChevronRight, Building
} from "lucide-react";

function PaymentCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL parameters se details fetch kar rahe hain
  const selectedPlan = searchParams.get("plan") || "Professional";
  const selectedCycle = searchParams.get("cycle") || "Yearly";
  const selectedPrice = searchParams.get("price") || "4999";

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("UPI");

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Mock Payment Gateway processing time
    setTimeout(() => {
      setIsProcessing(false);
      // Payment successful hote hi Signup page par bhej do
      router.push(`/signup?status=paid&plan=${selectedPlan}`); 
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full py-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
            <Lock className="w-7 h-7 text-indigo-600" /> Secure Checkout
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-sm font-medium text-slate-500">
            Complete your payment to activate your FineOps workspace.
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Order Summary (Dynamic Details) */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm border-l-4 border-l-indigo-500 h-max">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Plan</p>
              <h3 className="text-xl font-black text-slate-900">FineOps {selectedPlan}</h3>
              <p className="text-xs font-bold text-indigo-600 mt-2 bg-indigo-50 inline-block px-3 py-1 rounded-md">{selectedCycle} Billing</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
              <ShieldCheck className="w-7 h-7 text-indigo-600" />
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-6 mt-6">
            <div className="flex justify-between items-center mb-3 text-sm font-medium text-slate-600">
              <span>Plan Base Price</span>
              <span className="flex items-center"><IndianRupee className="w-3.5 h-3.5 mr-0.5" /> {parseInt(selectedPrice).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-sm font-medium text-slate-600">
              <span>Taxes (GST 18%)</span>
              <span className="text-emerald-600 font-bold">Included</span>
            </div>
            
            <div className="flex justify-between items-center bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-indigo-600 flex items-center tracking-tight">
                <IndianRupee className="w-6 h-6 mr-0.5" /> {parseInt(selectedPrice).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <ul className="space-y-3 mt-6 pt-6 border-t border-slate-100">
            {["100% Secure & Encrypted", "No hidden setup fees", "Instant Account Activation"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Payment Methods */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-5">
          
          <div className="flex gap-3 border-b border-slate-100 pb-2">
            {["UPI", "Card", "Netbanking"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-5 py-3 rounded-xl text-sm font-black transition-all ${
                  activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {activeTab === tab && (
                  <motion.div layoutId="paymentTab" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-full">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 border border-slate-100">
              {activeTab === "UPI" && <Smartphone className="w-10 h-10 text-emerald-500" />}
              {activeTab === "Card" && <CreditCard className="w-10 h-10 text-indigo-500" />}
              {activeTab === "Netbanking" && <Building className="w-10 h-10 text-amber-500" />}
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">Pay securely via {activeTab}</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-8">
              Click below to launch the payment gateway. Your transaction is protected with 256-bit SSL encryption.
            </p>

            <button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 text-base font-black text-white bg-slate-900 hover:bg-slate-800 px-4 py-4 rounded-xl transition-colors shadow-md mt-auto"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Pay <IndianRupee className="w-4 h-4" />{parseInt(selectedPrice).toLocaleString("en-IN")} Now <ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}

// Wrapping in Suspense is mandatory in Next.js 16 App Router when using useSearchParams
export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>}>
        <PaymentCheckoutContent />
      </Suspense>
    </div>
  );
}