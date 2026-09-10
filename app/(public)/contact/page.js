'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    phone: '',
    role: 'founder',

    companyName: '',
    gstin: '',
    cityState: '',
    industrySector: 'manufacturing',

    currentAccountingSoftware: 'tally_prime',
    invoiceIntakeMethod: 'whatsapp_and_paper',
    monthlyInvoiceVolume: '50-200',
    annualTurnover: '5cr_25cr',

    primaryGoal: 'replace_desktop',
    detailedMessage: '',
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch("/api/contactform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })


    if (res.ok) {
      return setSubmitted(true)
    } else {
      alert("The form submission failed. Please try later!")
      setFormData({
        fullName: "",
        workEmail: "",
        phone: "",
        role: "founder",
        companyName: "",
        gstin: "",
        cityState: "",
        industrySector: "manufacturing",
        currentAccountingSoftware: "tally_prime",
        invoiceIntakeMethod: "whatsapp_and_paper",
        monthlyInvoiceVolume: "50-200",
        annualTurnover: "5cr_25cr",
        primaryGoal: "replace_desktop",
        detailedMessage: "",
      });
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      { }
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          Business Consultation &amp; System Assessment
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Connect with Crown Ecosystems
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tell us about your business setup. This helps our technical advisory team configure a personalized demonstration tailored to your exact industry and invoice volume.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        { }
        <div className="space-y-5 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Direct Contact &amp; Support</h2>

            <div className="text-xs text-slate-600 space-y-3.5">
              <div>
                <p className="font-semibold text-slate-800">Operational Hub:</p>
                <p className="mt-0.5 text-slate-600">Crown Ecosystems Private Limited</p>
                <p className="text-slate-500">Surat, Gujarat, India</p>
              </div>

              <div>
                <p className="font-semibold text-slate-800">Advisory Desk:</p>
                <p className="mt-0.5 text-slate-600">crownlivingecosystems@gmail.com</p>
              </div>

              <div>
                <p className="font-semibold text-slate-800">Support Hours:</p>
                <p className="mt-0.5 text-slate-500">Monday to Saturday: 9:30 AM – 8:30 PM IST</p>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-[11px] text-emerald-900">
              <strong>Enterprise Guarantee:</strong> Zero spam. Your business data, turnover figures, and contact details are protected under strict NDA protocols.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">Are you an auditing Chartered Accountant?</p>
            <p className="text-[11px] leading-relaxed text-slate-500">
              If you run an audit practice and want complimentary access to client portals, use our dedicated ICAI partner onboarding.
            </p>
            <div className="pt-1">
              <Link
                href="calogin"
                className="text-xs font-semibold text-emerald-800 hover:underline"
              >
                Register as a CA Partner →
              </Link>
            </div>
          </div>
        </div>

        { }
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm lg:col-span-2">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 font-bold text-lg">
                ✓
              </div>
              <h3 className="text-lg font-bold text-slate-900">Assessment Request Received</h3>
              <p className="mx-auto max-w-md text-xs text-slate-500 leading-relaxed">
                Thank you, <strong>{formData.fullName}</strong>. We have logged your organization profile for <strong>{formData.companyName || 'your enterprise'}</strong>. A product specialist will call you with a configured test environment.
              </p>

              { }
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left font-mono text-[11px] text-slate-700 space-y-1.5">
                <div className="font-sans font-bold text-slate-900 border-b border-slate-200 pb-1.5 text-xs">
                  Logged Profile Intelligence:
                </div>
                <div><span className="text-slate-400">Contact:</span> {formData.fullName} ({formData.workEmail}, {formData.phone})</div>
                <div><span className="text-slate-400">Role:</span> {formData.role} | <span className="text-slate-400">City:</span> {formData.cityState}</div>
                <div><span className="text-slate-400">Sector:</span> {formData.industrySector} | <span className="text-slate-400">Turnover:</span> {formData.annualTurnover}</div>
                <div><span className="text-slate-400">Current System:</span> {formData.currentAccountingSoftware} | <span className="text-slate-400">Bill Intake:</span> {formData.invoiceIntakeMethod}</div>
                <div><span className="text-slate-400">Monthly Volume:</span> {formData.monthlyInvoiceVolume} bills/mo</div>
                <div><span className="text-slate-400">Primary Goal:</span> {formData.primaryGoal}</div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Edit Information / Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              { }
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
                  1. Contact &amp; Decision-Maker Details
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="e.g. Rajesh Shah"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Your Role in the Organization *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="founder">Business Owner / Managing Director / Partner</option>
                      <option value="finance_head">CFO / Head of Finance / Accounts Manager</option>
                      <option value="accountant">Internal Senior Accountant / Bookkeeper</option>
                      <option value="ca_auditor">External Chartered Accountant / Tax Auditor</option>
                      <option value="plant_head">Plant Manager / Operations Head</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.workEmail}
                      onChange={(e) => handleChange('workEmail', e.target.value)}
                      placeholder="rajesh@apexengineering.com"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Mobile Number (Calling &amp; WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 98250 00000"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              { }
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
                  2. Organization Profile
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Company / Enterprise Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                      placeholder="e.g. Apex Precision Engineering LLP"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Operating City &amp; State *</label>
                    <input
                      type="text"
                      required
                      value={formData.cityState}
                      onChange={(e) => handleChange('cityState', e.target.value)}
                      placeholder="e.g. Surat, Gujarat"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Industry Sector</label>
                    <select
                      value={formData.industrySector}
                      onChange={(e) => handleChange('industrySector', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="manufacturing">Manufacturing / Engineering / Auto Parts</option>
                      <option value="textiles">Textiles / Weaving / Yarn / Garments</option>
                      <option value="chemicals">Chemicals / Pharma / Dyes &amp; Pigments</option>
                      <option value="trading">Wholesale Trading / B2B Distribution</option>
                      <option value="services">Professional Services / Contracting / EPC</option>
                      <option value="ca_firm">Chartered Accountancy Firm</option>
                      <option value="other">Other Commercial Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Company GSTIN *</label>
                    <input
                      type="text"
                      required
                      value={formData.gstin}
                      onChange={(e) => handleChange('gstin', e.target.value)}
                      placeholder="24AAACG1234E1Z6"
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              { }
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
                  3. Current Operations &amp; Accounting Stack
                </h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Current Accounting Software *</label>
                    <select
                      value={formData.currentAccountingSoftware}
                      onChange={(e) => handleChange('currentAccountingSoftware', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="tally_prime">TallyPrime (Desktop)</option>
                      <option value="tally_erp9">Tally.ERP 9 (Legacy Desktop)</option>
                      <option value="busy">Busy Accounting Software</option>
                      <option value="marg">Marg ERP</option>
                      <option value="zoho">Zoho Books</option>
                      <option value="sap">SAP Business One / Navision</option>
                      <option value="excel">Manual Excel Spreadsheets</option>
                      <option value="other">Other Package</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">How do vendor invoices arrive today?</label>
                    <select
                      value={formData.invoiceIntakeMethod}
                      onChange={(e) => handleChange('invoiceIntakeMethod', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="whatsapp_and_paper">WhatsApp Photos &amp; Paper Invoices (Mixed)</option>
                      <option value="email_pdf">Email PDF Attachments</option>
                      <option value="physical_only">Physical Paper Bills at Gate/Warehouse</option>
                      <option value="vendor_portal">Vendor Portal / Excel Statements</option>
                      <option value="All">All</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Monthly Purchase Invoices Processed</label>
                    <select
                      value={formData.monthlyInvoiceVolume}
                      onChange={(e) => handleChange('monthlyInvoiceVolume', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="under_50">Under 50 bills / month</option>
                      <option value="50-500">50 to 500 bills / month</option>
                      <option value="500-1000">500 to 1000 bills / month</option>
                      <option value="1000-10000">1000 to 10,000 bills / months</option>
                      <option value="500_plus">10000+ bills / month (Heavy Volume)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Approximate Annual Turnover</label>
                    <select
                      value={formData.annualTurnover}
                      onChange={(e) => handleChange('annualTurnover', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="under_1cr">Under ₹1 Crore</option>
                      <option value="1cr_10cr">₹1 Crore to ₹10 Crores</option>
                      <option value="10cr_1000cr">₹10 Crores to ₹1000 Crores (Typical MSME)</option>
                      <option value="1000cr_10,000cr">₹1000 Crores to ₹10,000 Crores</option>
                      <option value="above_10,000cr">Above ₹10,000 Crores (Multi-Branch)</option>
                    </select>
                  </div>
                </div>
              </div>

              { }
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-2">
                  4. Primary Goal &amp; Evaluation Intent
                </h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">What is your biggest current priority?</label>
                    <select
                      value={formData.primaryGoal}
                      onChange={(e) => handleChange('primaryGoal', e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    >
                      <option value="replace_desktop">Replacing single-PC desktop accounting with cloud access</option>
                      <option value="stop_duplicate_payments">Controlling transactions and billing errors</option>
                      <option value="msme_43bh">Section 43B(h) 45-day MSME payment tracking</option>
                      <option value="itc_gstr2b">Eliminating blocked GSTR-2B Input Tax Credit</option>
                      <option value="ca_audit_sync">Giving my Chartered Accountant clean audit-ready books</option>
                      <option value="other">Full operational modernization &amp; ERP upgrade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Additional Context or Specific Questions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.detailedMessage}
                      onChange={(e) => handleChange('detailedMessage', e.target.value)}
                      placeholder="e.g. We have 2 factories in Surat and 1 warehouse in Ahmedabad; looking to transition from TallyPrime without losing historical ledger balances..."
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              { }
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl border border-emerald-600/30 bg-emerald-700 py-3 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
                >
                  Submit Business Profile &amp; Schedule Call with Us
                </button>
                <p className="mt-2 text-center text-[11px] text-slate-400">
                  Our solution desk will review your software profile and reach out within 24 business hours.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Contact
