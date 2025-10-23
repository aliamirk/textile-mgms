"use client";
import { motion } from "framer-motion";
import useAuthCheck from "../../../lib/useAuthCheck";

export default function DyeingPage() {
    useAuthCheck();
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100"
    >
      <h1 className="text-4xl font-bold text-indigo-700 mb-4">Dyeing Department</h1>
      <p className="text-gray-600 text-lg max-w-2xl text-center">
        Manage yarn dyeing operations, monitor color batches, and ensure quality.
        Use your dyeingAPI to track and update dyeing process data in real-time.
      </p>
    </motion.div>
  );
}
