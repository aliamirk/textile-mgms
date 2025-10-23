"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { registerVendor, viewVendor, deleteVendor } from "../../../backend/api/vendor";

export default function VendorPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Form state for register
  const [vendorData, setVendorData] = useState({
    company_name: "",
    broker_name: "",
    contract_type: "",
    contact: "",
    gst_number: "",
    prefix: "",
  });

  // Form state for view/delete
  const [vendorId, setVendorId] = useState("");

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      if (selectedAction === "register") {
        response = await registerVendor(vendorData);
      } else if (selectedAction === "view") {
        response = await viewVendor(vendorId);
      } else if (selectedAction === "delete") {
        response = await deleteVendor(vendorId);
      }

      setResult(response);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex flex-col items-center py-10 px-4 bg-gradient-to-br from-white via-sky-50 to-indigo-100"
    >
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">Vendor Management</h1>
      <p className="text-gray-600 mb-10 text-center max-w-2xl">
        Select an action below to manage vendor data.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-6 justify-center mb-10">
        {[
          { id: "register", label: "Register Vendor" },
          { id: "view", label: "View Vendor" },
          { id: "delete", label: "Delete Vendor" },
        ].map((btn) => (
          <motion.button
            key={btn.id}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setSelectedAction(btn.id);
              setResult(null);
              setError(null);
            }}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 ${
              selectedAction === btn.id
                ? "bg-gradient-to-r from-indigo-500 to-sky-500 text-white"
                : "bg-white border border-gray-200 text-gray-700 hover:shadow-lg"
            }`}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* Dynamic Form */}
      <motion.div
        key={selectedAction}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
      >
        {!selectedAction && (
          <p className="text-gray-500 text-center">Choose an action to continue.</p>
        )}

        {selectedAction === "register" && (
          <form onSubmit={handleAction} className="space-y-4">
            {Object.keys(vendorData).map((key) => (
              <div key={key}>
                <label className="block text-gray-700 capitalize mb-1">
                  {key.replace("_", " ")}
                </label>
                <input
                  required
                  type="text"
                  value={(vendorData as any)[key]}
                  onChange={(e) =>
                    setVendorData({ ...vendorData, [key]: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            >
              {loading ? "Registering..." : "Register Vendor"}
            </button>
          </form>
        )}

        {(selectedAction === "view" || selectedAction === "delete") && (
          <form onSubmit={handleAction} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Vendor ID</label>
              <input
                required
                type="text"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            >
              {loading
                ? selectedAction === "view"
                  ? "Fetching..."
                  : "Deleting..."
                : selectedAction === "view"
                ? "View Vendor"
                : "Delete Vendor"}
            </button>
          </form>
        )}
      </motion.div>

      {/* Feedback */}
      <div className="mt-8 w-full max-w-xl text-center">
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {result && (
          <motion.pre
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg text-left overflow-x-auto mt-4 whitespace-pre-wrap"
          >
            ✅ {JSON.stringify(result, null, 2)}
          </motion.pre>
        )}
      </div>
    </motion.div>
  );
}
