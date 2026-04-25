"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface Report {
  id: string;
  month: string;
  total_revenue: number;
  total_doctor_payout: number;
  total_admin_earnings: number;
  status: "DRAFT" | "LOCKED";
  generated_at: string;
  doctor_breakdown: Array<{ doctor_id: string; name: string; total: number; sessions: number }>;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [locking, setLocking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/reports").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([d, me]) => {
      if (!d.success) { router.push("/stafflogin"); return; }
      setReports(d.data ?? []);
      if (me.success) setAdminName(me.data.name);
    }).catch(() => router.push("/stafflogin"))
      .finally(() => setLoading(false));
  }, [router]);

  const generate = async () => {
    setError("");
    setGenerating(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: selectedMonth }),
    });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) { setError(data.error); return; }
    setReports((prev) => {
      const exists = prev.find((r) => r.id === data.data.id);
      return exists ? prev.map((r) => r.id === data.data.id ? data.data : r) : [data.data, ...prev];
    });
    setExpandedId(data.data.id);
  };

  const lock = async (id: string) => {
    setLocking(id);
    const res = await fetch(`/api/reports/${id}/lock`, { method: "POST" });
    const data = await res.json();
    setLocking(null);
    if (res.ok) setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "LOCKED" } : r));
    else setError(data.error);
  };

  const fmt = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

  return (
    <PortalLayout role="admin" userName={adminName}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Monthly Reports</h1>
          <p className="text-sm text-text-muted mt-0.5">Generate and lock revenue reports</p>
        </div>
      </div>

      {/* Generate Panel */}
      <div className="card p-5 mb-6">
        <p className="text-sm font-bold text-text-dark mb-3">Generate Report</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="input sm:w-48"
          />
          <button onClick={generate} disabled={generating} className="btn-primary">
            {generating
              ? <><span className="material-symbols-outlined text-lg animate-spin">refresh</span>Generating...</>
              : <><span className="material-symbols-outlined text-lg">refresh</span>Generate</>}
          </button>
        </div>
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>{error}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="card p-4"><div className="skeleton h-16 w-full" /></div>)}
        </div>
      ) : reports.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-primary/30 block mb-3">bar_chart_4_bars</span>
          <p className="font-bold text-text-dark mb-1">No reports generated</p>
          <p className="text-sm text-text-muted">Select a month above and click Generate</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-background-soft transition-colors"
                onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
              >
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-text-muted font-medium">Month</p>
                    <p className="font-bold text-text-dark">{r.month}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted font-medium">Revenue</p>
                    <p className="font-bold text-text-dark">{fmt(r.total_revenue)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-text-muted font-medium">Doctor Payout</p>
                    <p className="font-bold text-text-dark">{fmt(r.total_doctor_payout)}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs text-text-muted font-medium">Admin Share</p>
                    <p className="font-bold text-accent">{fmt(r.total_admin_earnings)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge ${r.status === "LOCKED" ? "badge-red" : "badge-yellow"}`}>{r.status}</span>
                  <span className="material-symbols-outlined text-text-muted text-lg">{expandedId === r.id ? "expand_less" : "expand_more"}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === r.id && (
                <div className="border-t border-border-grey px-5 py-4 space-y-5 bg-background-soft/50">
                  {/* Summary grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Revenue", val: r.total_revenue, color: "text-text-dark" },
                      { label: "Doctor Payout (60%)", val: r.total_doctor_payout, color: "text-text-dark" },
                      { label: "Admin Earnings (40%)", val: r.total_admin_earnings, color: "text-accent" },
                    ].map((s) => (
                      <div key={s.label} className="card p-4 text-center">
                        <p className={`text-lg font-bold ${s.color}`}>{fmt(s.val)}</p>
                        <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Doctor breakdown */}
                  {(r.doctor_breakdown ?? []).length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-text-muted uppercase tracking-wide mb-3">Doctor Breakdown</p>
                      <div className="card overflow-hidden">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Doctor</th>
                              <th>Sessions</th>
                              <th>Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {r.doctor_breakdown.map((d) => (
                              <tr key={d.doctor_id}>
                                <td className="font-semibold">{d.name}</td>
                                <td>{d.sessions}</td>
                                <td className="font-bold text-primary">{fmt(d.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {r.status !== "LOCKED" && (
                    <button
                      onClick={() => lock(r.id)}
                      disabled={locking === r.id}
                      className="flex items-center gap-2 text-sm font-bold text-red-600 border-2 border-red-300 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">lock</span>
                      {locking === r.id ? "Locking..." : "Lock Report — No changes after this"}
                    </button>
                  )}
                  {r.status === "LOCKED" && (
                    <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                      <span className="material-symbols-outlined text-base">lock</span>
                      Locked · Cannot be modified
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PortalLayout>
  );
}
