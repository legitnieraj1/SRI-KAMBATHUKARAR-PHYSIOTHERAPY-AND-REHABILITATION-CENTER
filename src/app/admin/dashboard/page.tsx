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

interface SessionPhoto {
  id: string;
  file_url: string;
  photo_timestamp: string;
  session_date: string;
  session_time: string;
  session_number: number;
  visit_type: string;
  doctor_name: string;
  patient_name: string;
  patient_phone: string;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:     "badge badge-yellow",
  CONFIRMED:   "badge badge-blue",
  COMPLETED:   "badge badge-green",
  CANCELLED:   "badge badge-red",
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

// ── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose }: { photo: SessionPhoto; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1 text-sm">
          <span className="material-symbols-outlined">close</span>Close
        </button>
        <img src={photo.file_url} alt="Session photo" className="w-full rounded-2xl object-contain max-h-[70vh]" />
        <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-white space-y-1">
          <p className="font-bold text-sm">Dr. {photo.doctor_name} → {photo.patient_name}</p>
          <p className="text-xs text-white/70">
            {new Date(photo.session_date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            {" · "}{photo.session_time}
            {" · Session "}{photo.session_number}
            {" · "}{photo.visit_type === "HOME" ? "Home Visit" : "Center Visit"}
          </p>
          <p className="text-xs text-white/50">
            Uploaded {new Date(photo.photo_timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminData | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<SessionPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [lightbox, setLightbox] = useState<SessionPhoto | null>(null);

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

    fetch("/api/admin/photos?limit=30")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPhotos(d.data ?? []); })
      .finally(() => setPhotosLoading(false));
  }, [router]);

  const stats = data?.stats;

  return (
    <PortalLayout role="admin" userName={adminName}>
      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}

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
                  { label: "Total",     value: stats?.today_sessions ?? 0,                                              color: "text-text-dark" },
                  { label: "Completed", value: stats?.today_completed ?? 0,                                             color: "text-green-600" },
                  { label: "Remaining", value: (stats?.today_sessions ?? 0) - (stats?.today_completed ?? 0),            color: "text-amber-600" },
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

          {/* ── Session Photos Gallery ── */}
          <div className="card overflow-hidden mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-grey">
              <div>
                <p className="section-title flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">photo_library</span>
                  Session Photos
                </p>
                <p className="section-subtitle">Photos uploaded by doctors after each session</p>
              </div>
              {photos.length > 0 && (
                <span className="badge badge-blue">{photos.length} photos</span>
              )}
            </div>

            {photosLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-5">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton aspect-square rounded-xl" />)}
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-primary/20 block mb-2">photo_camera</span>
                <p className="text-sm font-semibold text-text-dark">No photos yet</p>
                <p className="text-xs text-text-muted mt-1">Doctors upload photos after marking sessions complete</p>
              </div>
            ) : (
              <div className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightbox(photo)}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-background-soft border border-border-grey hover:border-primary/30 transition-all hover:shadow-md"
                    >
                      <img
                        src={photo.file_url}
                        alt={`Session photo — ${photo.patient_name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                        <p className="text-white text-[10px] font-bold truncate">{photo.patient_name}</p>
                        <p className="text-white/70 text-[9px] truncate">Dr. {photo.doctor_name}</p>
                      </div>
                      {/* Date badge */}
                      <div className="absolute top-1.5 right-1.5 bg-black/50 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                        <p className="text-white text-[9px] font-semibold">
                          {new Date(photo.session_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Table view below grid */}
                <div className="mt-5 hidden lg:block overflow-x-auto border border-border-grey rounded-xl">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Doctor</th>
                        <th>Patient</th>
                        <th>Session Date &amp; Time</th>
                        <th>Visit</th>
                        <th>Session #</th>
                        <th>Uploaded</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {photos.map((photo) => (
                        <tr key={photo.id}>
                          <td className="font-medium">Dr. {photo.doctor_name}</td>
                          <td>
                            <p className="font-semibold">{photo.patient_name}</p>
                            <p className="text-xs text-text-muted">{photo.patient_phone}</p>
                          </td>
                          <td>
                            <p className="font-medium">{new Date(photo.session_date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                            <p className="text-xs text-text-muted">{photo.session_time}</p>
                          </td>
                          <td>
                            <span className={`badge ${photo.visit_type === "HOME" ? "badge-purple" : "badge-blue"}`}>
                              {photo.visit_type === "HOME" ? "Home" : "Center"}
                            </span>
                          </td>
                          <td className="text-text-muted">#{photo.session_number}</td>
                          <td className="text-xs text-text-muted">
                            {new Date(photo.photo_timestamp).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td>
                            <button onClick={() => setLightbox(photo)} className="btn-ghost py-1 px-2 text-xs">
                              <span className="material-symbols-outlined text-sm">open_in_full</span>View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
