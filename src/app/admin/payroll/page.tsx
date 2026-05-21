"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface DoctorPayroll {
  doctor_id: string;
  name: string;
  phone: string;
  sessions_count: number;
  total_revenue: number;
  doctor_share: number;
  admin_share: number;
}

interface ReportSummary {
  id: string;
  status: string;
  total_sessions: number;
  total_revenue: number;
  total_doctor_payout: number;
  total_admin_share: number;
}

const fmt = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function AdminPayrollPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [doctors, setDoctors] = useState<DoctorPayroll[]>([]);
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [viewMode, setViewMode] = useState<"alltime" | "monthly">("alltime");

  const fetchPayroll = useCallback(async (month: string) => {
    setLoading(true);
    const params = month ? `?month=${month}` : "";
    const res = await fetch(`/api/payroll${params}`);
    const data = await res.json();
    if (!res.ok) { router.push("/stafflogin"); return; }
    setDoctors(data.data?.doctors ?? []);
    setReport(data.data?.report ?? null);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me) => {
      if (me.success) setAdminName(me.data.name);
    });
    fetchPayroll("");
  }, [fetchPayroll]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setViewMode(month ? "monthly" : "alltime");
    fetchPayroll(month);
  };

  const downloadCSV = () => {
    const headers = ["Doctor", "Phone", "Sessions", "Revenue (100%)", "Doctor Share (60%)", "Admin Share (40%)"];
    const rows = doctors.map((d) => [
      `"${d.name}"`, d.phone, d.sessions_count,
      d.total_revenue, d.doctor_share, d.admin_share,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payroll-${selectedMonth || "alltime"}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const totalDoctorShare = doctors.reduce((s, d) => s + d.doctor_share, 0);
  const totalAdminShare  = doctors.reduce((s, d) => s + d.admin_share, 0);
  const totalRevenue     = doctors.reduce((s, d) => s + d.total_revenue, 0);

  return (
    <PortalLayout role="admin" userName={adminName}>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Payroll</h1>
          <p className="text-sm text-text-muted mt-0.5">Doctor earnings — 60% share</p>
        </div>
        <button onClick={downloadCSV} disabled={doctors.length === 0} className="btn-secondary gap-2">
          <span className="material-symbols-outlined text-base">download</span>Export CSV
        </button>
      </div>

      {/* Month filter */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => handleMonthChange("")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${viewMode === "alltime" ? "bg-primary text-white border-primary" : "bg-white border-border-grey text-text-dark hover:border-primary/30"}`}
          >
            All Time
          </button>
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${viewMode === "monthly" ? "bg-primary text-white border-primary" : "bg-white border-border-grey text-text-dark hover:border-primary/30"}`}
          >
            By Month
          </button>
        </div>
        {viewMode === "monthly" && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="input sm:w-48"
          />
        )}
      </div>

      {/* Monthly report status notice */}
      {viewMode === "monthly" && selectedMonth && !loading && !report && (
        <div className="card p-4 mb-5 flex items-center gap-3 bg-amber-50 border-amber-200">
          <span className="material-symbols-outlined text-amber-600">warning</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">No report generated for {selectedMonth}</p>
            <p className="text-xs text-amber-600 mt-0.5">Go to Monthly Reports page and generate a report first to see locked payroll data.</p>
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      {!loading && doctors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="stat-card">
            <span className="material-symbols-outlined text-primary text-xl mb-2">payments</span>
            <p className="text-2xl font-bold text-text-dark">{fmt(totalRevenue)}</p>
            <p className="text-xs text-text-muted font-semibold mt-0.5">Total Revenue</p>
          </div>
          <div className="stat-card">
            <span className="material-symbols-outlined text-green-600 text-xl mb-2">person</span>
            <p className="text-2xl font-bold text-green-700">{fmt(totalDoctorShare)}</p>
            <p className="text-xs text-text-muted font-semibold mt-0.5">Doctors Total (60%)</p>
          </div>
          <div className="stat-card-primary">
            <span className="material-symbols-outlined text-white text-xl mb-2">business</span>
            <p className="text-2xl font-bold text-white">{fmt(totalAdminShare)}</p>
            <p className="text-xs text-white/70 font-semibold mt-0.5">Center Total (40%)</p>
          </div>
        </div>
      )}

      {/* Report status badge */}
      {report && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-text-muted font-medium">Report status:</span>
          <span className={`badge ${report.status === "LOCKED" ? "badge-red" : report.status === "SETTLED" ? "badge-green" : "badge-yellow"}`}>
            {report.status}
          </span>
        </div>
      )}

      {/* Doctor breakdown table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 w-full" />)}
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-primary/20 block mb-3">stethoscope</span>
            <p className="font-bold text-text-dark">No payroll data</p>
            <p className="text-sm text-text-muted mt-1">
              {viewMode === "monthly" ? "Generate a monthly report first" : "No completed sessions yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Sessions</th>
                    <th>Revenue (100%)</th>
                    <th>
                      <span className="text-green-700">Doctor Share (60%)</span>
                    </th>
                    <th>
                      <span className="text-accent">Center Share (40%)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d) => (
                    <tr key={d.doctor_id}>
                      <td>
                        <p className="font-semibold text-text-dark">{d.name}</p>
                        <p className="text-xs text-text-muted">{d.phone}</p>
                      </td>
                      <td className="font-medium">{d.sessions_count}</td>
                      <td className="font-semibold text-text-dark">{fmt(d.total_revenue)}</td>
                      <td>
                        <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg text-sm">{fmt(d.doctor_share)}</span>
                      </td>
                      <td>
                        <span className="font-bold text-accent bg-accent/10 px-2 py-1 rounded-lg text-sm">{fmt(d.admin_share)}</span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-background-soft font-bold border-t-2 border-border-grey">
                    <td>TOTAL</td>
                    <td>{doctors.reduce((s, d) => s + d.sessions_count, 0)}</td>
                    <td>{fmt(totalRevenue)}</td>
                    <td><span className="text-green-700">{fmt(totalDoctorShare)}</span></td>
                    <td><span className="text-accent">{fmt(totalAdminShare)}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-grey">
              {doctors.map((d) => (
                <div key={d.doctor_id} className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-text-dark">{d.name}</p>
                      <p className="text-xs text-text-muted">{d.sessions_count} sessions · {d.phone}</p>
                    </div>
                    <span className="text-sm font-semibold text-text-muted">{fmt(d.total_revenue)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-green-700 font-semibold mb-1">Doctor (60%)</p>
                      <p className="text-lg font-bold text-green-700">{fmt(d.doctor_share)}</p>
                    </div>
                    <div className="bg-accent/10 rounded-xl p-3 text-center">
                      <p className="text-xs text-accent font-semibold mb-1">Center (40%)</p>
                      <p className="text-lg font-bold text-accent">{fmt(d.admin_share)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
