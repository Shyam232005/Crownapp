"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, LogIn, LogOut, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function EmployeeAttendance() {
    const [status, setStatus] = useState("loading"); // "loading" | "punched-out" | "punched-in" | "completed"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        const checkStatus = async () => {
            try {
                // Secure API call: Identity is inferred from the HTTP-only JWT cookie
                const res = await fetch(`/api/attendance`);
                
                if (res.ok) {
                    const data = await res.json();
                    setStatus(data.status); 
                } else {
                    setStatus("punched-out");
                }
            } catch (error) {
                console.error("Failed to fetch attendance:", error);
                setStatus("punched-out");
            }
        };

        checkStatus();

        return () => clearInterval(timer);
    }, []);

    const handlePunch = async (actionType) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading(`${actionType}...`);
        
        try {
            const payload = { actionType };

            const res = await fetch("/api/attendance", { 
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload) 
            });

            if (res.ok) {
                setStatus(actionType === "Punch In" ? "punched-in" : "completed");
                toast.success(`Successfully ${actionType}ed!`, { id: loadingToast });
                try {
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                } catch (e) {}
            } else {
                const err = await res.json();
                throw new Error(err.error || "API failed");
            }
        } catch (error) {
            toast.error(error.message, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-indigo-600" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
                <p className="text-sm font-medium text-slate-500 mt-2 flex items-center justify-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {currentTime.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-12 w-full max-w-md text-center relative overflow-hidden"
            >
                <div className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight mb-8 font-mono">
                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>

                {status === "loading" ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                ) : status === "punched-out" ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handlePunch("Punch In")}
                        disabled={isSubmitting}
                        className="w-full bg-indigo-600 text-white rounded-2xl py-4 sm:py-5 text-lg font-black shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogIn className="w-6 h-6" />}
                        Punch In for the Day
                    </motion.button>
                ) : status === "punched-in" ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handlePunch("Punch Out")}
                        disabled={isSubmitting}
                        className="w-full bg-rose-500 text-white rounded-2xl py-4 sm:py-5 text-lg font-black shadow-lg shadow-rose-200 flex items-center justify-center gap-3 hover:bg-rose-600 transition-colors"
                    >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-6" />}
                        Punch Out & Leave
                    </motion.button>
                ) : (
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <p className="text-lg font-black text-emerald-700">Shift Completed</p>
                        <p className="text-sm font-semibold text-emerald-600 mt-1">Great job today! See you tomorrow.</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}