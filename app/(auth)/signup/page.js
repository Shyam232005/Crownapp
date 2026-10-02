"use client";
import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { 
    Building2, User, Mail, Phone, Lock, KeyRound, Award, 
    RefreshCw, Loader2, AlertCircle, MapPin, CreditCard, 
    Crown, ShieldCheck, CheckCircle2, Sparkles, ShieldAlert, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✨ FIX: Move Input outside to prevent re-renders causing focus loss
const Input = ({ icon: Icon, isDark, as = "input", children, registration, ...props }) => (
    <div className="relative mb-4 w-full">
        <Icon className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
        {as === "select" ? (
            <select {...registration} {...props} className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all appearance-none ${isDark ? "bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-emerald-500" : "bg-slate-50 border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-600"}`}>
                {children}
            </select>
        ) : (
            <input {...registration} {...props} className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-semibold outline-none transition-all ${isDark ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600"}`} />
        )}
    </div>
);

function SignupFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const paymentStatus = searchParams.get("status");
    const isPaid = paymentStatus === "paid";
    const purchasedPlan = searchParams.get("plan") || "Free Trial";
    const inviteCodeParam = searchParams.get("invite");

    const isCaInvite = inviteCodeParam?.startsWith("CA-");
    const [isFlipped, setIsFlipped] = useState(isCaInvite ? true : false); 
    const [apiError, setApiError] = useState("");

    const [manualCode, setManualCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [isCodeVerified, setIsCodeVerified] = useState(false);
    const [verifiedEntityName, setVerifiedEntityName] = useState("");

    const {
        register: bizRegister, handleSubmit: handleBizSubmit, watch: bizWatch, setValue: setBizValue,
        formState: { isSubmitting: isBizSubmitting }
    } = useForm({
        defaultValues: {
            role: (!isPaid && inviteCodeParam) ? "Employee" : "Owner", 
            companyName: "", gstin: "", location: "", Category: "", 
            inviteCode: inviteCodeParam || "",
            name: "", phoneNumber: "", email: "", password: "",
            planName: purchasedPlan
        }
    });
    const bizRole = bizWatch("role");

    const {
        register: caRegister, handleSubmit: handleCaSubmit, watch: caWatch, setValue: setCaValue,
        formState: { isSubmitting: isCaSubmitting }
    } = useForm({
        defaultValues: {
            role: isCaInvite ? "CA-Employee" : "CA", 
            firmName: "", icaiNumber: "", 
            inviteCode: inviteCodeParam || "",
            name: "", phoneNumber: "", email: "", password: ""
        }
    });
    const caRole = caWatch("role");

    const handleVerifyCode = async (roleType) => {
        setVerifyError("");
        if (!manualCode.trim()) return setVerifyError("Please enter a code");
        
        setIsVerifying(true);
        try {
            const type = (roleType === "CA-Employee") ? "ca" : "biz";
            
            const res = await fetch("/api/auth/verify-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: manualCode.trim(), type })
            });
            const data = await res.json();
            
            if (res.ok) {
                setIsCodeVerified(true);
                setVerifiedEntityName(data.entityName);
                if (roleType === "Employee") setBizValue("inviteCode", manualCode.trim());
                if (roleType === "CA" || roleType === "CA-Employee") setCaValue("inviteCode", manualCode.trim());
            } else {
                setVerifyError(data.error || "Invalid code");
            }
        } catch (err) {
            setVerifyError("Network error. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const switchRole = (portal, newRole) => {
        setApiError(""); setVerifyError(""); setManualCode(""); setIsCodeVerified(false);
        if (portal === "biz") setBizValue("role", newRole);
        else setCaValue("role", newRole);
    };

    const onSubmit = async (data, portalType) => {
        setApiError("");
        try {
            if (data.role === "CA") data.joinedViaCode = data.inviteCode;
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                alert(result.message);
                router.push("/login"); 
            } else {
                setApiError(result.error || "Registration failed.");
            }
        } catch (err) {
            setApiError("Network error. Please check your connection.");
        }
    };

    return (
        // ✨ FIX: Main container with full height and auto scroll
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden overflow-y-auto">
            {/* LEFT BRANDING PANEL */}
            <div className={`relative w-full md:min-h-screen md:w-5/12 p-8 sm:p-12 flex flex-col justify-between transition-colors duration-700 ease-in-out ${isFlipped ? 'bg-slate-900' : 'bg-blue-600'}`}>
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
                                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm w-max mb-4">
                                    {inviteCodeParam || isCodeVerified ? <Sparkles className="w-8 h-8 text-white" /> : isPaid ? <CheckCircle2 className="w-8 h-8 text-white" /> : <Building2 className="w-8 h-8 text-white" />}
                                </div>
                                <h2 className="text-3xl font-black text-white tracking-tight mb-2 leading-tight">
                                    {inviteCodeParam || isCodeVerified ? "You're invited!" : isPaid ? "Payment Successful!" : "Secure Workspace"}
                                </h2>
                                <p className="text-blue-100 text-sm font-medium max-w-sm mb-6">
                                    {inviteCodeParam || isCodeVerified
                                        ? `Set up your staff account to join ${verifiedEntityName || "the workspace"}.` 
                                        : isPaid 
                                            ? `You have purchased the "${purchasedPlan}". Set up your workspace.`
                                            : "A premium or invited account is required to access FineOps."}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="ca" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                <div className="bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-2xl backdrop-blur-sm w-max mb-6">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                                    {inviteCodeParam || isCodeVerified ? "Partner Audit Invite" : "Restricted CA Portal"}
                                </h2>
                                <p className="text-emerald-100 text-sm font-medium max-w-sm mb-6">
                                    {inviteCodeParam || isCodeVerified ? `Register to manage audits for ${verifiedEntityName || "the client"}.` : "An official invite code is required to register a CA firm or join as audit staff."}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* RIGHT FORM AREA */}
            {/* ✨ FIX: Added py-10 for padding and allowed content to define height */}
            <div className="w-full md:w-7/12 flex items-center justify-center p-4 py-10 sm:p-10 lg:p-12 min-h-screen [perspective:1000px] selection:bg-slate-200 overflow-y-auto">
                {/* ✨ FIX: min-h-[500px] to ensure it doesn't collapse, h-max so it grows with content */}
                <div className={`w-full max-w-xl relative h-max min-h-[500px] transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}>

                    {/* FRONT: BUSINESS SIGNUP */}
                    <div className={`w-full bg-white rounded-[2rem] shadow-2xl border-t-8 border-t-blue-600 p-6 sm:p-10 [backface-visibility:hidden] absolute inset-0 h-max ${isFlipped ? 'pointer-events-none' : ''}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-black text-slate-900">Workspace Setup</h1>
                            <button onClick={() => { setIsFlipped(true); setApiError(""); setVerifyError(""); }} type="button" className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" /> CA Portal
                            </button>
                        </div>

                        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
                            <button type="button" onClick={() => switchRole("biz", "Owner")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bizRole === "Owner" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Business Owner</button>
                            <button type="button" onClick={() => switchRole("biz", "Employee")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bizRole === "Employee" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Join as Staff</button>
                        </div>

                        {apiError && !isFlipped && <div className="mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0" /> {apiError}</div>}

                        {bizRole === "Owner" && !isPaid ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-2">
                                <ShieldAlert className="w-12 h-12 text-slate-400 mb-4" />
                                <h3 className="text-lg font-black text-slate-800">Premium Account Required</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-6 max-w-sm">You must purchase a plan to register a new workspace.</p>
                                <Link href="/pricing" className="py-3 px-6 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">View Pricing & Plans</Link>
                            </motion.div>
                        ) : bizRole === "Employee" && !inviteCodeParam && !isCodeVerified ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 mt-2">
                                <Lock className="w-12 h-12 text-slate-400 mb-4" />
                                <h3 className="text-lg font-black text-slate-800">Invite Code Required</h3>
                                <p className="text-sm text-slate-500 mt-2 mb-4 max-w-sm">Please enter the magic code provided by your employer.</p>
                                
                                <div className="flex w-full max-w-xs gap-2">
                                    <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value.toUpperCase())} placeholder="e.g. BIZ-XXXX" className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-white border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none uppercase" />
                                    <button type="button" onClick={() => handleVerifyCode("Employee")} disabled={isVerifying} className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center min-w-[80px]">
                                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                    </button>
                                </div>
                                {verifyError && <p className="text-rose-500 text-xs font-bold mt-3 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {verifyError}</p>}
                            </motion.div>
                        ) : (
                            <form onSubmit={handleBizSubmit((data) => onSubmit(data, "business"))}>
                                <div className="animate-in fade-in zoom-in-95 duration-200">
                                    {bizRole === "Owner" ? (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                                <Input isDark={false} icon={Building2} placeholder="Company Name" registration={bizRegister("companyName", { required: true })} />
                                                <Input isDark={false} icon={Award} placeholder="GST Number" registration={bizRegister("gstin", { required: true })} />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                                <Input isDark={false} icon={MapPin} placeholder="City / Location" registration={bizRegister("location", { required: true })} />
                                                <Input isDark={false} icon={CreditCard} as="select" registration={bizRegister("Category", { required: true })}>
                                                    <option value="">Business Type</option>
                                                    <option value="MSMEs">MSMEs</option>
                                                    <option value="Large">Large Enterprise</option>
                                                </Input>
                                            </div>
                                            <hr className="border-slate-100 my-4" />
                                        </>
                                    ) : (
                                        <div className="mb-4 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Joining Workspace</p>
                                                <p className="text-sm font-black text-slate-800">{verifiedEntityName || "Verified Company"}</p>
                                            </div>
                                            <Check className="w-6 h-6 text-blue-500" />
                                            <input type="hidden" {...bizRegister("inviteCode", { required: true })} />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                        <Input isDark={false} icon={User} placeholder="Your Full Name" registration={bizRegister("name", { required: true })} />
                                        <Input 
                                            isDark={false} 
                                            icon={Phone} 
                                            type="tel" 
                                            maxLength={10} 
                                            placeholder="Mobile Number" 
                                            registration={bizRegister("phoneNumber", { required: true })}
                                            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                        <Input isDark={false} icon={Mail} type="email" placeholder="Email Address" registration={bizRegister("email", { required: true })} />
                                        <Input isDark={false} icon={Lock} type="password" minLength={8} placeholder="Create Password" registration={bizRegister("password", { required: true })} />
                                    </div>
                                </div>
                                <button type="submit" disabled={isBizSubmitting} className="w-full py-4 mt-2 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                    {isBizSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* BACK: CA FIRM SIGNUP */}
                    {/* ✨ FIX: Ensure backface also takes required height using h-max */}
                    <div className={`w-full bg-slate-900 rounded-[2rem] shadow-2xl border-t-8 border-t-emerald-500 p-6 sm:p-10 [backface-visibility:hidden] absolute inset-0 h-max flex flex-col [transform:rotateY(180deg)] ${!isFlipped ? 'pointer-events-none' : ''}`}>
                         <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-black text-white">Auditor Setup</h1>
                            <button onClick={() => { setIsFlipped(false); setApiError(""); setVerifyError(""); }} type="button" className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-slate-800 px-3 py-2 rounded-lg transition-colors hover:bg-slate-700">
                                <RefreshCw className="w-3.5 h-3.5" /> Biz Portal
                            </button>
                        </div>

                        <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
                            <button type="button" onClick={() => switchRole("ca", "CA")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${caRole === "CA" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}>Register Firm</button>
                            <button type="button" onClick={() => switchRole("ca", "CA-Employee")} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${caRole === "CA-Employee" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-300"}`}>Join as Staff</button>
                        </div>

                        {apiError && isFlipped && <div className="mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-in fade-in"><AlertCircle className="w-4 h-4 shrink-0" /> {apiError}</div>}

                        {!inviteCodeParam && !isCodeVerified ? (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-800 rounded-2xl border border-dashed border-slate-700 mt-2">
                                <Lock className="w-12 h-12 text-slate-500 mb-4" />
                                <h3 className="text-lg font-black text-white">Invite Code Required</h3>
                                <p className="text-sm text-slate-400 mt-2 mb-4">Please enter your assigned invite code to continue.</p>
                                
                                <div className="flex w-full max-w-xs gap-2">
                                    <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value.toUpperCase())} placeholder={caRole === "CA" ? "e.g. BIZ-XXXX" : "e.g. CA-XXXX"} className="flex-1 px-4 py-3 rounded-xl text-sm font-bold bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-emerald-500 outline-none uppercase" />
                                    <button type="button" onClick={() => handleVerifyCode(caRole)} disabled={isVerifying} className="px-4 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors flex items-center justify-center min-w-[80px]">
                                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                                    </button>
                                </div>
                                {verifyError && <p className="text-rose-400 text-xs font-bold mt-3 flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> {verifyError}</p>}
                            </motion.div>
                        ) : (
                            <form onSubmit={handleCaSubmit((data) => onSubmit(data, "ca"))} className="flex-1 flex flex-col justify-center">
                                <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{caRole === "CA" ? "Linked Client" : "Firm Name"}</p>
                                            <p className="text-sm font-black text-white">{verifiedEntityName || "Verified Entity"}</p>
                                        </div>
                                        <Check className="w-6 h-6 text-emerald-500" />
                                        <input type="hidden" {...caRegister("inviteCode", { required: true })} />
                                    </div>
                                    
                                    {caRole === "CA" && (
                                        <>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                                <Input isDark={true} icon={Building2} placeholder="CA Firm Name" registration={caRegister("firmName", { required: true })} />
                                                <Input isDark={true} icon={Award} placeholder="ICAI Memb. No." registration={caRegister("icaiNumber", { required: true })} />
                                            </div>
                                            <hr className="border-slate-800 my-4" />
                                        </>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                        <Input isDark={true} icon={User} placeholder="Full Name" registration={caRegister("name", { required: true })} />
                                        <Input 
                                            isDark={true} 
                                            icon={Phone} 
                                            type="tel" 
                                            maxLength={10} 
                                            placeholder="Mobile Number" 
                                            registration={caRegister("phoneNumber", { required: true })}
                                            onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ""); }} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4">
                                        <Input isDark={true} icon={Mail} type="email" placeholder="Official Email" registration={caRegister("email", { required: true })} />
                                        <Input isDark={true} icon={Lock} type="password" minLength={8} placeholder="Secure Password" registration={caRegister("password", { required: true })} />
                                    </div>
                                </div>
                                <button type="submit" disabled={isCaSubmitting} className="w-full py-4 mt-4 bg-emerald-600 text-white text-sm font-black rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20">
                                    {isCaSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Create Account"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ProfessionalSignup() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>}>
            <SignupFormContent />
        </Suspense>
    );
}