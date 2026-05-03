"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface AdminData {
  stats: {
    total_patients: number;
    active_doctors: number;
    monthly_revenue: number;
    collected: number;
    admin_earnings: number;
    today_sessions: number;
    today_completed: number;
    pending_bookings: number;
  };
  recent_bookings: Array<{
    id: string;
    package_type: string;
    visit_type: string;
    start_date: string;
    scheduled_time: string;
    status: string;
    total_amount: number;
    created_at: string;
    doctors: { users: { name: string } };
    patients: { users: { name: string; phone: string } };
  }>;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:   "badge badge-yellow",
  CONFIRMED: "badge badge-blue",
  COMPLETED: "badge badge-green",
  CANCELLED: "badge badge-red",
  IN_PROGRESS: "badge badge-purple",
};

function KpiCard({ label, value, sub, icon, accent }: { label: string; value: string | number; sub?: string; icon: string; accent?: boolean }) {
  return (
    <div className={accent ? "stat-card-primary" : "stat-card"}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent ? "bg-white/20" : "bg-primary/8"}`}>
        <span className={`material-symbols-outlined text-xl ${accent ? "text-white" : "text-primary"}`}>{icon}</span>
      </div>
      <p className={`text-2xl xl:text-3xl font-bold tracking-tight ${accent ? "text-white" : "text-text-dark"}`}>{value}</p>
      <p className={`text-xs font-semibold mt-0.5 ${accent ? "text-white/70" : "text-text-muted"}`}>{label}</p>
      {sub && <p className={`text-xs mt-1 font-medium ${accent ? "text-white/50" : "text-accent"}`}>{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/admin").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([dash, me]) => {
      if (!dash.success) { router.push("/stafflogin"); return; }
      setData(dash.data);
      if (me.success) setAdminName(me.data.name);
    }).catch(() => router.push("/stafflogin"))
      .finally(() => setLoading(false));
  }, [router]);

  const stats = data?.stats;

  return (
    <PortalLayout role="admin" userName={adminName}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Dashboard</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="stat-card"><div className="skeleton h-20 w-full" /></div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard accent label="Monthly Revenue" value={`₹${((stats?.monthly_revenue ?? 0) / 1000).toFixed(1)}K`} sub={`Collected ₹${((stats?.collected ?? 0) / 1000).toFixed(1)}K · Your share ₹${((stats?.admin_earnings ?? 0) / 1000).toFixed(1)}K`} icon="payments" />
            <KpiCard label="Total Patients" value={stats?.total_patients ?? 0} icon="group" />
            <KpiCard label="Active Doctors" value={stats?.active_doctors ?? 0} icon="stethoscope" />
            <KpiCard label="Pending Bookings" value={stats?.pending_bookings ?? 0} sub={`${stats?.today_sessions ?? 0} sessions today`} icon="pending_actions" />
          </div>

          {/* Today's snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="section-title">Today&apos;s Sessions</p>
                  <p className="section-subtitle">Real-time attendance snapshot</p>
                </div>
                <span className="badge badge-green">{new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Total", value: stats?.today_sessions ?? 0, color: "text-text-dark" },
                  { label: "Completed", value: stats?.today_completed ?? 0, color: "text-green-600" },
                  { label: "Remaining", value: (stats?.today_sessions ?? 0) - (stats?.today_completed ?? 0), color: "text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 bg-background-soft rounded-xl">
                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-text-muted font-medium mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5 flex flex-col justify-between">
              <div>
                <p className="section-title">Quick Links</p>
                <p className="section-subtitle">Jump to common tasks</p>
              </div>
              <div className="space-y-2 mt-4">
                <Link href="/admin/doctors" className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-soft transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <span className="material-symbols-outlined text-primary text-base">stethoscope</span>
                  </div>
                  <span className="text-sm font-semibold text-text-dark">Manage Doctors</span>
                  <span className="material-symbols-outlined text-text-muted text-base ml-auto">chevron_right</span>
                </Link>
                <Link href="/admin/reports" className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-soft transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <span className="material-symbols-outlined text-accent text-base">bar_chart_4_bars</span>
                  </div>
                  <span className="text-sm font-semibold text-text-dark">Monthly Reports</span>
                  <span className="material-symbols-outlined text-text-muted text-base ml-auto">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-grey">
              <div>
                <p className="section-title">Recent Bookings</p>
                <p className="section-subtitle">Latest appointment activity</p>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Package</th>
                    <th>Date &amp; Time</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recent_bookings ?? []).slice(0, 10).map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div>
                          <p className="font-semibold">{b.patients.users.name}</p>
                          <p className="text-xs text-text-muted">{b.patients.users.phone}</p>
                        </div>
                      </td>
                      <td className="font-medium">Dr. {b.doctors.users.name}</td>
                      <td>
                        <span className="text-xs font-medium">
                          {b.package_type === "ONE_DAY" ? "1-Day" : "5-Day"} · {b.visit_type === "CENTER" ? "Center" : "Home"}
                        </span>
                      </td>
                      <td>
                        <p className="text-sm text-text-dark font-medium">{new Date(b.start_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                        {b.scheduled_time && <p className="text-xs text-text-muted">{b.scheduled_time}</p>}
                      </td>
                      <td className="font-bold text-primary">₹{b.total_amount}</td>
                      <td><span className={STATUS_BADGE[b.status] ?? "badge badge-grey"}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-border-grey">
              {(data?.recent_bookings ?? []).slice(0, 6).map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {b.patients.users.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-dark truncate">{b.patients.users.name}</p>
                    <p className="text-xs text-text-muted">Dr. {b.doctors.users.name} · {new Date(b.start_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}{b.scheduled_time ? ` · ${b.scheduled_time}` : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">₹{b.total_amount}</p>
                    <span className={STATUS_BADGE[b.status] ?? "badge badge-grey"}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </PortalLayout>
  );
}
