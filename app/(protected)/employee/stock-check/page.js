"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardCheck, Search, AlertCircle, Box, 
  Loader2, Inbox 
} from "lucide-react";
import { toast } from "sonner";

export default function StockCheckUI() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stockItems, setStockItems] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        // We pass ?all=true so the backend knows we want total inventory, not just today's logs
        const res = await fetch("/api/employee/inventory?all=true");
        if (res.ok) {
          const json = await res.json();
          const rawData = json.data || [];

          // Aggregate the entries to calculate current godown totals
          const inventoryMap = {};
          
          rawData.forEach((item) => {
            if (inventoryMap[item.itemName]) {
              inventoryMap[item.itemName].qty += item.quantity;
            } else {
              inventoryMap[item.itemName] = {
                id: item._id || item.itemName, 
                name: item.itemName,
                qty: item.quantity,
                unit: item.unit
              };
            }
          });

          // Convert the map back to an array and determine stock status
          const aggregatedStock = Object.values(inventoryMap).map(item => ({
            ...item,
            status: item.qty > 10 ? 'In Stock' : (item.qty > 0 ? 'Low Stock' : 'Out of Stock')
          }));

          setStockItems(aggregatedStock);
        } else {
            throw new Error("Failed to load inventory");
        }
      } catch (error) {
        console.error("Failed to fetch stock data:", error);
        toast.error("Failed to load real-time stock.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStock();
  }, []);

  const filteredStock = stockItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" /> Stock Check
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Real-time view of available inventory in the godown.
          </p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1 flex flex-col">
          <table className="w-full text-left border-collapse min-w-[600px] flex-1">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name / SKU</th>
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Available Qty</th>
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Unit</th>
                <th className="p-4 sm:p-5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 h-full">
              {isLoading ? (
                <>
                  {[1, 2, 3, 4].map((n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                          <div className="h-4 w-32 bg-slate-100 rounded"></div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-right"><div className="h-4 w-12 bg-slate-100 rounded ml-auto"></div></td>
                      <td className="p-4 sm:p-5"><div className="h-4 w-20 bg-slate-100 rounded"></div></td>
                      <td className="p-4 sm:p-5 text-right"><div className="h-6 w-16 bg-slate-100 rounded ml-auto"></div></td>
                    </tr>
                  ))}
                </>
              ) : filteredStock.length > 0 ? (
                <AnimatePresence>
                  {filteredStock.map((item) => (
                    <motion.tr layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 sm:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <Box className="w-4 h-4 text-slate-500" />
                          </div>
                          <p className="font-black text-slate-900 text-sm">{item.name}</p>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <span className="text-base font-black text-slate-900">{item.qty}</span>
                      </td>
                      <td className="p-4 sm:p-5 text-sm font-bold text-slate-500">{item.unit}</td>
                      <td className="p-4 sm:p-5 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}>
                          {item.status !== 'In Stock' && <AlertCircle className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="4" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Inbox className="w-8 h-8 text-slate-400" />
                      </div>
                      <h4 className="text-base font-black text-slate-800 mb-1">
                        {searchQuery ? "No Items Found" : "Inventory is Empty"}
                      </h4>
                      <p className="text-sm font-medium text-slate-500 max-w-sm">
                        {searchQuery 
                          ? `No stock items match your search for "${searchQuery}".` 
                          : "No stock has been added to the inventory yet. Inward stock entries will appear here."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}