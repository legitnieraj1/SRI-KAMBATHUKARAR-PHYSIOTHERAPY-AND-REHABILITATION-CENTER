"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface SessionData {
  id: string;
  session_date: string;
  session_number: number;
  status: string;
  bookings: {
    id: string;
    package_type: string;
    visit_type: string;
    scheduled_time: string;
    patients: { id: string; users: { name: string; phone: string } };
  };
  attendance: Array<{ attendance_status: string }>;
  photos: Array<{ id: string }>;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:     "badge badge-yellow",
  IN_PROGRESS: "badge badge-purple",
  COMPLETED:   "badge badge-green",
  CANCELLED:   "badge badge-red",
};

function SessionCard({ s, onCheckin, onComplete, onPhoto, checkLoading, photoLoading, activePhoto }: {
  s: SessionData;
  onCheckin: (id: string, status: "PRESENT" | "ABSENT") => void;
  onComplete: (id: string) => void;
  onPhoto: (id: string) => void;
  checkLoading: string | null;
  photoLoading: boolean;
  activePhoto: string | null;
}) {
  const attended = s.attendance[0];
  return (
    <div className="card p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {s.bookings.patients.users.name[0]}
          </div>
          <div>
            <p className="font-bold text-text-dark">{s.bookings.patients.users.name}</p>
            <p className="text-xs text-text-muted">{s.bookings.patients.users.phone}</p>
          </div>
        </div>
        <span className={STATUS_BADGE[s.status] ?? "badge badge-grey"}>{s.status.replace("_", " ")}</span>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-text-muted mb-4">
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{s.bookings.scheduled_time}</span>
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">{s.bookings.visit_type === "HOME" ? "home" : "business"}</span>{s.bookings.visit_type === "HOME" ? "Home Visit" : "Center Visit"}</span>
        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">tag</span>Session {s.session_number}</span>
        {s.photos.length > 0 && <span className="flex items-center gap-1 text-primary font-medium"><span className="material-symbols-outlined text-sm">photo_camera</span>{s.photos.length} photo(s)</span>}
      </div>

      {s.status === "PENDING" && (
        <div className="flex gap-2">
          <button
            onClick={() => onCheckin(s.id, "PRESENT")}
            disabled={checkLoading === s.id}
            className="btn-primary flex-1 py-2.5"
          >
            <span className="material-symbols-outlined text-base">check</span>
            {checkLoading === s.id ? "Marking..." : "Mark Present"}
          </button>
          <button
            onClick={() => onCheckin(s.id, "ABSENT")}
            disabled={checkLoading === s.id}
            className="btn-secondary w-11 p-0 text-red-500 border-red-200 hover:border-red-400 hover:bg-red-50"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {s.status === "IN_PROGRESS" && (
        <div className="space-y-2">
          {attended && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg ${attended.attendance_status === "PRESENT" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              <span className="material-symbols-outlined text-sm">{attended.attendance_status === "PRESENT" ? "check_circle" : "cancel"}</span>
              {attended.attendance_status === "PRESENT" ? "Patient is present" : "Patient is absent"}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onPhoto(s.id)}
              disabled={photoLoading && activePhoto === s.id}
              className="btn-secondary flex-1 py-2.5 text-primary border-primary/30"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              {photoLoading && activePhoto === s.id ? "Uploading..." : s.photos.length > 0 ? `${s.photos.length} Photo(s)` : "Add Photo"}
            </button>
            <button
              onClick={() => onComplete(s.id)}
              className="btn-primary flex-1 py-2.5"
            >
              <span className="material-symbols-outlined text-base">done_all</span>
              Complete
            </button>
          </div>
          <p className="text-xs text-text-muted text-center">Upload photo before completing</p>
        </div>
      )}

      {s.status === "COMPLETED" && (
        <div className="flex items-center gap-2 text-sm text-green-700 font-semibold bg-green-50 rounded-lg px-3 py-2.5">
          <span className="material-symbols-outlined text-base">verified</span>
          Completed · {s.photos.length} photo(s) on record
        </div>
      )}
    </div>
  );
}

export default function DoctorSchedule() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i - 2);
    return d.toISOString().split("T")[0];
  });

  const loadSessions = (date: string) => {
    setLoading(true);
    fetch(`/api/sessions?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) { router.push("/stafflogin"); return; }
        setSessions(d.data ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me) => {
      if (me.success) setDoctorName(me.data.name);
    });
    loadSessions(selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (d: string) => {
    setSelectedDate(d);
    loadSessions(d);
  };

  const checkin = async (id: string, status: "PRESENT" | "ABSENT") => {
    setCheckLoading(id);
    const res = await fetch(`/api/sessions/${id}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attendance_status: status }),
    });
    if (res.ok) {
      setSessions((prev) => prev.map((s) =>
        s.id === id ? { ...s, status: "IN_PROGRESS", attendance: [{ attendance_status: status }] } : s
      ));
    }
    setCheckLoading(null);
  };

  const markComplete = async (id: string) => {
    const res = await fetch(`/api/sessions/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (res.ok) setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: "COMPLETED" } : s));
  };

  const uploadPhoto = async (id: string, file: File) => {
    setPhotoLoading(true);
    const fd = new FormData();
    fd.append("session_id", id);
    fd.append("photo", file);
    const res = await fetch("/api/photos", { method: "POST", body: fd });
    if (res.ok) setSessions((prev) => prev.map((s) => s.id === id ? { ...s, photos: [...s.photos, { id: Date.now().toString() }] } : s));
    setPhotoLoading(false);
  };

  const stats = { total: sessions.length, completed: sessions.filter((s) => s.status === "COMPLETED").length, pending: sessions.filter((s) => s.status === "PENDING").length };

  return (
    <PortalLayout role="doctor" userName={doctorName}>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Today&apos;s Schedule</h1>
        <p className="text-sm text-text-muted mt-0.5">Manage patient sessions and attendance</p>
      </div>

      {/* Date Strip */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1 mb-6">
        {weekDates.map((d) => {
          const date = new Date(d);
          const isToday = d === new Date().toISOString().split("T")[0];
          const isSelected = d === selectedDate;
          return (
            <button
              key={d}
              onClick={() => handleDateChange(d)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-20 lg:w-16 lg:h-22 rounded-2xl cursor-pointer transition-all text-sm ${
                isSelected
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "card hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isSelected ? "text-white/70" : "text-text-muted"}`}>
                {date.toLocaleDateString("en", { weekday: "short" })}
              </span>
              <span className={`text-xl font-bold mt-0.5 ${isSelected ? "text-white" : "text-text-dark"}`}>{date.getDate()}</span>
              {isToday && <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? "bg-white/60" : "bg-primary"}`} />}
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total", value: stats.total, icon: "event", color: "text-text-dark" },
          { label: "Pending", value: stats.pending, icon: "pending", color: "text-amber-600" },
          { label: "Completed", value: stats.completed, icon: "check_circle", color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <span className={`material-symbols-outlined text-xl mb-1 ${s.color}`}>{s.icon}</span>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-text-muted font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sessions */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card p-5"><div className="skeleton h-28 w-full" /></div>)}
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-primary/30 block mb-3">event_busy</span>
          <p className="font-bold text-text-dark mb-1">No sessions scheduled</p>
          <p className="text-sm text-text-muted">No patient sessions on this day</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <SessionCard
              key={s.id}
              s={s}
              onCheckin={checkin}
              onComplete={markComplete}
              onPhoto={(id) => { setActivePhoto(id); fileRef.current?.click(); }}
              checkLoading={checkLoading}
              photoLoading={photoLoading}
              activePhoto={activePhoto}
            />
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && activePhoto) uploadPhoto(activePhoto, file);
          e.target.value = "";
        }}
      />
    </PortalLayout>
  );
}
