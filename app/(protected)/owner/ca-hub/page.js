"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, LockKeyhole, FileKey, Send, 
  CheckCircle2, Clock, Link2, Building, Loader2 
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function CAAccessManagement() {
    const [dataRequests, setDataRequests] = useState([]);
    const [sentHistory, setSentHistory] = useState([]);
    const [isApproving, setIsApproving] = useState(false);
    const [pendingFirmRequests, setPendingFirmRequests] = useState([]);
    
    // CA Firm Mapping State
    const [inviteCode, setInviteCode] = useState("");
    const [isLinking, setIsLinking] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [linkedFirm, setLinkedFirm] = useState(null);

    // Initial load of Firm Link status and Data Vault history
    useEffect(() => {
        const fetchHubData = async () => {
            try {
                const res = await fetch("/api/owner/ca-hub");
                if (res.ok) {
                    const data = await res.json();
                    if (data.linkedFirm) setLinkedFirm(data.linkedFirm);
                    
                    // Show month if there are pending approved transactions waiting for the CA to export
                    if (data.pendingExportCount > 0) {
                        setDataRequests([{ 
                            id: "current", 
                            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), 
                            count: data.pendingExportCount 
                        }]);
                    }
                    
                    setSentHistory(data.history || []);
                }

                // Also fetch pending firm access approval requests
                const approvalsRes = await fetch("/api/owner/ca-approvals");
                if (approvalsRes.ok) {
                    const approvalsData = await approvalsRes.json();
                    setPendingFirmRequests(approvalsData.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch hub data:", error);
            }
        };
        fetchHubData();
    }, []);

    const handleApproveFirmRequest = async (request, action) => {
        setIsApproving(true);
        const loadingToast = toast.loading(action === "APPROVE" ? "Approving CA access request..." : "Rejecting CA request...");
        try {
            const res = await fetch("/api/owner/ca-approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    linkId: request.linkId,
                    caFirmId: request.caFirmId,
                    action: action
                })
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Action failed");

            if (action === "APPROVE") {
                setLinkedFirm(request.firmName || "CA Firm");
                try {
                  confetti({ particleCount: 40, spread: 70 });
                } catch (e) {}
                toast.success(`CA access approved for ${request.firmName}!`, { id: loadingToast });
            } else {
                toast.success("CA access request rejected.", { id: loadingToast });
            }

            setPendingFirmRequests(prev => prev.filter(r => r.linkId !== request.linkId));
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsApproving(false);
        }
    };

    const handleApprove = async (request) => {
        setIsApproving(true);
        const loadingToast = toast.loading("Unlocking data vault and syncing with CA...");
        try {
            // Unlocks the database and syncs for the CA
            let res = await fetch("/api/owner/ca-link/sync", {
                method: "POST"
            });

            if (!res.ok) {
                // Fallback to legacy endpoint if needed
                res = await fetch("/api/owner/ca-hub/unlock", {
                    method: "POST"
                });
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || "Failed to unlock vault");
            }

            // Update UI
            setDataRequests((prev) => prev.filter((r) => r.id !== request.id));
            setSentHistory((prev) => [{ ...request, sentAt: new Date().toLocaleTimeString('en-IN') }, ...prev]);
            try {
              confetti({ particleCount: 35, spread: 60 });
            } catch (e) {}
            toast.success(`${request.month} data securely synchronized with your CA!`, { id: loadingToast });
            
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsApproving(false);
        }
    };

    const handleLinkFirm = async (e) => {
        e.preventDefault();
        if (!inviteCode) return;
        
        setIsLinking(true);
        const loadingToast = toast.loading("Verifying CA invite code...");
        try {
            let res = await fetch("/api/owner/ca-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inviteCode: inviteCode.trim() })
            });

            if (!res.ok) {
                // Fallback to legacy route if needed
                res = await fetch("/api/owner/ca-hub/link", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ inviteCode: inviteCode.trim() })
                });
            }
            
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Failed to link CA Firm");
            
            const connectedName = result.data?.firmName || result.firmName || "CA Firm";
            setLinkedFirm(connectedName);
            setInviteCode("");
            toast.success(`Successfully connected to ${connectedName}!`, { id: loadingToast });
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsLinking(false);
        }
    };

    const handleManualSync = async () => {
        setIsSyncing(true);
        const loadingToast = toast.loading("Sending latest financial data to CA Firm...");
        try {
            const res = await fetch("/api/owner/ca-link/sync", {
                method: "POST"
            });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(result.error || "Failed to sync data with CA");

            try {
              confetti({ particleCount: 35, spread: 60 });
            } catch (e) {}

            setSentHistory((prev) => [{
                month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
                sentAt: new Date().toLocaleTimeString('en-IN')
            }, ...prev]);

            toast.success("Data successfully synchronized with CA Firm!", { id: loadingToast });
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto w-full pb-24">
            <div className="mb-8">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" /> CA Data Access Hub
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                    Manage your CA firm mapping and control what data their staff can view.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* CA Firm Mapping Module */}
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden p-6 text-white">
                        <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-indigo-300">
                            <Building className="w-4 h-4" /> Linked CA Firm
                        </h2>
                        
                        {linkedFirm ? (
                            <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-bold text-white">{linkedFirm}</p>
                                    <p className="text-xs font-medium text-emerald-400 flex items-center gap-1 mt-1">
                                        <CheckCircle2 className="w-3 h-3" /> Securely connected
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleManualSync}
                                        disabled={isSyncing}
                                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                                    >
                                        {isSyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                        Send Data to CA
                                    </motion.button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleLinkFirm} className="space-y-4">
                                <p className="text-xs font-medium text-slate-400">
                                    Enter the 6-digit invite code provided by your CA to link your accounts.
                                </p>
                                <div className="flex gap-3">
                                    <input 
                                        type="text" 
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        placeholder="e.g. CA-XYZ789"
                                        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest text-white placeholder:text-slate-600"
                                    />
                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        type="submit"
                                        disabled={isLinking || !inviteCode}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 min-h-[44px] rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                                    >
                                        {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                                        Link Firm
                                    </motion.button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Pending Vault Requests Area */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <LockKeyhole className="w-4 h-4 text-amber-500" /> Pending Access Requests
                        </h2>

                        {pendingFirmRequests.length === 0 && dataRequests.length === 0 ? (
                            <div className="bg-slate-50 rounded-xl p-8 text-center border border-slate-100 border-dashed">
                                <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-bold text-slate-600">Your data is locked & secure.</p>
                                <p className="text-xs font-medium text-slate-400">No pending requests from CA.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {pendingFirmRequests.map((req) => (
                                    <motion.div
                                        layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        key={req.linkId}
                                        className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">New CA Firm</span>
                                                <p className="text-sm font-black text-slate-900">{req.firmName}</p>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500">
                                                {req.email || req.phoneNumber || "Chartered Accountant"} requested access to audit your books.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }} 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleApproveFirmRequest(req, "APPROVE")}
                                                disabled={isApproving}
                                                className="flex items-center justify-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                                            >
                                                {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} 
                                                Approve
                                            </motion.button>
                                            <button
                                                onClick={() => handleApproveFirmRequest(req, "REJECT")}
                                                disabled={isApproving}
                                                className="px-3 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {dataRequests.map((req) => (
                                    <motion.div
                                        layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        key={req.id}
                                        className="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">CA requesting <span className="text-indigo-600">{req.month}</span> Data</p>
                                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {req.count} items ready</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }} 
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleApprove(req)}
                                            disabled={isApproving}
                                            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 min-h-[44px] rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
                                        >
                                            {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} 
                                            Approve & Send
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* History / Sent Data Area */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 h-max">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Data Sent to CA
                    </h2>
                    <div className="space-y-3">
                        {sentHistory.length === 0 ? (
                            <p className="text-sm font-medium text-slate-400 text-center py-10 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                                No data shared yet this session.
                            </p>
                        ) : (
                            sentHistory.map((item, idx) => (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    key={idx} 
                                    className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                            <FileKey className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{item.month || "Historical"} Accounting Data</p>
                                            <p className="text-[10px] font-medium text-slate-500">Access granted at {item.sentAt}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider">Unlocked</span>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}