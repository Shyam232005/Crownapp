"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import {
  Building2, Mail, Lock, Phone, MessageSquare,
  RefreshCw, Loader2, AlertCircle,
  Crown, ShieldCheck, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✨ FIX: Input component ko main function ke BAHAR nikal diya gaya hai. 
// Ab yeh re-render par destroy nahi hoga aur focus nahi hatega!
const Input = ({ icon: Icon, isDark, registration, disabled, ...props }) => (
  <div className="relative mb-4 w-full">
    <Icon className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
    <input
      {...registration} {...props} disabled={disabled}
      className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isDark
          ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500"
          : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600"
        }`}
    />
  </div>
);

export default function ProfessionalLogin() {
  // UI States
  const [isFlipped, setIsFlipped] = useState(false); 
  const [apiError, setApiError] = useState("");
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // --- BUSINESS LOGIN STATE ---
  const [bizMethod, setBizMethod] = useState("email"); 
  const [bizOtpSent, setBizOtpSent] = useState(false);

  const {
    register: bizRegister, handleSubmit: handleBizSubmit, watch: bizWatch, setValue: setBizValue,
    formState: { isSubmitting: isBizSubmitting }
  } = useForm({
    defaultValues: { role: "Owner", email: "", password: "", phone: "", otp: "" }
  });
  const bizRole = bizWatch("role");
  const bizPhone = bizWatch("phone");

  // --- CA LOGIN STATE ---
  const [caMethod, setCaMethod] = useState("email"); 
  const [caOtpSent, setCaOtpSent] = useState(false);

  const {
    register: caRegister, handleSubmit: handleCaSubmit, watch: caWatch, setValue: setCaValue,
    formState: { isSubmitting: isCaSubmitting }
  } = useForm({
    defaultValues: { role: "CA", email: "", password: "", phone: "", otp: "" }
  });
  const caRole = caWatch("role");
  const caPhone = caWatch("phone");

  // Handlers
  const handleSendOtp = (portal) => {
    const phone = portal === "biz" ? bizPhone : caPhone;
    if (!phone || phone.length < 10) {
      setApiError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setApiError("");
    setIsOtpLoading(true);

    setTimeout(() => {
      setIsOtpLoading(false);
      const mockOtp = Math.floor(100000 + Math.random() * 900000);
      alert(`[TESTING MODE] \nYour OTP for ${phone} is: ${mockOtp}`);

      if (portal === "biz") setBizOtpSent(true);
      else setCaOtpSent(true);
    }, 1200);
  };

 const onSubmit = async (data, portalType) => {
        setApiError("");
        const method = portalType === "business" ? bizMethod : caMethod;
        
        // --- OTP LOGIN LOGIC ---
        if (method === "otp") {
            try {
                const res = await fetch("/api/auth/login-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: data.phone,
                        otp: data.otp,
                        role: data.role
                    })
                });

                const result = await res.json();

                if (res.ok) {
                    document.cookie = `fineops_user_id=${result.user?.id || result.userId}; path=/; max-age=86400`;
                    document.cookie = `fineops_role=${data.role}; path=/; max-age=86400`;
                    
                    const redirectPath = 
                        data.role === "Owner" ? "/owner/dashboard" :
                        data.role === "Employee" ? "/employee/dashboard" :
                        data.role === "CA" ? "/ca/dashboard" : "/ca-staff/dashboard";
                    
                    window.location.href = redirectPath;
                } else {
                    setApiError(result.error || "OTP verification failed.");
                }
            } catch (err) {
                setApiError("Network error. Please check your connection.");
            }
            return; 
        }

        // --- EMAIL LOGIN LOGIC ---
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password,
                    role: data.role
                })
            });

            const result = await res.json();

            if (res.ok) {
                document.cookie = `fineops_role=${data.role}; path=/; max-age=86400`; 
                document.cookie = `fineops_user_id=${result.user?.id || result.userId}; path=/; max-age=86400`;
                
                const redirectPath = 
                    data.role === "Owner" ? "/owner" :
                    data.role === "Employee" ? "/employee" :
                    data.role === "CA" ? "/ca" : "/ca-staff";
                
                window.location.href = redirectPath;
            } else {
                setApiError(result.error || "Invalid Credentials.");
            }
        } catch (err) {
            setApiError("Network error. Please check your internet connection.");
        }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden overflow-y-auto">
      {/* ========================================= */}
      {/* LEFT SIDE: DYNAMIC BRANDING PANEL         */}
      {/* ========================================= */}
      <div className={`relative w-full md:w-5/12 p-8 sm:p-12 flex flex-col justify-between transition-colors duration-700 ease-in-out ${isFlipped ? 'bg-slate-900' : 'bg-blue-600'}`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 transition-colors duration-700 ${isFlipped ? 'bg-emerald-500/20' : 'bg-blue-400'}`}></div>
        <div className={`absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/4 transition-colors duration-700 ${isFlipped ? 'bg-emerald-900' : 'bg-blue-800'}`}></div>

        <div className="relative z-10">
          <Link href="/" className={`inline-flex items-center gap-2 transition-colors w-max group ${isFlipped ? 'text-emerald-100 hover:text-white' : 'text-blue-100 hover:text-white'}`}>
            <Crown className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="font-black tracking-widest text-xs uppercase">FineOps Ecosystem</span>
          </Link>
        </div>

        <div className="relative z-10 my-12 md:my-0">
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div key="biz" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm w-max mb-6">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                  Welcome back to<br />your workspace.
                </h2>
                <p className="text-blue-100 text-base font-medium max-w-sm mb-8">
                  Log in to access your business ledgers, pending approvals, and real-time insights.
                </p>
              </motion.div>
            ) : (
              <motion.div key="ca" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-2xl backdrop-blur-sm w-max mb-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                  Access your audit<br />dashboard.
                </h2>
                <p className="text-slate-300 text-base font-medium max-w-sm mb-8">
                  Secure login for Chartered Accountants and staff to review client vouchers and export data.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT SIDE: 3D FLIPPING FORM AREA         */}
      {/* ========================================= */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-4 sm:p-10 lg:p-12 min-h-screen [perspective:1000px] selection:bg-slate-200">
        <div className={`w-full max-w-md relative transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>

          {/* FRONT: BUSINESS LOGIN (Blue Theme) */}
          <div className={`w-full bg-white rounded-[2rem] shadow-2xl border-t-8 border-t-blue-600 p-8 sm:p-10 [backface-visibility:hidden] ${isFlipped ? 'pointer-events-none' : ''}`}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black text-slate-900">Business Login</h1>
              <button onClick={() => { setIsFlipped(true); setApiError(""); }} type="button" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> CA Portal
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
              <button type="button" onClick={() => { setBizValue("role", "Owner"); setApiError(""); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bizRole === "Owner" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Owner</button>
              <button type="button" onClick={() => { setBizValue("role", "Employee"); setApiError(""); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bizRole === "Employee" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Staff</button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
              <button type="button" onClick={() => { setBizMethod("email"); setApiError(""); }} className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${bizMethod === "email" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}>Email</button>
              <button type="button" onClick={() => { setBizMethod("otp"); setApiError(""); }} className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${bizMethod === "otp" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}>Mobile OTP</button>
            </div>

            {apiError && !isFlipped && (
              <div className="mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0" /> {apiError}</div>
            )}

            <form onSubmit={handleBizSubmit((data) => onSubmit(data, "business"))}>
              <AnimatePresence mode="wait">
                {bizMethod === "email" ? (
                  <motion.div key="email-biz" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-1">
                    <Input isDark={false} icon={Mail} type="email" placeholder="Registered Email" registration={bizRegister("email", { required: bizMethod === "email" })} />
                    <Input isDark={false} icon={Lock} type="password" placeholder="Enter Password" registration={bizRegister("password", { required: bizMethod === "email" })} />
                    <div className="flex justify-end mb-6">
                      <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot password?</Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="otp-biz" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-1 mb-6">
                    <div className="flex gap-2 mb-4">
                      <Input 
                        isDark={false} icon={Phone} type="tel" maxLength={10} disabled={bizOtpSent} placeholder="10-Digit Mobile" 
                        registration={bizRegister("phone", { required: bizMethod === "otp" })} 
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }} 
                      />
                      {!bizOtpSent && (
                        <button type="button" onClick={() => handleSendOtp("biz")} disabled={isOtpLoading} className="h-[48px] px-4 bg-blue-50 text-blue-700 font-bold text-xs uppercase rounded-xl hover:bg-blue-100 transition-colors shrink-0 flex items-center justify-center min-w-[90px]">
                          {isOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get OTP"}
                        </button>
                      )}
                    </div>
                    {bizOtpSent && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <Input isDark={false} icon={MessageSquare} type="text" maxLength={6} placeholder="Enter 6-Digit OTP" registration={bizRegister("otp", { required: bizMethod === "otp" })} />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={isBizSubmitting || (bizMethod === "otp" && !bizOtpSent)} className="w-full py-4 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {isBizSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Don't have an account? <Link href="/signup" className="font-bold text-blue-600 hover:underline">Create workspace</Link>
            </div>
          </div>

          {/* BACK: CA FIRM LOGIN (Emerald Theme) */}
          <div className={`w-full bg-slate-900 rounded-[2rem] shadow-2xl border-t-8 border-t-emerald-500 p-8 sm:p-10 [backface-visibility:hidden] absolute top-0 left-0 h-full [transform:rotateY(180deg)] flex flex-col ${!isFlipped ? 'pointer-events-none' : ''}`}>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black text-white">Auditor Login</h1>
              <button onClick={() => { setIsFlipped(false); setApiError(""); }} type="button" className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-800 px-3 py-2 rounded-lg transition-colors hover:bg-slate-700">
                <RefreshCw className="w-3.5 h-3.5" /> Biz Portal
              </button>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-xl mb-4">
              <button type="button" onClick={() => { setCaValue("role", "CA"); setApiError(""); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${caRole === "CA" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}>Firm Admin</button>
              <button type="button" onClick={() => { setCaValue("role", "CA-Employee"); setApiError(""); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${caRole === "CA-Employee" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}>Audit Staff</button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-800 pb-2">
              <button type="button" onClick={() => { setCaMethod("email"); setApiError(""); }} className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${caMethod === "email" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-400"}`}>Email</button>
              <button type="button" onClick={() => { setCaMethod("otp"); setApiError(""); }} className={`text-xs font-bold uppercase tracking-wider pb-2 transition-all ${caMethod === "otp" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-slate-500 hover:text-slate-400"}`}>Mobile OTP</button>
            </div>

            {apiError && isFlipped && (
              <div className="mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0" /> {apiError}</div>
            )}

            <form onSubmit={handleCaSubmit((data) => onSubmit(data, "ca"))} className="flex-1 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {caMethod === "email" ? (
                  <motion.div key="email-ca" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-1">
                    <Input isDark={true} icon={Mail} type="email" placeholder="Official Email Address" registration={caRegister("email", { required: caMethod === "email" })} />
                    <Input isDark={true} icon={Lock} type="password" placeholder="Enter Password" registration={caRegister("password", { required: caMethod === "email" })} />
                    <div className="flex justify-end mb-6">
                      <Link href="#" className="text-xs font-bold text-emerald-500 hover:underline">Forgot password?</Link>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="otp-ca" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-1 mb-6">
                    <div className="flex gap-2 mb-4">
                      <Input 
                        isDark={true} icon={Phone} type="tel" maxLength={10} disabled={caOtpSent} placeholder="10-Digit Mobile" 
                        registration={caRegister("phone", { required: caMethod === "otp" })}
                        onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }} 
                      />
                      {!caOtpSent && (
                        <button type="button" onClick={() => handleSendOtp("ca")} disabled={isOtpLoading} className="h-[48px] px-4 bg-slate-800 text-emerald-400 font-bold text-xs uppercase rounded-xl hover:bg-slate-700 transition-colors shrink-0 flex items-center justify-center min-w-[90px] border border-slate-700">
                          {isOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get OTP"}
                        </button>
                      )}
                    </div>
                    {caOtpSent && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <Input isDark={true} icon={MessageSquare} type="text" maxLength={6} placeholder="Enter 6-Digit OTP" registration={caRegister("otp", { required: caMethod === "otp" })} />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={isCaSubmitting || (caMethod === "otp" && !caOtpSent)} className="w-full py-4 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {isCaSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure Login"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-400">
              Don't have an account? <Link href="/signup" className="font-bold text-emerald-500 hover:underline">Register firm</Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}