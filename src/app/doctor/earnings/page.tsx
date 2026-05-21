"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface DoctorEarning {
  month: string;
  sessions_count: number;
  total_revenue: number;
  doctor_share: number;
}

const fmt = (n: number) => `₹${(n ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function DoctorEarningsPage() {
  const router = useRouter();
  const [doctorName, setDoctorName] = useState("Doctor");
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalShare, setTotalShare] = useState(0);
  const [monthlyRows, setMonthlyRows] = useState<DoctorEarning[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/dashboard/doctor").then((r) => r.json()),
    ]).then(([me, dash]) => {
      if (!me.success || !dash.success) { router.push("/stafflogin"); return; }
      setDoctorName(me.data.name);

      // Fetch doctor_earnings from doctor dashboard
      const earnings = dash.data?.earnings ?? {};
      setTotalShare(earnings.total_commission ?? 0);
      setTotalSessions(earnings.total_sessions ?? 0);
      setTotalRevenue(earnings.total_revenue ?? 0);
      setMonthlyRows(earnings.monthly ?? []);
    }).finally(() => setLoading(false));
  }, [router]);

  return (
    <PortalLayout role="doctor" userName={doctorName}>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-text-dark">My Earnings</h1>
        <p className="text-sm text-text-muted mt-0.5">Your 60% revenue share from completed sessions</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="stat-card"><div className="skeleton h-16 w-full" /></div>)}
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="stat-card-primary">
              <span className="material-symbols-outlined text-white text-xl mb-2">payments</span>
              <p className="text-3xl font-bold text-white">{fmt(totalShare)}</p>
              <p className="text-xs text-white/70 font-semibold mt-0.5">Your Total Share (60%)</p>
            </div>
            <div className="stat-card">
              <span className="material-symbols-outlined text-primary text-xl mb-2">event_available</span>
              <p className="text-3xl font-bold text-text-dark">{totalSessions}</p>
              <p className="text-xs text-text-muted font-semibold mt-0.5">Sessions Completed</p>
            </div>
            <div className="stat-card">
              <span className="material-symbols-outlined text-text-muted text-xl mb-2">account_balance</span>
              <p className="text-3xl font-bold text-text-dark">{fmt(totalRevenue)}</p>
              <p className="text-xs text-text-muted font-semibold mt-0.5">Total Revenue Generated</p>
            </div>
          </div>

          {/* Info notice */}
          <div className="card p-4 mb-5 flex items-start gap-3 bg-amber-50 border-amber-200">
            <span className="material-symbols-outlined text-amber-500 text-base mt-0.5 shrink-0">info</span>
            <div className="text-xs text-amber-700">
              <p className="font-semibold mb-0.5">How earnings are calculated</p>
              <p>You receive 60% of each session fee. Center keeps 40%. Amounts shown reflect all completed sessions recorded in the system. Contact admin to settle payouts.</p>
            </div>
          </div>

          {/* Monthly breakdown if available */}
          {monthlyRows.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border-grey">
                <p className="section-title">Monthly Breakdown</p>
                <p className="section-subtitle">From locked monthly reports</p>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Sessions</th>
                      <th>Revenue</th>
                      <th>Your Share (60%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyRows.map((row) => (
                      <tr key={row.month}>
                        <td className="font-semibold">{row.month}</td>
                        <td>{row.sessions_count}</td>
                        <td className="text-text-muted">{fmt(row.total_revenue)}</td>
                        <td><span className="font-bold text-primary">{fmt(row.doctor_share)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {monthlyRows.length === 0 && (
            <div className="card p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-primary/20 block mb-3">bar_chart_4_bars</span>
              <p className="font-bold text-text-dark">No monthly breakdown yet</p>
              <p className="text-sm text-text-muted mt-1">Admin generates monthly reports — your data will appear here once locked</p>
            </div>
          )}
        </>
      )}
    </PortalLayout>
  );
}
