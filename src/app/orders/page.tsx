"use client";
import { motion } from "framer-motion";

export default function OrdersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100"
    >
      <h1 className="text-4xl font-bold text-indigo-700 mb-4">Textile Orders</h1>
      <p className="text-gray-600 text-lg max-w-2xl text-center">
        View all textile orders, track their status, and manage delivery timelines.  
        Later, this will connect to your ordersAPI to fetch order details.
      </p>
    </motion.div>
  );
}
