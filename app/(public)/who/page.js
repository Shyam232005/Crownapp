import React from 'react'
import Link from 'next/link'

const Whopage = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* 1. HEADER */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          Tailored Stakeholder Workspaces
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
         For Whom Crown Ecosystems Built For?
        </h1>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Business owners, internal accounts executives, and external Chartered Accountants often have conflicting priorities. Crown Ecosystems brings all three onto a single, cooperative cloud platform without forcing anyone to change their fundamental responsibilities.
        </p>
      </div>

      {/* 2. PERSONA 1: BUSINESS OWNERS & MANAGING DIRECTORS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Persona 1: Executive Control
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              For MSME Founders, Directors &amp; Business Owners
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Core Value: Peace of Mind &amp; Cash Flow Control</span>
        </div>

        {/* Daily Pain Points vs How We Solve It */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 rounded-xl bg-slate-50 p-5 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              The Founder’s Daily Frustrations
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Signing checks blind:</strong> Approving RTGS transfers or signing checks without knowing if the raw material actually arrived in the factory.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Duplicate payment leaks:</strong> Paying an invoice twice because the supplier sent it on WhatsApp and later submitted a physical bill.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>No remote visibility:</strong> Unable to know upcoming liabilities or bank balance while traveling, meeting clients, or visiting plants.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 rounded-xl bg-emerald-50/50 p-5 border border-emerald-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              How Crown Ecosystems Solves It
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Mobile-First Decision Cards:</strong> Review bills on your smartphone with a verified trust badge showing that delivery and PO rates match.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Duplicate Shield:</strong> The system automatically blocks duplicate invoice numbers from the same vendor.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Clear Cash Outflow:</strong> See total bills ready for payment, bills on hold, and upcoming due dates in one clean dashboard.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Real-Life Workflow for Founders */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h4 className="text-xs font-bold text-slate-800">A Day in the Life of a Crown Ecosystems Founder:</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            You open the app on your phone at 10:00 AM. Three supplier bills are waiting for sign-off. Bill #1 is a regular steel delivery (₹2,12,220); the system displays a green badge: "Matches Order &amp; Delivery". You tap <strong>Approve Payment</strong>. Bill #2 has a price discrepancy (billed ₹450 vs PO ₹410); you tap <strong>Put on Hold</strong> with a quick voice-to-text note for your purchase manager. Total review time: under 2 minutes.
          </p>
        </div>
      </section>

      {/* 3. PERSONA 2: INTERNAL FINANCE & ACCOUNTS EXECUTIVES */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Persona 2: Operations Team
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              For In-House Accountants &amp; Finance Executives
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Core Value: Zero Repetitive Data Entry &amp; Clean Books</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 rounded-xl bg-slate-50 p-5 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              The Accountant's Daily Frustrations
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Typing vouchers all day:</strong> Re-keying identical invoice data, vendor addresses, HSN codes, and tax values line by line.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Caught in the middle:</strong> Facing constant calls from vendors asking for payment status while waiting for the owner to sign paper approval slips.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Manual TDS &amp; GST math:</strong> Calculating TDS u/s 194Q, 194C, or 194J on calculators and manually splitting CGST/SGST.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 rounded-xl bg-emerald-50/50 p-5 border border-emerald-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              How Crown Ecosystems Solves It
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Forgiving Invoice Mapper:</strong> Drop in PDF bills or supplier Excel exports; the engine maps columns and auto-extracts data.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Automatic Tax Calculations:</strong> Built-in tax engines handle GST slab splits and automatically compute statutory TDS deductions.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Automated Voucher Creation:</strong> Approved bills automatically generate balanced purchase vouchers without re-typing.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h4 className="text-xs font-bold text-slate-800">A Day in the Life of an Accounts Executive:</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Instead of spending half your workday typing bills into an offline desktop software, you drag a batch of 15 supplier invoices into Crown Ecosystems. The system highlights 14 clean bills and flags 1 bill with an expired GSTIN. You review the mapped numbers, click "Route to Approvals", and your work is done. You are free to focus on vendor reconciliation and bank management.
          </p>
        </div>
      </section>

      {/* 4. PERSONA 3: CHARTERED ACCOUNTANTS & STATUTORY AUDITORS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Persona 3: Statutory Audit
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
              For Chartered Accountants, CPAs &amp; Tax Auditors
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Core Value: 100% Audit Readiness &amp; Compliance Safety</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2 rounded-xl bg-slate-50 p-5 border border-slate-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
              The Auditor’s Daily Frustrations
            </h3>
            <ul className="text-xs text-slate-600 space-y-2 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Corrupted or delayed backup files:</strong> Waiting until September for clients to send backup files, only to find missing entries and broken balances.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Section 43B(h) compliance traps:</strong> Discovering late payments to micro &amp; small suppliers beyond 45 days, causing severe tax disallowances.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-rose-600 font-bold">✕</span>
                <span><strong>Missing audit trails:</strong> MCA audit log requirements being breached because client software lacks an immutable edit log.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 rounded-xl bg-emerald-50/50 p-5 border border-emerald-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              How Crown Ecosystems Solves It
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 pt-1">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Free Dedicated CA Portal:</strong> Read-only workspace accessible year-round; no waiting for client backup zips.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>Voucher-Level PDF Verification:</strong> Click any journal entry to inspect the original signed tax invoice PDF attached to the record.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span><strong>One-Click Statutory Tax Packs:</strong> Export Trial Balances, Creditors Ageing, and Section 44AB Tax Audit workbooks straight into Excel.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <h4 className="text-xs font-bold text-slate-800">A Day in the Life of an Auditing Chartered Accountant:</h4>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            You log into your CA Auditor Portal in August, weeks ahead of the tax audit deadline. You select your client's unit. The General Ledger is completely balanced. You verify GSTR-2B Input Tax Credit matches with zero discrepancy, check that no MSME dues exceed 45 days, and download the full Section 44AB workbook formatted to ICAI standards. Zero stress, zero last-minute firefighting.
          </p>
        </div>
      </section>

      {/* 5. SUMMARY COLLABORATION BRIDGE */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          A Single Platform Where Everyone Succeeds
        </h2>
        <p className="max-w-2xl mx-auto text-xs leading-relaxed text-slate-600 sm:text-sm">
          The founder gets control over cash, the accounts executive is relieved of manual typing, and the Chartered Accountant receives mathematically balanced, audit-compliant books.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="contact"
            className="rounded-lg border border-emerald-600/30 bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 shadow-sm transition"
          >
            Experience Founder Approvals
          </Link>
          <Link
            href="calogin"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Explore CA Auditor Portal
          </Link>
          <Link
            href="/purchase"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            Check Subscription Plans
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Whopage
