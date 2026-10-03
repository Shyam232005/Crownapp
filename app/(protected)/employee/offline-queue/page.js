"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  WifiOff, Wifi, RefreshCw, AlertCircle, 
  FileText, Clock, Receipt, CheckCircle2, Loader2 
} from "lucide-react";

export default function OfflineQueueUI() {
  const [isOnline, setIsOnline] = useState(false); // Toggle for UI testing
  const [isSyncing, setIsSyncing] = useState(false);
  
  // ✨ FIX: State setup for true zero-state loading
  const [isLoading, setIsLoading] = useState(true);
  const [offlineItems, setOfflineItems] = useState([]);

  // ✨ Mock Initialization (Fetching from LocalStorage/IndexedDB in production)
  useEffect(() => {
    const loadOfflineQueue = async () => {
      setTimeout(() => {
        // True zero-state: Queue is empty on fresh load
        setOfflineItems([]);
        setIsLoading(false);
      }, 800);
    };
    loadOfflineQueue();
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    // Simulate API sync delay pushing local items to backend
    setTimeout(() => {
      setOfflineItems([]);
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <WifiOff className="w-6 h-6 text-amber-500" /> Offline Queue
          </motion.h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            Items saved locally. They will sync automatically when internet is restored.
          </p>
        </div>
        
        {/* Network Toggle (Just for UI testing) */}
        <button 
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isOnline ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {isOnline ? "Network Connected" : "Currently Offline"}
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[300px] flex flex-col">
        {/* Top Status Bar */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-black text-slate-800">
              {isLoading ? "Checking queue..." : offlineItems.length > 0 ? `${offlineItems.length} items pending sync` : "All items synced"}
            </h2>
          </div>
          
          {offlineItems.length > 0 && (
            <button 
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !isOnline 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? "Syncing..." : "Sync Now"}
            </button>
          )}
        </div>

        {/* Queue List */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-600" />
              <p className="text-sm font-bold">Reading local storage...</p>
            </div>
          ) : offlineItems.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center p-8 sm:p-12">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-slate-800 mb-2">Everything is Up to Date</h3>
              <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">
                No offline entries found. Your data is safely stored in the cloud.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {offlineItems.map((item) => (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                    key={item.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/30 transition-all gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{item.desc}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {item.type}
                          </span>
                          <span className="text-xs font-medium text-slate-400">
                            Saved at {item.time}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-slate-100 pt-3 sm:pt-0">
                      {item.amount > 0 && (
                        <p className="text-sm font-black text-slate-900">₹{item.amount}</p>
                      )}
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        <WifiOff className="w-3 h-3" /> Waiting
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}