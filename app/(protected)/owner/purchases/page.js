"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, Building2, Receipt, Filter, 
  Loader2, IndianRupee, FileText, Search, ChevronRight 
} from "lucide-react";

export default function PurchasesAndVendors() {
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Bills");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        // Updated to call our new secure Transactions API
        const res = await fetch("/api/owner/transactions?type=PURCHASE");
        if (res.ok) {
          const json = await res.json();
          
          const purchaseData = json.data || [];
          setPurchases(purchaseData);

          // Auto-generate Vendor Directory based on bills
          const vendorMap = {};
          purchaseData.forEach((bill) => {
            const vendorName = bill.metadata?.vendorName;
            if (vendorName) {
              const name = vendorName.trim();
              if (!vendorMap[name]) {
                vendorMap[name] = { 
                  name, 
                  gstin: bill.metadata?.gstin || "Not Provided", 
                  totalVolume: 0, 
                  billCount: 0 
                };
              }
              vendorMap[name].totalVolume += (bill.totalAmount || 0);
              vendorMap[name].billCount += 1;
              
              if (bill.metadata?.gstin && vendorMap[name].gstin === "Not Provided") {
                vendorMap[name].gstin = bill.metadata.gstin;
              }
            }
          });
          
          // Convert object to array and sort by highest volume
          setVendors(Object.values(vendorMap).sort((a, b) => b.totalVolume - a.totalVolume));
        }
      } catch (error) {
        console.error("Failed to fetch purchases:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const stats = {
    totalValue: purchases.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
    totalBills: purchases.length,
    activeVendors: vendors.length
  };

  const filteredPurchases = purchases.filter(p => 
    (p.metadata?.vendorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.metadata?.invoiceNumber || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6 sm:mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" /> Purchases & Vendors
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-xs sm:text-sm font-medium text-slate-500">
            Track your business expenses and supplier directory.
          </motion.p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm shrink-0">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-indigo-500 col-span-2 md:col-span-1">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Purchase Value</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 flex items-center">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 mr-0.5" />
              {stats.totalValue.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5 text-indigo-500" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Bills</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalBills} <span className="text-[10px] sm:text-xs font-medium text-slate-400">invoices</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-emerald-500" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Vendors</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.activeVendors} <span className="text-[10px] sm:text-xs font-medium text-slate-400">parties</span></p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-amber-500" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 border-b border-slate-100 pb-4">
        {["Bills", "Vendors"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
              activeTab === tab ? "text-slate-900" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {activeTab === tab && (
              <motion.div layoutId="purchaseTabIndicator" className="absolute inset-0 bg-slate-100 rounded-xl -z-10" />
            )}
            {tab === "Bills" ? "Purchase Bills" : "Vendor Directory"}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex flex-col gap-3 sm:gap-4 overflow-hidden p-1">
        {isLoading ? (
          <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-sm font-bold">Loading records...</p>
          </div>
        ) : activeTab === "Bills" ? (
          filteredPurchases.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Receipt className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">No Purchase Bills Yet</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                Once employee submits vendor payments and you approve them, they will automatically appear here.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredPurchases.map((item) => (
                <motion.div 
                  layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  key={item._id} 
                  className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between transition-shadow gap-4 md:gap-0"
                >
                  <div className="flex items-start md:items-center gap-4 sm:gap-5">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                      <Receipt className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-slate-900 mb-1">{item.metadata?.vendorName || "Unknown Vendor"}</h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {item.metadata?.invoiceNumber && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Bill: {item.metadata.invoiceNumber}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-400">
                          {new Date(item.transactionDate || item.createdAt).toLocaleDateString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          item.status === 'APPROVED' || item.status === 'EXPORTED' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-0 border-slate-100 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Paid Via {item.metadata?.paymentMode || 'Bank/Cash'}</p>
                      <p className="text-lg font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-0.5" /> {item.totalAmount?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )
        ) : (
          filteredVendors.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm h-64 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">No Active Vendors</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                Your supplier directory builds itself automatically as purchase bills are logged.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredVendors.map((vendor, index) => (
                  <motion.div 
                    layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                    key={vendor.name} 
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <span className="font-black text-slate-400">{vendor.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base font-black text-slate-900">{vendor.name}</h4>
                          <p className="text-[10px] font-bold text-slate-500 mt-0.5">GSTIN: {vendor.gstin}</p>
                        </div>
                      </div>
                      <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md">
                        {vendor.billCount} {vendor.billCount > 1 ? 'Bills' : 'Bill'}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Business</p>
                      <p className="text-sm font-black text-slate-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500" /> {vendor.totalVolume.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        )}
      </div>
    </div>
  );
}