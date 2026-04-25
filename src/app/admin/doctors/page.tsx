"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface Doctor {
  id: string;
  specialization: string;
  license_number: string;
  is_active: boolean;
  users: { id: string; name: string; phone: string; email: string };
}

const BLANK_FORM = { phone: "", name: "", password: "", specialization: "Physiotherapy", license_number: "", email: "" };

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [form, setForm] = useState(BLANK_FORM);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  useEffect(() => {
    Promise.all([
      fetch("/api/doctors").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([d, me]) => {
      if (!d.success) { router.push("/stafflogin"); return; }
      setDoctors(d.data ?? []);
      if (me.success) setAdminName(me.data.name);
    }).catch(() => router.push("/stafflogin"))
      .finally(() => setLoading(false));
  }, [router]);

  const createDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) { setError(data.error); return; }
    showToast(`Dr. ${form.name} added successfully`);
    setShowForm(false);
    setForm(BLANK_FORM);
    fetch("/api/doctors").then((r) => r.json()).then((d) => setDoctors(d.data ?? []));
  };

  return (
    <PortalLayout role="admin" userName={adminName}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[100] bg-primary text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-base">check_circle</span>{toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Doctors</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage physiotherapy staff</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <span className="material-symbols-outlined text-lg">add</span>
          <span className="hidden sm:inline">Add Doctor</span>
        </button>
      </div>

      {loading ? (
        <div className="card p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 w-full" />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">stethoscope</span>
          </div>
          <p className="text-base font-bold text-text-dark mb-1">No doctors yet</p>
          <p className="text-sm text-text-muted mb-5">Add your first physiotherapist to get started</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mx-auto">Add First Doctor</button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-hidden hidden lg:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Phone</th>
                  <th>Specialization</th>
                  <th>License</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {d.users.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold">Dr. {d.users.name}</p>
                          {d.users.email && <p className="text-xs text-text-muted">{d.users.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-text-muted">{d.users.phone}</td>
                    <td>{d.specialization}</td>
                    <td className="text-text-muted font-mono text-xs">{d.license_number}</td>
                    <td><span className={`badge ${d.is_active ? "badge-green" : "badge-red"}`}>{d.is_active ? "Active" : "Inactive"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {doctors.map((d) => (
              <div key={d.id} className="card p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {d.users.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-dark">Dr. {d.users.name}</p>
                  <p className="text-xs text-text-muted">{d.specialization} · {d.users.phone}</p>
                  <p className="text-xs text-text-muted font-mono">{d.license_number}</p>
                </div>
                <span className={`badge ${d.is_active ? "badge-green" : "badge-red"} shrink-0`}>{d.is_active ? "Active" : "Inactive"}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Doctor Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-grey">
              <div>
                <h3 className="text-base font-bold text-text-dark">Add Doctor</h3>
                <p className="text-xs text-text-muted">Create a new doctor account</p>
              </div>
              <button onClick={() => { setShowForm(false); setError(""); }} className="btn-ghost w-8 h-8 p-0 rounded-lg">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={createDoctor} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "Dr. John Doe" },
                { label: "Mobile Number", key: "phone", type: "tel", placeholder: "9876543210" },
                { label: "Password", key: "password", type: "password", placeholder: "Set login password" },
                { label: "License Number", key: "license_number", type: "text", placeholder: "TN/MCI/12345" },
                { label: "Email (Optional)", key: "email", type: "email", placeholder: "doctor@clinic.com" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    required={key !== "email"}
                    className="input"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>{error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1">
                  {formLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
