"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { downloadPurchaseOrder } from "../../../backend/api/purchase-orders";
import { receiveOrder } from "../../../backend/api/order";
import { jsPDF } from "jspdf";
import Papa from "papaparse"

interface Label {
  vendor_id: string;
  quality: string;
  printed_woven: string;
  elastic_type: string;
  elastic_vendor_id?: string | null;
  trims?: string[];
  sizes?: string[];
}

interface Order {
  customer_name: string;
  order_number: string;
  bags: number;
  company_order_number: string;
  yarn_count: number;
  content: string;
  spun: string;
  sizes: string[];
  knitting_type: string;
  dyeing_type: string;
  finishing_type: string;
  po_number: string;
  labels?: Label[] | null;
}

export default function PurchaseOrdersPage() {
  const [poNumber, setPoNumber] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [message2, setMessage2] = useState<string | null>(null);

  const [orderData, setOrderData] = useState<Order>({
    customer_name: "",
    order_number: "",
    bags: 0,
    company_order_number: "",
    yarn_count: 0,
    content: "",
    spun: "",
    sizes: [],
    knitting_type: "",
    dyeing_type: "",
    finishing_type: "",
    po_number: "",
    labels: [],
  });

  const [receiveLoading, setReceiveLoading] = useState(false);
  const [message1, setMessage1] = useState<string | null>(null);

  const [labels, setLabels] = useState<Label[]>([
    { vendor_id: "", quality: "", printed_woven: "", elastic_type: "", elastic_vendor_id: "", trims: [], sizes: [] },
  ]);

  const addLabel = () => {
    setLabels((prev) => [
      ...prev,
      { vendor_id: "", quality: "", printed_woven: "", elastic_type: "", elastic_vendor_id: "", trims: [], sizes: [] },
    ]);
  };

  const removeLabel = (index: number) => {
    setLabels((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, field: keyof Label, value: string) => {
    setLabels((prev) => {
      const newLabels = [...prev];
      if (field === "trims" || field === "sizes") {
        newLabels[index][field] = value
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
      } else {
        newLabels[index][field] = value;
      }
      return newLabels;
    });
  };

  // --- Validation ---
  const validateOrder = (): string | null => {
    // Check main order fields (all mandatory)
    const mandatoryFields: (keyof Order)[] = [
      "customer_name",
      "order_number",
      "bags",
      "company_order_number",
      "yarn_count",
      "content",
      "spun",
      "sizes",
      "knitting_type",
      "dyeing_type",
      "finishing_type",
      "po_number",
    ];

    for (const field of mandatoryFields) {
      const value = orderData[field];
      if (
        value === "" ||
        value === 0 ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return `Please fill the mandatory order field: ${field.replaceAll("_", " ")}`;
      }
    }

    // Check labels
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const mandatoryLabelFields: (keyof Label)[] = ["vendor_id", "quality", "printed_woven", "elastic_type"];
      for (const field of mandatoryLabelFields) {
        const value = label[field];
        if (!value || value.toString().trim() === "") {
          return `Please fill mandatory label field "${field}" for label #${i + 1}`;
        }
      }
    }

    return null; // All good
  };

  const handleReceiveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage1(null);

    const error = validateOrder();
    if (error) {
      setMessage1(`❌ ${error}`);
      return;
    }

    setReceiveLoading(true);
    try {
      const payload: Order = {
        ...orderData,
        bags: Number(orderData.bags),
        yarn_count: Number(orderData.yarn_count),
        sizes: orderData.sizes.map((s) => s.trim()).filter((s) => s !== ""),
        labels: labels,
      };

      await receiveOrder(payload);
      setMessage1("✅ Order received successfully!");
      setOrderData({
        customer_name: "",
        order_number: "",
        bags: 0,
        company_order_number: "",
        yarn_count: 0,
        content: "",
        spun: "",
        sizes: [],
        knitting_type: "",
        dyeing_type: "",
        finishing_type: "",
        po_number: "",
        labels: [],
      });
      setLabels([
        { vendor_id: "", quality: "", printed_woven: "", elastic_type: "", elastic_vendor_id: "", trims: [], sizes: [] },
      ]);
    } catch (err) {
      console.error(err);
      setMessage1("❌ Failed to receive order. Check console for details.");
    } finally {
      setReceiveLoading(false);
    }
  };

  
  const handleDownloadPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poNumber) return setMessage2("Please enter PO number to download.");
  
    setDownloadLoading(true);
    setMessage2(null);
  
    try {
      const response = await downloadPurchaseOrder(poNumber);
  
      // --- Type-safe check ---
      let csvData: string;
      if (response && typeof response === "object" && "text" in response && typeof response.text === "function") {
        csvData = await (response as Blob).text();
      } else if (typeof response === "string") {
        csvData = response;
      } else {
        throw new Error("Invalid response from API");
      }
  
      // --- Parse CSV ---
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      const rows = parsed.data as Record<string, string>[];
  
      if (!rows || rows.length === 0) {
        setMessage2("❌ No data found in PO.");
        return;
      }
  
      // --- Generate PDF ---
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const rowHeight = 25;
      const colPadding = 5;
      const headers = Object.keys(rows[0]);
      const colWidth = (pageWidth - 2 * margin) / headers.length;
  
      let currentY = margin;
  
      // --- Header function ---
      const addHeader = () => {
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`Purchase Order #${poNumber}`, margin, currentY);
        currentY += 30;
  
        // Draw table headers
        headers.forEach((header, idx) => {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255);
          doc.setFillColor(50, 50, 150); // dark blue header
          doc.rect(margin + idx * colWidth, currentY, colWidth, rowHeight, "F");
          doc.text(header.toUpperCase(), margin + idx * colWidth + colPadding, currentY + 17);
        });
        currentY += rowHeight;
      };
  
      // --- Footer function ---
      const addFooter = (pageNum: number) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Page ${pageNum}`, pageWidth - margin - 50, pageHeight - 20);
      };
  
      let pageNum = 1;
      addHeader();
  
      // --- Draw table rows ---
      rows.forEach((row, rowIndex) => {
        // Check for page break
        if (currentY + rowHeight > pageHeight - margin) {
          addFooter(pageNum);
          doc.addPage();
          pageNum += 1;
          currentY = margin;
          addHeader();
        }
  
        // Alternating row colors
        if (rowIndex % 2 === 0) {
          doc.setFillColor(230, 230, 250); // light lavender
          headers.forEach((_, idx) => {
            doc.rect(margin + idx * colWidth, currentY, colWidth, rowHeight, "F");
          });
        }
  
        // Draw text
        headers.forEach((header, idx) => {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(11);
          doc.setTextColor(0);
          const text = (row[header] ?? "").toString();
          doc.text(text, margin + idx * colWidth + colPadding, currentY + 17);
          // Draw cell border
          doc.rect(margin + idx * colWidth, currentY, colWidth, rowHeight);
        });
  
        currentY += rowHeight;
      });
  
      // Add footer on last page
      addFooter(pageNum);
  
      // --- Save PDF ---
      doc.save(`${poNumber}_PurchaseOrder.pdf`);
      setMessage2(`📄 Purchase Order #${poNumber} downloaded successfully!`);
    } catch (err) {
      console.error(err);
      setMessage2("❌ Error generating PDF from PO CSV.");
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
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-3">Purchase Orders</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Manage and receive new orders with multiple labels or download existing purchase orders.
        </p>
      </div>

      {/* Receive Order Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10 mb-12 hover:shadow-indigo-200 transition-shadow duration-300"
      >
        <h2 className="text-2xl font-bold text-indigo-700 mb-8 text-center">Receive New Order</h2>

        <form onSubmit={handleReceiveOrder} className="space-y-4">
          {/* Order fields */}
          {Object.entries(orderData)
            .filter(([key]) => key !== "labels")
            .map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replaceAll("_", " ")}
                </label>
                <input
                  type={key === "bags" || key === "yarn_count" ? "number" : "text"}
                  value={key === "sizes" ? (value as string[]).join(", ") : value as string | number}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      [key]:
                        key === "bags" || key === "yarn_count"
                          ? Number(e.target.value)
                          : key === "sizes"
                          ? e.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter((s) => s !== "")
                          : e.target.value,
                    }))
                  }
                  placeholder={`Enter ${key.replaceAll("_", " ")}`}
                  className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            ))}

          {/* Labels */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-indigo-600">Labels</h3>
            {labels.map((label, idx) => (
              <div key={idx} className="border p-4 rounded-xl mb-4 bg-white/70 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    ["vendor_id", "quality", "printed_woven", "elastic_type", "elastic_vendor_id", "trims", "sizes"] as (keyof Label)[]
                  ).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field.replaceAll("_", " ")}
                      </label>
                      <input
                        type="text"
                        value={
                          field === "trims"
                            ? (label.trims?.join(", ") ?? "")
                            : field === "sizes"
                            ? (label.sizes?.join(", ") ?? "")
                            : (label[field] ?? "")
                        }
                        onChange={(e) => updateLabel(idx, field, e.target.value)}
                        placeholder={`Enter ${field.replaceAll("_", " ")}${
                          field === "trims" || field === "sizes" ? " (comma-separated)" : ""
                        }`}
                        className="w-full rounded-xl border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeLabel(idx)}
                  className="mt-2 text-sm text-red-500 hover:underline"
                >
                  Remove Label
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addLabel}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow-md transition"
            >
              + Add Label
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={receiveLoading}
            type="submit"
            className="w-full mt-6 px-8 py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 shadow-md transition"
          >
            {receiveLoading ? "Receiving..." : "Receive Order"}
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

      {/* Download PO Card */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10 hover:shadow-sky-200 transition-shadow duration-300"
      >
        <h2 className="text-2xl font-bold text-sky-600 mb-8 text-center">Download Purchase Order</h2>

        <form
          onSubmit={handleDownloadPO}
          className="flex flex-col md:flex-row md:items-end md:space-x-6 space-y-4 md:space-y-0"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
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
              message2.includes("📄") ? "text-green-600" : "text-red-600"
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
