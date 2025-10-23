// "use client";
// import { motion } from "framer-motion";
// import useAuthCheck from "../../../lib/useAuthCheck";

// export default function KnittingPage() {
//   useAuthCheck();
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//       className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-sky-50 to-indigo-100"
//     >
//       <h1 className="text-4xl font-bold text-indigo-700 mb-4">Knitting Department</h1>
//       <p className="text-gray-600 text-lg max-w-2xl text-center">
//         Track yarn usage, fabric production, and ongoing knitting processes.
//         Integrate with your knittingAPI to fetch and update production data.
//       </p>
//     </motion.div>
//   );
// }



"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import useAuthCheck from "../../../lib/useAuthCheck";
import { processKnittingYarn } from "../../../backend/api/process-yarn"; // adjust path if needed
import { downloadPurchaseOrder } from "../../../backend/api/purchase-orders"; // adjust path if needed

export default function KnittingPage() {
  useAuthCheck();

  const [poNumber, setPoNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [message1, setMessage1] = useState<string | null>(null);
  const [message2, setMessage2] = useState<string | null>(null);

  const handleProcessYarn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber || !amount) return setMessage1("Please enter PO number and amount.");

    setLoading(true);
    setMessage1(null);

    try {
      const response = await processKnittingYarn({
        po_number: poNumber,
        amount: Number(amount),
      });
      setMessage1(`✅ Yarn processed successfully for PO #${poNumber}!`);
      console.log(response);
    } catch {
      setMessage1("❌ Error processing yarn. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber) return setMessage2("Please enter PO number to download.");

    setDownloadLoading(true);
    setMessage2(null);
    try {
      const blob = await downloadPurchaseOrder(poNumber);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${poNumber}_PurchaseOrder.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage2(`Purchase Order #${poNumber} downloaded successfully!`);
    } catch {
      setMessage2("Error downloading PO file.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <motion.div
  initial={{ opacity: 0, y: 40 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
  className="min-h-screen flex flex-col items-center bg-gradient-to-br from-white via-sky-50 to-indigo-100 py-16 px-6"
>
  {/* Header Section */}
  <div className="text-center mb-12">
    <h1 className="text-4xl font-extrabold text-indigo-700 mb-3">
      Knitting Department
    </h1>
    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
      Track yarn usage, fabric production, and ongoing knitting processes.
      Integrate with your knitting API to fetch and update production data.
    </p>
  </div>

  {/* --- Process Yarn Card --- */}
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10 mb-12 hover:shadow-indigo-200 transition-shadow duration-300"
  >
    <h2 className="text-2xl font-bold text-indigo-700 mb-8 text-center">
      Process Knitting Yarn
    </h2>

    <form
      onSubmit={handleProcessYarn}
      className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0"
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PO Number
        </label>
        <input
          type="text"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="Enter PO number"
          className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yarn Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter yarn amount"
          className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={loading}
        type="submit"
        className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md transition"
      >
        {loading ? "Processing..." : "Process Yarn"}
      </motion.button>
    </form>

    {message1 && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-6 text-center font-medium ${
          message1.includes("✅") ? "text-green-600" : "text-red-600"
        }`}
      >
        {message1}
      </motion.p>
    )}
  </motion.div>

  {/* --- Download PO Card --- */}
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10 hover:shadow-sky-200 transition-shadow duration-300"
  >
    <h2 className="text-2xl font-bold text-sky-600 mb-8 text-center">
      Download Purchase Order
    </h2>

    <form
      onSubmit={handleDownloadPO}
      className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0"
    >
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PO Number
        </label>
        <input
          type="text"
          value={poNumber}
          onChange={(e) => setPoNumber(e.target.value)}
          placeholder="Enter PO number"
          className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={downloadLoading}
        type="submit"
        className="w-full md:w-auto px-8 py-3 bg-sky-500 text-white font-semibold rounded-xl hover:bg-sky-600 shadow-md transition"
      >
        {downloadLoading ? "Downloading..." : "Download PO"}
      </motion.button>
    </form>

    {message2 && (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-6 text-center font-medium ${
          message2.includes("📄") ? "text-green-600" : "text-green-600"
        }`}
      >
        {message2}
      </motion.p>
    )}
  </motion.div>

  {/* Footer */}
  <p className="mt-14 text-gray-500 text-sm text-center">
    © {new Date().getFullYear()} Yarn Management System
  </p>
</motion.div>

  );
}
