"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { requestYarn, viewYarn, receiveYarn } from "../../../backend/api/yarn";

export default function YarnPage() {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // --- Form states ---
  const [yarnRequest, setYarnRequest] = useState({
    count: 0,
    content: "",
    spun_type: "",
    bags: 0,
    kgs: 0,
  });

  const [yarnReceived, setYarnReceived] = useState({
    spun_type: "",
    kgs_received: 0,
    bags_recevied: 0,
    received_date: "",
    vendor_id: "",
  });

  const [status, setStatus] = useState("");

  // --- Handle submit ---
  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;

      if (selectedAction === "request") {
        response = await requestYarn(yarnRequest);
      } else if (selectedAction === "view") {
        response = await viewYarn(status || undefined);
      } else if (selectedAction === "receive") {
        response = await receiveYarn(yarnReceived);
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
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">Yarn Management</h1>
      <p className="text-gray-600 mb-10 text-center max-w-2xl">
        Select an action below to manage yarn data.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-6 justify-center mb-10">
        {[
          { id: "request", label: "Request Yarn" },
          { id: "view", label: "View Yarn" },
          { id: "receive", label: "Receive Yarn" },
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

        {selectedAction === "request" && (
          <form onSubmit={handleAction} className="space-y-4">
            {Object.keys(yarnRequest).map((key) => (
              <div key={key}>
                <label className="block text-gray-700 capitalize mb-1">
                  {key.replace("_", " ")}
                </label>
                <input
                  required
                  type={typeof (yarnRequest as any)[key] === "number" ? "number" : "text"}
                  value={(yarnRequest as any)[key]}
                  onChange={(e) =>
                    setYarnRequest({
                      ...yarnRequest,
                      [key]:
                        typeof (yarnRequest as any)[key] === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
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
              {loading ? "Submitting..." : "Request Yarn"}
            </button>
          </form>
        )}

        {selectedAction === "view" && (
          <form onSubmit={handleAction} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Status (Optional)</label>
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                placeholder="e.g., pending, approved"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-sky-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition"
            >
              {loading ? "Fetching..." : "View Yarn"}
            </button>
          </form>
        )}

        {selectedAction === "receive" && (
          <form onSubmit={handleAction} className="space-y-4">
            {Object.keys(yarnReceived).map((key) => (
              <div key={key}>
                <label className="block text-gray-700 capitalize mb-1">
                  {key.replace("_", " ")}
                </label>
                <input
                  required
                  type={
                    key === "received_date"
                      ? "datetime-local"
                      : typeof (yarnReceived as any)[key] === "number"
                      ? "number"
                      : "text"
                  }
                  value={(yarnReceived as any)[key]}
                  onChange={(e) =>
                    setYarnReceived({
                      ...yarnReceived,
                      [key]:
                        typeof (yarnReceived as any)[key] === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
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
              {loading ? "Submitting..." : "Receive Yarn"}
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
