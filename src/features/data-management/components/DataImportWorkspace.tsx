"use client";

import { useRef, useState, useCallback } from "react";
import Papa from "papaparse";
import { autoDetectMapping, FIELD_LABELS, type MappedField } from "@/lib/column-detector";
import { useRouter } from "next/navigation";
import { useChurnStore } from "@/store/churn-store";

const ALL_FIELDS: MappedField[] = [
  "customer_id", "name", "email", "company",
  "last_login_at", "days_inactive", "current_sessions",
  "previous_sessions", "support_complaints", "payment_delay", "ignore",
];

type Step = "idle" | "mapping" | "processing" | "done" | "error";

export default function DataImportWorkspace() {
  const router = useRouter();
  const bumpDataVersion = useChurnStore((s) => s.bumpDataVersion);
  const setCustomers = useChurnStore((s) => s.setCustomers);
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, MappedField>>({});
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = useCallback((f: File) => {
    setFile(f);
    Papa.parse<Record<string, string>>(f, {
      header: true,
      preview: 4,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (res) => {
        const hdrs = res.meta.fields ?? [];
        setHeaders(hdrs);
        setPreview(res.data);
        setMapping(autoDetectMapping(hdrs));
        setStep("mapping");
      },
      error: () => { setErrorMsg("Could not parse CSV."); setStep("error"); },
    });
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const processData = async () => {
    if (!file) return;
    setStep("processing");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("mapping", JSON.stringify(mapping));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setResult({ count: data.count });
      setCustomers([]); // clear stale store so risk table re-fetches from DB
      bumpDataVersion();
      setStep("done");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setStep("error");
    }
  };

  const reset = () => {
    setStep("idle"); setFile(null); setHeaders([]); setPreview([]); setMapping({}); setResult(null); setErrorMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const mappedCount = Object.values(mapping).filter((v) => v !== "ignore").length;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Import Customer Data</h1>
        <p className="text-sm text-gray-500">
          Upload your CSV files to synchronize customer profiles with ChurnGuard AI&apos;s risk engine.
        </p>
      </div>

      {/* ── Step 1: Drop zone ─────────────────────────────────── */}
      {(step === "idle" || step === "error") && (
        <div
          className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors hover:border-blue-400 group cursor-pointer"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Drag and drop your CSV file</h3>
          <p className="text-sm text-gray-500 mb-6">Or click to browse your computer. Maximum file size: 50 MB.</p>
          <button type="button" className="px-8 py-3 bg-[#0a235c] text-white rounded-lg font-bold text-sm hover:bg-[#071944] transition-colors shadow-sm">
            Select CSV File
          </button>
          {step === "error" && <p className="mt-4 text-sm text-red-600">{errorMsg}</p>}
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
        </div>
      )}

      {/* ── Step 2: Column Mapping ────────────────────────────── */}
      {step === "mapping" && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Map Columns</h2>
              <p className="text-xs text-gray-500 mt-0.5">{file?.name} · {headers.length} columns detected</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              {mappedCount} Auto-Mapped
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">CSV Column</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sample Value</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maps To</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {headers.map((header) => {
                  const mapped = mapping[header];
                  const sample = preview[0]?.[header] ?? "";
                  const isMatched = mapped !== "ignore";
                  return (
                    <tr key={header} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{header}</td>
                      <td className="px-6 py-4 font-mono text-[10px] text-gray-400">&quot;{sample}&quot;</td>
                      <td className="px-6 py-4">
                        <div className="relative max-w-[240px]">
                          <select
                            value={mapped}
                            onChange={(e) => setMapping((prev) => ({ ...prev, [header]: e.target.value as MappedField }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          >
                            {ALL_FIELDS.map((f) => (
                              <option key={f} value={f}>{FIELD_LABELS[f]}</option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider ${isMatched ? "text-emerald-700 bg-emerald-50" : "text-gray-500 bg-gray-100"}`}>
                          {isMatched ? "Mapped" : "Ignored"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-4 bg-gray-50/30">
            <button onClick={reset} className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
            <button onClick={processData} className="px-6 py-2.5 bg-[#0a235c] text-white rounded-lg text-sm font-bold shadow-sm hover:bg-[#071944] transition-colors">
              Process Data
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Processing ───────────────────────────────── */}
      {step === "processing" && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex flex-col items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-sm font-bold text-gray-700">Scoring customers…</p>
          <p className="text-xs text-gray-400">Running weighted churn formula on uploaded data</p>
        </div>
      )}

      {/* ── Step 4: Done ─────────────────────────────────────── */}
      {step === "done" && result && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 flex flex-col items-center gap-6 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{result.count} customers scored</h3>
            <p className="text-sm text-gray-500">Risk scores computed and stored. Head to Risk Analysis to review.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="px-5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              Upload Another
            </button>
            <button onClick={() => router.push("/risk-analysis")} className="px-5 py-2.5 bg-[#0a235c] text-white rounded-lg text-sm font-bold hover:bg-[#071944] transition-colors">
              View Risk Analysis →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
