"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface Doctor {
  id: string;
  specialization: string;
  license_number: string;
  is_active: boolean;
  users: { id: string; name: string; phone: string; email: string };
}

const BLANK_ADD = { phone: "", name: "", password: "", specialization: "Physiotherapy", license_number: "", email: "" };
const BLANK_EDIT = { name: "", phone: "", email: "", specialization: "", license_number: "", password: "" };

type Modal =
  | { type: "add" }
  | { type: "edit"; doctor: Doctor }
  | { type: "confirm-deactivate"; doctor: Doctor }
  | { type: "confirm-reactivate"; doctor: Doctor }
  | null;

function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const cls = size === "lg"
    ? "w-14 h-14 rounded-2xl text-2xl font-bold"
    : "w-9 h-9 rounded-full text-sm font-bold";
  return (
    <div className={`${cls} bg-primary/10 flex items-center justify-center text-primary shrink-0`}>
      {(name?.[0] ?? "?").toUpperCase()}
    </div>
  );
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Modal>(null);
  const [addForm, setAddForm] = useState(BLANK_ADD);
  const [editForm, setEditForm] = useState(BLANK_EDIT);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadDoctors = useCallback(() => {
    return fetch("/api/doctors?all=true")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDoctors(d.data ?? []); });
  }, []);

  useEffect(() => {
    Promise.all([
      loadDoctors(),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([, me]) => {
      if (me.success) setAdminName(me.data.name);
    }).catch(() => router.push("/stafflogin"))
      .finally(() => setLoading(false));
  }, [router, loadDoctors]);

  const closeModal = () => { setModal(null); setError(""); };

  /* ── Create doctor ── */
  const createDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    const res = await fetch("/api/doctors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addForm),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to create doctor"); return; }
    showToast(`Dr. ${addForm.name} added successfully`);
    setAddForm(BLANK_ADD);
    closeModal();
    loadDoctors();
  };

  /* ── Open edit modal ── */
  const openEdit = (d: Doctor) => {
    setEditForm({
      name: d.users.name,
      phone: d.users.phone,
      email: d.users.email ?? "",
      specialization: d.specialization,
      license_number: d.license_number,
      password: "",
    });
    setError("");
    setModal({ type: "edit", doctor: d });
  };

  /* ── Save edits ── */
  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modal?.type !== "edit") return;
    setError("");
    setActionLoading(true);

    const body: Record<string, string> = {
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email,
      specialization: editForm.specialization,
      license_number: editForm.license_number,
    };
    if (editForm.password) body.password = editForm.password;

    const res = await fetch(`/api/doctors/${modal.doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setActionLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed to update doctor"); return; }
    showToast(`Dr. ${editForm.name} updated successfully`);
    closeModal();
    loadDoctors();
  };

  /* ── Toggle active / deactivate ── */
  const setActive = async (doctor: Doctor, active: boolean) => {
    setActionLoading(true);
    const res = await fetch(`/api/doctors/${doctor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: active }),
    });
    setActionLoading(false);
    if (!res.ok) { showToast("Failed to update status", false); return; }
    showToast(active ? `Dr. ${doctor.users.name} reactivated` : `Dr. ${doctor.users.name} deactivated`);
    closeModal();
    loadDoctors();
  };

  const active = doctors.filter((d) => d.is_active);
  const inactive = doctors.filter((d) => !d.is_active);

  return (
    <PortalLayout role="admin" userName={adminName}>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2 ${toast.ok ? "bg-primary" : "bg-red-500"}`}>
          <span className="material-symbols-outlined text-base">{toast.ok ? "check_circle" : "error"}</span>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Doctors</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <button onClick={() => { setAddForm(BLANK_ADD); setError(""); setModal({ type: "add" }); }} className="btn-primary">
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
          <button onClick={() => setModal({ type: "add" })} className="btn-primary mx-auto">Add First Doctor</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active doctors */}
          {active.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border-grey flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                <p className="text-sm font-bold text-text-dark">Active Doctors</p>
                <span className="ml-auto text-xs text-text-muted font-medium">{active.length} staff</span>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Phone</th>
                      <th>Specialization</th>
                      <th>License</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.map((d) => (
                      <tr key={d.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={d.users.name} />
                            <div>
                              <p className="font-semibold">Dr. {d.users.name}</p>
                              {d.users.email && <p className="text-xs text-text-muted">{d.users.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="text-text-muted">{d.users.phone}</td>
                        <td>{d.specialization}</td>
                        <td className="text-text-muted font-mono text-xs">{d.license_number}</td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(d)}
                              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
                              title="Edit doctor"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => setModal({ type: "confirm-deactivate", doctor: d })}
                              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 text-amber-600 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
                              title="Deactivate doctor"
                            >
                              <span className="material-symbols-outlined text-sm">block</span>
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-border-grey">
                {active.map((d) => (
                  <div key={d.id} className="px-4 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={d.users.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-dark">Dr. {d.users.name}</p>
                        <p className="text-xs text-text-muted">{d.specialization} · {d.users.phone}</p>
                      </div>
                      <span className="badge badge-green shrink-0">Active</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="btn-secondary flex-1 py-2 text-xs gap-1.5">
                        <span className="material-symbols-outlined text-sm">edit</span>Edit
                      </button>
                      <button
                        onClick={() => setModal({ type: "confirm-deactivate", doctor: d })}
                        className="btn-secondary flex-1 py-2 text-xs gap-1.5 text-amber-600 border-amber-200"
                      >
                        <span className="material-symbols-outlined text-sm">block</span>Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inactive doctors */}
          {inactive.length > 0 && (
            <div className="card overflow-hidden opacity-80">
              <div className="px-5 py-3.5 border-b border-border-grey flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-text-muted inline-block" />
                <p className="text-sm font-bold text-text-dark">Inactive / Deactivated</p>
                <span className="ml-auto text-xs text-text-muted font-medium">{inactive.length} staff</span>
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Phone</th>
                      <th>Specialization</th>
                      <th>License</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactive.map((d) => (
                      <tr key={d.id} className="opacity-70">
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={d.users.name} />
                            <div>
                              <p className="font-semibold">Dr. {d.users.name}</p>
                              {d.users.email && <p className="text-xs text-text-muted">{d.users.email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="text-text-muted">{d.users.phone}</td>
                        <td>{d.specialization}</td>
                        <td className="text-text-muted font-mono text-xs">{d.license_number}</td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(d)}
                              className="btn-secondary py-1.5 px-3 text-xs gap-1.5"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              Edit
                            </button>
                            <button
                              onClick={() => setModal({ type: "confirm-reactivate", doctor: d })}
                              className="btn-secondary py-1.5 px-3 text-xs gap-1.5 text-green-700 border-green-200 hover:border-green-400 hover:bg-green-50"
                            >
                              <span className="material-symbols-outlined text-sm">restart_alt</span>
                              Reactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-border-grey">
                {inactive.map((d) => (
                  <div key={d.id} className="px-4 py-4 opacity-70">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={d.users.name} />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-text-dark">Dr. {d.users.name}</p>
                        <p className="text-xs text-text-muted">{d.specialization} · {d.users.phone}</p>
                      </div>
                      <span className="badge badge-red shrink-0">Inactive</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(d)} className="btn-secondary flex-1 py-2 text-xs gap-1.5">
                        <span className="material-symbols-outlined text-sm">edit</span>Edit
                      </button>
                      <button
                        onClick={() => setModal({ type: "confirm-reactivate", doctor: d })}
                        className="btn-secondary flex-1 py-2 text-xs gap-1.5 text-green-700 border-green-200"
                      >
                        <span className="material-symbols-outlined text-sm">restart_alt</span>Reactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────── ADD DOCTOR MODAL ─────────── */}
      {modal?.type === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-grey">
              <div>
                <h3 className="text-base font-bold text-text-dark">Add Doctor</h3>
                <p className="text-xs text-text-muted">Create a new doctor account</p>
              </div>
              <button onClick={closeModal} className="btn-ghost w-8 h-8 p-0 rounded-lg">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={createDoctor} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {([
                { label: "Full Name", key: "name", type: "text", placeholder: "Dr. John Doe", required: true },
                { label: "Mobile Number", key: "phone", type: "tel", placeholder: "9876543210", required: true },
                { label: "Password", key: "password", type: "password", placeholder: "Set login password", required: true },
                { label: "License Number", key: "license_number", type: "text", placeholder: "TN/MCI/12345", required: true },
                { label: "Email (Optional)", key: "email", type: "email", placeholder: "doctor@clinic.com", required: false },
              ] as const).map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">{label}</label>
                  <input
                    type={type}
                    value={addForm[key as keyof typeof addForm]}
                    onChange={(e) => setAddForm((p) => ({ ...p, [key]: e.target.value }))}
                    required={required}
                    className="input"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">Specialization</label>
                <select
                  value={addForm.specialization}
                  onChange={(e) => setAddForm((p) => ({ ...p, specialization: e.target.value }))}
                  className="input"
                >
                  {["Physiotherapy", "Sports Rehabilitation", "Neurological Physiotherapy", "Pediatric Physiotherapy", "Orthopedic Physiotherapy"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>{error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
                  {actionLoading ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────── EDIT DOCTOR MODAL ─────────── */}
      {modal?.type === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-grey">
              <div className="flex items-center gap-3">
                <Avatar name={modal.doctor.users.name} size="lg" />
                <div>
                  <h3 className="text-base font-bold text-text-dark">Edit Doctor</h3>
                  <p className="text-xs text-text-muted">Dr. {modal.doctor.users.name}</p>
                </div>
              </div>
              <button onClick={closeModal} className="btn-ghost w-8 h-8 p-0 rounded-lg">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <form onSubmit={saveEdit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {([
                { label: "Full Name", key: "name", type: "text", placeholder: "Dr. John Doe", required: true },
                { label: "Mobile Number", key: "phone", type: "tel", placeholder: "9876543210", required: true },
                { label: "Email", key: "email", type: "email", placeholder: "doctor@clinic.com", required: false },
                { label: "License Number", key: "license_number", type: "text", placeholder: "TN/MCI/12345", required: true },
              ] as const).map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                    required={required}
                    className="input"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">Specialization</label>
                <select
                  value={editForm.specialization}
                  onChange={(e) => setEditForm((p) => ({ ...p, specialization: e.target.value }))}
                  className="input"
                >
                  {["Physiotherapy", "Sports Rehabilitation", "Neurological Physiotherapy", "Pediatric Physiotherapy", "Orthopedic Physiotherapy"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">
                  New Password <span className="normal-case font-normal opacity-60">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                  className="input"
                  placeholder="Enter new password to change"
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>{error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={actionLoading} className="btn-primary flex-1">
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────── CONFIRM DEACTIVATE ─────────── */}
      {modal?.type === "confirm-deactivate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-amber-500 text-3xl">block</span>
              </div>
              <h3 className="text-base font-bold text-text-dark mb-1">Deactivate Doctor?</h3>
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text-dark">Dr. {modal.doctor.users.name}</span> will no longer appear
                in the booking system and cannot accept new patients.
                All existing session history is preserved.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button
                disabled={actionLoading}
                onClick={() => setActive(modal.doctor, false)}
                className="flex-1 btn-primary bg-amber-500 hover:bg-amber-600 shadow-amber-500/30"
              >
                {actionLoading ? "Processing..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────── CONFIRM REACTIVATE ─────────── */}
      {modal?.type === "confirm-reactivate" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-600 text-3xl">restart_alt</span>
              </div>
              <h3 className="text-base font-bold text-text-dark mb-1">Reactivate Doctor?</h3>
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text-dark">Dr. {modal.doctor.users.name}</span> will be restored
                and can accept new bookings again.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
              <button
                disabled={actionLoading}
                onClick={() => setActive(modal.doctor, true)}
                className="btn-primary flex-1"
              >
                {actionLoading ? "Processing..." : "Reactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
