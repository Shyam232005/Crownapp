"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";
import { Clock, CheckCircle2, LogIn, LogOut, Loader2, Calendar } from "lucide-react";

let socket;

export default function EmployeeAttendance() {
    const [status, setStatus] = useState("loading"); // "loading" | "punched-out" | "punched-in" | "completed"
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        socket = io();

        // Live clock update
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        // Fetch today's attendance status (Mocking logic based on submissions)
        const checkStatus = async () => {
            try {
                // Later: const res = await fetch("/api/submissions");
                setTimeout(() => {
                   // Mock API response logic - true zero state defaults to punched-out
                   setStatus("punched-out"); 
                }, 800);
            } catch (error) {
                console.error(error);
                setStatus("punched-out");
            }
        };

        checkStatus();

        return () => {
            clearInterval(timer);
            if (socket) socket.disconnect();
        };
    }, []);

    const handlePunch = async (actionType) => {
        setIsSubmitting(true);
        try {
            // ✨ FIX: Safe localStorage access for Next.js SSR
            const employeeId = typeof window !== "undefined" ? (localStorage.getItem("fineOpsUserId") || "emp-temp-123") : "emp-temp-123";

            const payload = {
                employeeId,
                type: "Attendance",
                description: `Employee ${actionType} at ${new Date().toLocaleTimeString('en-IN')}`,
                status: "Approved", // Attendance auto-approves for record keeping
            };

            // Later: const res = await fetch("/api/submissions", { method: "POST", body: JSON.stringify(payload) });
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay

            // if (socket) socket.emit("new-submission", payload);
            setStatus(actionType === "Punch In" ? "punched-in" : "completed");
            
        } catch (error) {
            alert("Failed to log attendance. Please try again.");
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