'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/validations/contactSchema';
import { motion, AnimatePresence } from 'framer-motion';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const fadeDown = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

export default function ContactUsPage() {
    const [submittedData, setSubmittedData] = useState(null);
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            role: 'founder',
            industrySector: 'manufacturing',
            currentAccountingSoftware: 'tally_prime',
            invoiceIntakeMethod: 'whatsapp_and_paper',
            monthlyInvoiceVolume: '50-200',
            annualTurnover: '5cr_25cr',
            primaryGoal: 'replace_desktop',
        }
    });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            setSubmittedData(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            setServerError(error.message);
        }
    };

    const handleEditSubmission = () => {
        setSubmittedData(null);
    };

    return (
        <div className="relative w-full bg-[#FAFAFA] pb-24 pt-12 sm:pt-16 overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">

                {}
                <motion.div
                    className="text-center max-w-3xl mx-auto space-y-5"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <motion.div variants={fadeDown} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-800 shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
                        </span>
                        System Assessment
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Request a Tailored Platform Demo
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-base leading-relaxed text-slate-600 sm:text-lg">
                        Tell us about your operational volume and current tech stack. Our advisory team will configure a personalized environment tailored to your exact industry before we call.
                    </motion.p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {}
                    <motion.div variants={fadeUp} className="space-y-6 lg:col-span-4 lg:sticky lg:top-24">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
                            <div className="bg-slate-900 p-6 text-white">
                                <h2 className="text-xl font-bold">Crown Advisory Desk</h2>
                                <p className="mt-1 text-sm text-slate-400">Direct Contact & Support</p>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Operational Hub</p>
                                        <p className="mt-1 text-sm text-slate-600">Crown Ecosystems Pvt Ltd<br />Surat, Gujarat</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Priority Contact</p>
                                        <p className="mt-1 text-sm text-slate-600">contact@crownecosystems.com<br />+91 97233 86344</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/80 p-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="text-xs font-bold text-emerald-900">Enterprise Guarantee</p>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-emerald-800">
                                        Zero spam. Your operational data, turnover figures, and contact details are protected under strict internal NDA protocols.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm hover:shadow-md transition-shadow duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-xl">💼</span>
                                <h3 className="font-bold text-slate-900">Are you a Chartered Accountant?</h3>
                            </div>
                            <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                                If you run an audit practice and want complimentary access to your clients' read-only portals, use our dedicated ICAI partner onboarding.
                            </p>
                            <Link href="/ca-login" className="inline-flex items-center text-sm font-bold text-emerald-700 hover:text-emerald-800 group">
                                Access CA Portal
                                <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: THE FORM */}
                    <motion.div variants={fadeUp} className="lg:col-span-8">
                        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 sm:p-12 shadow-xl shadow-slate-200/40 min-h-[600px]">

                            {serverError && (
                                <div className="mb-6 rounded-lg bg-rose-50 p-4 border border-rose-200 text-sm text-rose-700 font-medium">
                                    Server Error: {serverError}
                                </div>
                            )}

                            {/* AnimatePresence handles the smooth crossfade between the Form and the Success Dossier */}
                            <AnimatePresence mode="wait">
                                {submittedData ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -30 }}
                                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        className="py-10"
                                    >
                                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
                                            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                        </div>
                                        <div className="text-center space-y-3 mb-10">
                                            <h3 className="text-3xl font-extrabold text-slate-900">Assessment Received</h3>
                                            <p className="mx-auto max-w-lg text-base text-slate-600 leading-relaxed">
                                                Thank you, <strong className="text-slate-900">{submittedData.fullName}</strong>. We have securely logged your operations profile for <strong className="text-slate-900">{submittedData.companyName || 'your enterprise'}</strong>. A product specialist will call you shortly.
                                            </p>
                                        </div>

                                        {/* Submission Dossier */}
                                        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
                                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-200 pb-3">Logged Profile Intelligence</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                                <div>
                                                    <p className="text-slate-500 text-xs">Primary Contact</p>
                                                    <p className="font-semibold text-slate-900">{submittedData.fullName} ({submittedData.role})</p>
                                                    <p className="text-slate-700">{submittedData.workEmail}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs">Organization</p>
                                                    <p className="font-semibold text-slate-900">{submittedData.companyName}</p>
                                                    <p className="text-slate-700">{submittedData.cityState} • {submittedData.industrySector}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs">Volume & Turnover</p>
                                                    <p className="font-semibold text-slate-900">{submittedData.monthlyInvoiceVolume} bills/mo</p>
                                                    <p className="text-slate-700">{submittedData.annualTurnover.replace(/_/g, ' ').toUpperCase()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs">Current Tech Stack</p>
                                                    <p className="font-semibold text-slate-900 capitalize">{submittedData.currentAccountingSoftware.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 text-center">
                                            <button
                                                onClick={handleEditSubmission}
                                                className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                                            >
                                                ← Edit Information
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                        onSubmit={handleSubmit(onSubmit)}
                                        className="space-y-12"
                                    >

                                        {/* SECTION 1 */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800">1</span>
                                                <h3 className="text-lg font-bold text-slate-900">Decision-Maker Details</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Full Name *</label>
                                                    <input
                                                        {...register('fullName')}
                                                        placeholder="e.g. Rajesh Shah"
                                                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none ${errors.fullName ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}`}
                                                    />
                                                    {errors.fullName && <p className="text-[11px] font-medium text-rose-500">{errors.fullName.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Your Role *</label>
                                                    <select
                                                        {...register('role')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="founder">Business Owner / Managing Director</option>
                                                        <option value="finance_head">CFO / Accounts Manager</option>
                                                        <option value="accountant">Senior Accountant / Bookkeeper</option>
                                                        <option value="ca_auditor">Chartered Accountant / Auditor</option>
                                                        <option value="plant_head">Plant Head / Operations</option>
                                                    </select>
                                                    {errors.role && <p className="text-[11px] font-medium text-rose-500">{errors.role.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Work Email *</label>
                                                    <input
                                                        {...register('workEmail')}
                                                        placeholder="rajesh@apexengineering.com"
                                                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none ${errors.workEmail ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}`}
                                                    />
                                                    {errors.workEmail && <p className="text-[11px] font-medium text-rose-500">{errors.workEmail.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Mobile Number *</label>
                                                    <input
                                                        {...register('phone')}
                                                        placeholder="9825000000"
                                                        maxLength={10}
                                                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none ${errors.phone ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}`}
                                                    />
                                                    {errors.phone && <p className="text-[11px] font-medium text-rose-500">{errors.phone.message}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 2 */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800">2</span>
                                                <h3 className="text-lg font-bold text-slate-900">Organization Profile</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-2 sm:col-span-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Company Legal Name *</label>
                                                    <input
                                                        {...register('companyName')}
                                                        placeholder="e.g. Apex Precision Engineering LLP"
                                                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none ${errors.companyName ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}`}
                                                    />
                                                    {errors.companyName && <p className="text-[11px] font-medium text-rose-500">{errors.companyName.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Operating City & State *</label>
                                                    <input
                                                        {...register('cityState')}
                                                        placeholder="e.g. Surat, Gujarat"
                                                        className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:bg-white focus:outline-none ${errors.cityState ? 'border-rose-400 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'}`}
                                                    />
                                                    {errors.cityState && <p className="text-[11px] font-medium text-rose-500">{errors.cityState.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Company GSTIN (Optional)</label>
                                                    <input
                                                        {...register('gstin')}
                                                        placeholder="24AAACG1234E1Z6"
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none uppercase"
                                                    />
                                                </div>

                                                <div className="space-y-2 sm:col-span-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Industry Sector</label>
                                                    <select
                                                        {...register('industrySector')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="manufacturing">Manufacturing / Engineering / Auto Parts</option>
                                                        <option value="textiles">Textiles / Weaving / Yarn / Garments</option>
                                                        <option value="chemicals">Chemicals / Pharma / Dyes & Pigments</option>
                                                        <option value="trading">Wholesale Trading / B2B Distribution</option>
                                                        <option value="services">Professional Services / Contracting / EPC</option>
                                                        <option value="ca_firm">Chartered Accountancy Firm</option>
                                                        <option value="other">Other Commercial Enterprise</option>
                                                    </select>
                                                    {errors.industrySector && <p className="text-[11px] font-medium text-rose-500">{errors.industrySector.message}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 3 */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800">3</span>
                                                <h3 className="text-lg font-bold text-slate-900">Current Operations & Volume</h3>
                                            </div>
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Current Software Stack</label>
                                                    <select
                                                        {...register('currentAccountingSoftware')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="tally_prime">TallyPrime (Desktop)</option>
                                                        <option value="tally_erp9">Tally.ERP 9 (Legacy)</option>
                                                        <option value="busy">Busy Accounting</option>
                                                        <option value="zoho">Zoho Books</option>
                                                        <option value="sap">SAP B1 / Microsoft Dynamics</option>
                                                        <option value="excel">Manual Excel</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Invoice Intake Method</label>
                                                    <select
                                                        {...register('invoiceIntakeMethod')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="whatsapp_and_paper">WhatsApp & Paper Bills (Mixed)</option>
                                                        <option value="email_pdf">Email PDF Attachments</option>
                                                        <option value="physical_only">Physical Paper Only</option>
                                                        <option value="vendor_portal">Vendor Portal / Excel Imports</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Monthly Purchase Bills</label>
                                                    <select
                                                        {...register('monthlyInvoiceVolume')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="under_50">Under 50 bills / mo</option>
                                                        <option value="50-200">50 to 200 bills / mo</option>
                                                        <option value="200-500">200 to 500 bills / mo</option>
                                                        <option value="500_plus">500+ bills / mo (High Volume)</option>
                                                    </select>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Approximate Annual Turnover</label>
                                                    <select
                                                        {...register('annualTurnover')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="under_1cr">Under ₹1 Crore</option>
                                                        <option value="1cr_5cr">₹1 Crore to ₹5 Crores</option>
                                                        <option value="5cr_25cr">₹5 Crores to ₹25 Crores</option>
                                                        <option value="25cr_100cr">₹25 Crores to ₹100 Crores</option>
                                                        <option value="above_100cr">Above ₹100 Crores</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECTION 4 */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-800">4</span>
                                                <h3 className="text-lg font-bold text-slate-900">Goals & Additional Context</h3>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Biggest Current Priority *</label>
                                                    <select
                                                        {...register('primaryGoal')}
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none appearance-none"
                                                    >
                                                        <option value="replace_desktop">Replacing single-PC accounting with cloud access</option>
                                                        <option value="stop_duplicate_payments">Preventing duplicate bill payments</option>
                                                        <option value="msme_43bh">Section 43B(h) 45-day MSME payment tracking</option>
                                                        <option value="itc_gstr2b">Eliminating blocked GSTR-2B Input Tax Credit</option>
                                                        <option value="ca_audit_sync">Giving my CA clean, audit-ready books</option>
                                                        <option value="other">Full ERP transition / Other</option>
                                                    </select>
                                                    {errors.primaryGoal && <p className="text-[11px] font-medium text-rose-500">{errors.primaryGoal.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="block text-sm font-semibold text-slate-700">Specific Questions or Infrastructure Notes</label>
                                                    <textarea
                                                        {...register('detailedMessage')}
                                                        rows={4}
                                                        placeholder="e.g. We have 2 factories in Surat and 1 warehouse in Ahmedabad; looking to transition from TallyPrime without losing historical ledger balances..."
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 outline-none resize-y"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SUBMIT BUTTON */}
                                        <div className="pt-6 border-t border-slate-100">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 text-base font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl disabled:opacity-70 disabled:hover:translate-y-0"
                                            >
                                                {isSubmitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <svg className="h-5 w-5 animate-spin text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    <>
                                                        Submit Profile & Request Custom Demo
                                                        <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                            <p className="mt-4 text-center text-xs font-medium text-slate-500">
                                                By submitting, you agree to our strict data privacy policies. A solution architect will contact you within 4 business hours.
                                            </p>
                                        </div>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}