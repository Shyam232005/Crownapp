"use client"
import Link from 'next/link'
import React,{useState} from 'react'

const SMain = () => {
    const [activeTab, setActiveTab] = useState('ingestion')
    return (
        <main>
            {/* HERO SECTION */}
            <section id="overview" className="border-b border-slate-200/80 bg-slate-50/50 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                        Global Financial Operations for Growing Businesses, Audit Teams &amp; Sales Teams
                    </div>

                    <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                        Replace Outdated Desktop Ledgers with Crown FinOps &amp; Core ERP
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        No more single-computer access locks, manual data entry, or end-of-quarter auditing scrambles.
                        Crown Ecosystems unifies invoice capture, executive payment approvals, and balanced double-entry accounting in real time intuitive platform.
                    </p>

                    {/* Hero Actions with Light Borders */}
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href=""
                            className="w-full rounded-lg border border-emerald-600/30 bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:border-emerald-600 hover:bg-emerald-800 sm:w-auto"
                        >
                            Gain Free Access for 30 Days
                        </Link>
                        <Link
                            href=""
                            className="w-full rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:w-auto hover:shadow-[0_0_20px_theme(colors.emerald.600)]"
                        >
                            Explore Crown Ecosystems
                        </Link>
                    </div>

                    {/* Core Metrics Ribbon */}
                    <div className="mt-12 grid grid-cols-2 gap-4 border-t border-slate-200/80 pt-8 sm:grid-cols-4">
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900 sm:text-2xl">Debit = Credit</p>
                            <p className="mt-0.5 text-xs text-slate-500">Always-balanced journals</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900 sm:text-2xl">Zero Data Entry</p>
                            <p className="mt-0.5 text-xs text-slate-500">Automated invoice mapping</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900 sm:text-2xl">Direct CA Portal</p>
                            <p className="mt-0.5 text-xs text-slate-500">Read-only audit workspace</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-slate-900 sm:text-2xl">MCA &amp; Tax Ready</p>
                            <p className="mt-0.5 text-xs text-slate-500">Audit trail &amp; GST compliance</p>
                        </div>
                    </div>
                </div>
            </section>
            {/* WHO IT’S FOR: VALUE ACROSS ROLES */}
            <section id="stakeholders" className="border-b border-slate-200/80 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Clear Clarity Across Every Sale</h2>
                        <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            Designed for Business Owners, Sales Workers, and CA Auditors Firms
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            A single system where each stakeholder gets the exact information they need without unnecessary complexity.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-6 md:grid-cols-3">
                        {/* For Business Owners */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">For Business Owners &amp; Directors</div>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">Total Cash Visibility &amp; Control</h3>
                            <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                No more waiting on manual reports to find out bank balances or who needs to be paid.
                            </p>
                            <ul className="mt-4 space-y-2 text-xs text-slate-700">
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Approve bills on the go:</strong> Swipe to approve, hold, or dispute vendor payouts from your phone.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Prevent duplicate payouts:</strong> Instant warnings before paying the same invoice twice.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Real-time cash flow:</strong> Accurate forecasts of upcoming receivables and payables.</span>
                                </li>
                            </ul>
                        </div>

                        {/* For Finance Professionals */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">For Sales &amp; Accounts Staff</div>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">Zero Repetitive Voucher Typing</h3>
                            <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                Free your workday from manual spreadsheet data cleaning and re-entering vendor bills into Dump systems.
                            </p>
                            <ul className="mt-4 space-y-2 text-xs text-slate-700">
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Forgiving bill ingestion:</strong> Upload vendor PDFs or Excel files; items and tax amounts are extracted automatically.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>3-Way Matching:</strong> Link Purchase Orders, Delivery Notes, and Tax Invoices in seconds.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Tax auto-calculation:</strong> Instant separation of GST (CGST/SGST/IGST) and TDS deductions without manual calculations.</span>
                                </li>
                            </ul>
                        </div>

                        {/* For Auditors & CAs */}
                        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">For CAs &amp; CPAs Worldwide</div>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">Audit-Ready Books Every Day</h3>
                            <p className="mt-3 text-xs leading-relaxed text-slate-600">
                                Inspect clean, calculated balanced books with direct links to original bills and supporting documents.
                            </p>
                            <ul className="mt-4 space-y-2 text-xs text-slate-700">
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Double-entry balance:</strong> Automatically enforced Debit = Credit journal vouchers.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>MCA &amp; statutory audit compliance:</strong> Unchangeable edit entries (audit trail) tracking every record change.</span>
                                </li>
                                <li className="flex items-start gap-1.5">
                                    <span className="font-bold text-emerald-700">✓</span>
                                    <span><strong>Instant schedule exports:</strong> Download Trial Balance, Creditors Ageing, and tax reports directly in any document you want.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
            {/* CORE PLATFORM CAPABILITIES */}
            <section id="core-platform" className="border-b border-slate-200/80 bg-slate-50/50 py-16 sm:py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Platform Benefits</h2>
                        <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                            The Pillars of Crown Ecosystems
                        </p>
                        <p className="mt-2 text-sm text-slate-600">
                            End-to-end financial operations from invoices to balance sheet.
                        </p>
                    </div>

                    {/* Feature Tabs with Light Borders */}
                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setActiveTab('ingestion')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm transition ${activeTab === 'ingestion'
                                    ? 'border border-slate-300 bg-slate-900 text-white shadow-sm'
                                    : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                1. Smart Invoice &amp; Approvals
                            </button>
                            <button
                                onClick={() => setActiveTab('ledger')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm transition ${activeTab === 'ledger'
                                    ? 'border border-slate-300 bg-slate-900 text-white shadow-sm'
                                    : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                2. Double-Entry Ledger
                            </button>
                            <button
                                onClick={() => setActiveTab('portal')}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold sm:px-4 sm:text-sm transition ${activeTab === 'portal'
                                    ? 'border border-slate-300 bg-slate-900 text-white shadow-sm'
                                    : 'border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                3. Dedicated CA Audit Portal
                            </button>
                        </div>
                    </div>

                    {/* Tab 1: Smart Intake & Approvals */}
                    {activeTab === 'ingestion' && (
                        <div className="mt-8 grid items-center gap-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-2">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Invoices &amp; Data Hygiene</span>
                                <h3 className="mt-1 text-xl font-bold text-slate-900">Invoice Automations Ingestion &amp; 3-Way Match</h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                    Vendor invoices arrive in various formats: QR scans, WhatsApp, and Excel sheets. Crown Ecosystems cleanses this data on arrival, extracts vendor GSTINs, checks tax rates, and pairs bills with Purchase Orders.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs text-slate-700 sm:text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Auto-Mapping Table:</strong> Ingest unformatted CSVs without restructuring columns by hand.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Tax &amp; ID Verification:</strong> Validates tax IDs (GSTIN/PAN/Tax IDs) and tax arithmetic prior to founder approval.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Mobile Founder Kanban:</strong> Move bills between "Pending Review", "Approved", and "Held for Query" with one touch.
                                    </li>
                                </ul>
                            </div>

                            {/* Practical UI Preview */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-slate-500">
                                    <span>Parsed Invoice: INV-2026-084</span>
                                    <span className="rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">GSTIN Active</span>
                                </div>
                                <div className="mt-3 space-y-2 text-slate-700">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Vendor / Creditor:</span>
                                        <span className="font-semibold text-slate-900">Gujarat Precision Tools Pvt Ltd</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Tax Registration:</span>
                                        <span>24AAACG1234E1Z6</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Taxable Amount:</span>
                                        <span>₹1,50,000.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">CGST (9%) + SGST (9%):</span>
                                        <span>₹13,500.00 + ₹13,500.00</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                                        <span>Total Payable:</span>
                                        <span>₹1,77,000.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Native Double-Entry Ledger */}
                    {activeTab === 'ledger' && (
                        <div className="mt-8 grid items-center gap-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-2">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Core Accounting</span>
                                <h3 className="mt-1 text-xl font-bold text-slate-900">Automated Double-Entry Ledger &amp; Live Trial Balance</h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                    No third-party accounting software required. When a bill is approved, the system immediately generates balanced journal entries in accordance with standard accounting equations.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs text-slate-700 sm:text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Golden Rules Applied:</strong> Automatically debits Expense/Asset and Input Tax accounts, credits Accounts Payable (Sundry Creditor).
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Real-Time Trial Balance:</strong> Continuous verification where Total Debits strictly equal Total Credits.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Drill-Down Capability:</strong> Click any balance to view the General Ledger, Journal Voucher, and original source invoice.
                                    </li>
                                </ul>
                            </div>

                            {/* Practical Ledger Preview */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs">
                                <div className="flex justify-between border-b border-slate-200 pb-2 text-slate-500 font-semibold">
                                    <span>Journal Voucher #JV-2026-0922</span>
                                    <span className="text-emerald-700 font-bold">Auto-Generated</span>
                                </div>
                                <div className="mt-3 space-y-1.5 text-slate-800">
                                    <div className="flex justify-between">
                                        <span>Dr. Machine Spare Parts A/c</span>
                                        <span className="font-semibold">₹1,50,000.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dr. Input CGST A/c</span>
                                        <span className="font-semibold">₹13,500.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Dr. Input SGST A/c</span>
                                        <span className="font-semibold">₹13,500.00</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-1 text-slate-900">
                                        <span className="pl-3">Cr. Gujarat Precision Tools (AP)</span>
                                        <span className="font-semibold">₹1,77,000.00</span>
                                    </div>
                                </div>
                                <div className="mt-3 rounded border border-emerald-300 bg-emerald-100/60 p-2 text-center text-[11px] font-bold text-emerald-900">
                                    Strict Balance: Debit ₹1,77,000.00 = Credit ₹1,77,000.00
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: CA Audit Portal */}
                    {activeTab === 'portal' && (
                        <div id="ca-portal" className="mt-8 grid items-center gap-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-2">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Dedicated Auditor View</span>
                                <h3 className="mt-1 text-xl font-bold text-slate-900">Specialized CA &amp; Auditor Workspace</h3>
                                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                                    Auditors get a dedicated, read-only login. Instead of sorting through boxes of paper receipts or dealing with damaged data backup files, CAs can review vouchers, check vendor filings against tax registries, and export clean audit schedules.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs text-slate-700 sm:text-sm">
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Voucher-Level Traceability:</strong> Click directly into any journal entry to inspect the original invoice PDF and approval stamp.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Statutory Schedule Exports:</strong> Download clean Excel workbooks for Trial Balance, Creditor Ageing, and Tax Audits.
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="font-bold text-emerald-700">✓</span> <strong>Zero Operational Clutter:</strong> Clean, read-only accounting interface keeping client operations and audit reviews neatly separated.
                                    </li>
                                </ul>
                            </div>

                            {/* Practical CA View Preview */}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="font-semibold text-slate-800">CA Audit Workspace (FY 2026-27)</span>
                                    <span className="rounded border border-slate-300 bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-800">Read-Only</span>
                                </div>
                                <div className="mt-3 space-y-2 text-slate-600">
                                    <div className="flex justify-between">
                                        <span>Total Purchase Vouchers:</span>
                                        <span className="font-semibold text-slate-900">428</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Unbalanced Ledgers:</span>
                                        <span className="font-semibold text-emerald-700">0 (Calculated Balanced)</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Section 43B(h) MSME Dues:</span>
                                        <span className="font-semibold text-emerald-700">All Within 45-Day Term</span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                                        <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50">
                                            Export Trial Balance (.xlsx)
                                        </button>
                                        <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50">
                                            Creditors Ageing Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            {/* CALL TO ACTION */}
            <section id="contact" className="py-16 sm:py-20 text-center">
                <div className="mx-auto max-w-3xl px-4 sm:px-6">
                    <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                        Bringing Business Owners, Sales Teams and Accounting CA onto One Platform
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                        Say goodbye to single-computer desktop accounting software and manual data entry. Experience Crown Ecosystem with auto-generated double-entry ledgering and an audit-ready CA portal.
                    </p>
                    {/* CTA Buttons with Light Borders */}
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href=""
                            className="rounded-lg border border-emerald-600/30 bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-emerald-600 hover:bg-emerald-800"
                        >
                            Get Crown &amp; Gain 30 Days Free Access
                        </Link>
                        <Link
                            href=""
                            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_0_20px_theme(colors.emerald.600)]"
                        >
                            Call Us For More Information
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default SMain
