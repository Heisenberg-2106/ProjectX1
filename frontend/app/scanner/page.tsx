"use client";
import "@/globals.css";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PrescriptionDetail {
  medicine: string;
  days_prescribed: number;
  reason: string;
  alternatives: string[];
  price: string;
}

interface PrescriptionResult {
  extracted_text: string;
  prescription_details: PrescriptionDetail[];
}

export default function Scanner() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post<PrescriptionResult>(
        "http://localhost:5000/scan-prescription",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "X-API-Key": "9a5249d1cab64e8287fb12cc4031bd92",
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      const error = err as AxiosError;
      console.error(error);

      if (error.response) {
        alert(`Upload failed: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        alert("No response from server. Check if backend is running on port 5000.");
      } else {
        alert("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <main className="flex-grow py-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">📄 Prescription OCR Scanner</h1>

            <div className="mb-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-100 file:text-blue-700
                  hover:file:bg-blue-200 transition cursor-pointer"
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleSubmit}
                disabled={loading || !file}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  loading || !file
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-green-500 text-white hover:opacity-90 shadow-lg"
                }`}
              >
                {loading ? "Processing..." : "Scan Prescription"}
              </button>
            </div>

            {result && (
              <div className="mt-10">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">🧠 Extracted Text</h2>
                <pre className="bg-gray-50 p-4 rounded-md text-gray-700 whitespace-pre-wrap border border-gray-200">
                  {result.extracted_text}
                </pre>

                <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">💊 Parsed Medicines</h2>
                <ul className="space-y-4">
                  {result.prescription_details.map((med, i) => (
                    <li key={i} className="p-4 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
                      <div className="text-lg font-semibold text-blue-700">{med.medicine}</div>
                      <div className="text-sm text-gray-700 mb-1">
                        {med.days_prescribed} days — {med.reason}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="block">Alternatives: {med.alternatives.join(", ") || "None"}</span>
                        <span className="block">Price: {med.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
