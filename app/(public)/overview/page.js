import React from 'react'
import Link from 'next/link'

const Overview = () => {
  return (
    <div className="space-y-12 max-w-5xl mx-auto py-4">
      {/* 1. HERO & EXECUTIVE SUMMARY */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          Comprehensive Product Guide
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          What is Crown Ecosystems Done?
        </h1>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Crown Ecosystems is a standalone, cloud-native Financial Operations (FinOps) and Core ERP platform designed specifically for Indian MSMEs. It bridges the gap between daily factory/office operations and statutory accounting, replacing fragile single-computer desktop packages and overly complex foreign software.
        </p>
      </div>

      {/* 2. THE GROUND REALITY: THE MSME ACCOUNTING CRISIS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            The Problem We Solve
          </span>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            Why Indian MSMEs Struggle with Accounting &amp; Cashflow
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
            In most Indian manufacturing, trade, and service businesses, operations and accounting run in total isolation. This creates two major headaches:
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 space-y-3">
            <h3 className="text-sm font-bold text-rose-900">Crisis 1: The "Dirty Data" Cash Leak</h3>
            <p className="text-xs leading-relaxed text-slate-700">
              Vendor bills arrive through WhatsApp photos, skewed PDFs, and driver delivery challans. Because data is manually re-typed into spreadsheets:
            </p>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li>• Invoices get paid twice because bill numbers were typed incorrectly.</li>
              <li>• Vendors bill higher rates than what was agreed on the Purchase Order.</li>
              <li>• Ineligible GST input tax credits (ITC) get claimed, leading to GST notices and 18% penalty interest.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
            <h3 className="text-sm font-bold text-amber-900">Crisis 2: The Desktop Software Bottleneck</h3>
            <p className="text-xs leading-relaxed text-slate-700">
              Accounts departments rely on desktop software installed on a single office PC:
            </p>
            <ul className="text-xs space-y-1.5 text-slate-600">
              <li>• Founders cannot check payables or approve bills when traveling.</li>
              <li>• Data files frequently corrupt during power cuts or Windows updates.</li>
              <li>• External Chartered Accountants only receive data at year-end, causing massive rushes before tax filing deadlines.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. HOW CROWN ECOSYSTEMS WORKS: 4-STEP END-TO-END WORKFLOW */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            How We Works
          </span>
          <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
            From Vendor Invoice to Audit-Ready Ledger in 4 Simple Steps
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Every step is automated to minimize manual data entry while maintaining rigorous accounting checks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Step 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs">
                01
              </span>
              <h3 className="text-sm font-bold text-slate-900">Smart Intake &amp; Forgiving Data Cleansing</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Upload vendor bills Details. The system requireds the vendor name, GSTIN, and invoice number. It automatically verifies that the vendor's GSTIN is active and checks that tax math (CGST + SGST or IGST) adds up correctly.
            </p>
            <div className="rounded border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-600">
              <strong>Owner Benefit:</strong> No more random/manual voucher typing, duplicate bill numbers are caught instantly before booking.
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs">
                02
              </span>
              <h3 className="text-sm font-bold text-slate-900">Automated 3-Way Order &amp; Delivery Matching</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Before any bill is approved, Crown Ecosystems compares three documents: the original <strong>Purchase Order (PO)</strong>, the warehouse <strong>Goods Receipt Note (GRN)</strong>, and the <strong>Vendor's Tax Invoice</strong>. If the vendor billed ₹450 per unit when the PO agreed to ₹410, or billed for 100 units when only 85 arrived, the bill is automatically flagged.
            </p>
            <div className="rounded border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-600">
              <strong>Owner Benefit:</strong> You never overpay for unreceived goods or unauthorized rate increases.
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs">
                03
              </span>
              <h3 className="text-sm font-bold text-slate-900">Founder Mobile Payout Decision Board</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              The business owner or finance head sees clean summary cards on mobile or desktop showing: Vendor Name, Amount to Pay, Due Date, and Trust Badges (e.g., "Matches Order & Delivery"). With one tap, you can <strong>Approve Payment</strong>, <strong>Put on Hold</strong> with a query note, or reject unauthorized requests.
            </p>
            <div className="rounded border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-600">
              <strong>Owner Benefit:</strong> You control company cash flow wherever you are without asking your accountant for paper files.
            </div>
          </div>

          {/* Step 4 */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 font-bold text-xs">
                04
              </span>
              <h3 className="text-sm font-bold text-slate-900">Native Double-Entry Ledger &amp; Live CA Audit</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              The moment a payment is approved, the system immediately generates a balanced double-entry journal entry: Debits the Expense/Asset and Input Tax accounts, and Credits the Vendor (Sundry Creditor) with automatic TDS deductions. Your General Ledger and Trial Balance update in real-time, ready for your CA to review.
            </p>
            <div className="rounded border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-600">
              <strong>CA Benefit:</strong> Total Debits strictly equal Total Credits; full MCA-compliant audit trail with original PDF attachments.
            </div>
          </div>
        </div>
      </section>

      {/* 4. THREE-WAY ARCHITECTURAL COMPARISON */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Comparing Your Software Options
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            How Crown Ecosystems compares to legacy desktop accounting and foreign ERPs.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="p-3">Capability</th>
                <th className="p-3">Legacy Desktop Accounting</th>
                <th className="p-3">Foreign Enterprise ERPs</th>
                <th className="p-3 text-emerald-800 font-bold">Crown Ecosystems</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-900">Platform Access</td>
                <td className="p-3 text-slate-600">Single office PC; no mobile access</td>
                <td className="p-3 text-slate-600">Web/Cloud, but requires complex training</td>
                <td className="p-3 font-semibold text-emerald-800">100% Cloud; mobile-friendly for founders</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Bill Ingestion</td>
                <td className="p-3 text-slate-600">100% manual voucher typing</td>
                <td className="p-3 text-slate-600">Expensive third-party plugin required</td>
                <td className="p-3 font-semibold text-emerald-800">Built-in smart intake from PDFs &amp; CSVs</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Order &amp; Delivery Matching</td>
                <td className="p-3 text-slate-600">Manual paper comparison</td>
                <td className="p-3 text-slate-600">Rigid; requires full-time operator</td>
                <td className="p-3 font-semibold text-emerald-800">Automated 3-way match with rate alerts</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Indian Statutory Rules</td>
                <td className="p-3 text-slate-600">Basic; requires manual GSTR-2B matching</td>
                <td className="p-3 text-slate-600">Poorly configured for Indian GST/TDS</td>
                <td className="p-3 font-semibold text-emerald-800">Native Sec 43B(h), TDS 194Q &amp; 2B ITC match</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Audit Trail (Edit Log)</td>
                <td className="p-3 text-slate-600">Can slow down PC or be disabled</td>
                <td className="p-3 text-slate-600">Complex, costly audit logs</td>
                <td className="p-3 font-semibold text-emerald-800">Built-in immutable MCA-compliant log</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Chartered Accountant Access</td>
                <td className="p-3 text-slate-600">Zip files emailed at year-end</td>
                <td className="p-3 text-slate-600">Requires purchasing extra user licenses</td>
                <td className="p-3 font-semibold text-emerald-800">Free, dedicated read-only CA Audit Portal</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. PRACTICAL IMPACT: A REAL-WORLD EXAMPLE */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
          Real-World Impact
        </span>
        <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
          Example: A ₹12 Crore Turnover Precision Engineering Firm in Gujarat
        </h2>
        <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
          Before adopting Crown Ecosystems, this manufacturer processed roughly 180 supplier invoices each month. The accounts clerk spent 3 hours every day re-entering bills. During year-end audit, their CA discovered ₹3.4 Lakhs in blocked Input Tax Credit because 6 vendors had suspended GSTINs or hadn't filed GSTR-1.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700 font-mono">100%</p>
            <p className="mt-1 text-xs text-slate-600">ITC preserved with live 2B matching</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700 font-mono">0 Bills</p>
            <p className="mt-1 text-xs text-slate-600">Duplicate payments completely eliminated</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700 font-mono">15 Mins</p>
            <p className="mt-1 text-xs text-slate-600">Daily founder payment review time</p>
          </div>
        </div>
      </section>

      {/* 6. NEXT STEPS & CALLS TO ACTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900">See how Crown Ecosystems fits your role</h3>
          <p className="text-xs text-slate-500">Explore tailored workflows for business owners, accounts staff, and CAs.</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/who"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Read Who It's For →
          </Link>
          <Link
            href="/purchase"
            className="rounded-lg border border-emerald-600/30 bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 transition"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Overview
