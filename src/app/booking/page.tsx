"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Doctor {
  id: string;
  specialization: string;
  users: { name: string; phone: string };
}

type Step = "identity" | "doctor" | "package" | "datetime" | "confirm" | "success";
type PackageType = "ONE_DAY" | "FIVE_DAY";
type VisitType = "CENTER" | "HOME";

interface Address {
  door: string;
  area: string;
  city: string;
  pincode: string;
}

const STEPS: { key: Exclude<Step, "success">; label: string }[] = [
  { key: "identity", label: "Your Info" },
  { key: "doctor", label: "Doctor" },
  { key: "package", label: "Package" },
  { key: "datetime", label: "Schedule" },
  { key: "confirm", label: "Confirm" },
];

const getAvailableDays = (from: Date, count: number) => {
  const days: string[] = [];
  const d = new Date(from);
  while (days.length < count) {
    if (d.getDay() !== 0) days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
};

// ── Confetti particles ──────────────────────────────────────────────────────
const CONFETTI_PIECES = [
  { color: "#0F766E", x: -100, y: -140, r: 720, size: 10, delay: 0 },
  { color: "#14B8A6", x: 100, y: -130, r: -540, size: 8, delay: 80 },
  { color: "#F59E0B", x: -150, y: -60, r: 360, size: 12, delay: 40 },
  { color: "#F59E0B", x: 150, y: -80, r: -720, size: 6, delay: 120 },
  { color: "#14B8A6", x: -60, y: -160, r: 540, size: 7, delay: 60 },
  { color: "#0F766E", x: 60, y: -170, r: -360, size: 9, delay: 100 },
  { color: "#FBBF24", x: -180, y: 20, r: 720, size: 8, delay: 20 },
  { color: "#5EEAD4", x: 180, y: 10, r: -540, size: 10, delay: 90 },
  { color: "#0F766E", x: -120, y: 80, r: 360, size: 6, delay: 50 },
  { color: "#F59E0B", x: 120, y: 70, r: -720, size: 11, delay: 130 },
  { color: "#14B8A6", x: 30, y: 150, r: 540, size: 8, delay: 70 },
  { color: "#FBBF24", x: -30, y: 160, r: -360, size: 7, delay: 110 },
];

function ConfettiPiece({ color, x, y, r, size, delay }: typeof CONFETTI_PIECES[0]) {
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFired(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        borderRadius: size % 2 === 0 ? "50%" : "2px",
        background: color,
        pointerEvents: "none",
        transition: fired ? "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.8s ease" : "none",
        transform: fired
          ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${r}deg)`
          : `translate(-50%, -50%) rotate(0deg)`,
        opacity: fired ? 0 : 1,
        zIndex: 20,
      }}
    />
  );
}

// ── Premium Success Page ────────────────────────────────────────────────────
function SuccessPage({
  bookingId,
  name,
  phone,
  selectedDoctor,
  selectedDate,
  selectedSlot,
  packageType,
  visitType,
  price,
  sessionCount,
  perSession,
  address,
  notes,
}: {
  bookingId: string;
  name: string;
  phone: string;
  selectedDoctor: Doctor;
  selectedDate: string;
  selectedSlot: string;
  packageType: PackageType;
  visitType: VisitType;
  price: number;
  sessionCount: number;
  perSession: number;
  address: Address;
  notes: string;
}) {
  const [iconVisible, setIconVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setCardVisible(true), 60);
    const t2 = setTimeout(() => setIconVisible(true), 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const dateStr = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

  const rows = [
    { icon: "person", label: "Patient", value: `${name}  ·  +91 ${phone}` },
    { icon: "stethoscope", label: "Doctor", value: `Dr. ${selectedDoctor.users.name} · ${selectedDoctor.specialization}` },
    { icon: visitType === "CENTER" ? "business" : "home", label: "Visit Type", value: visitType === "CENTER" ? "Center Visit — Komarapalayam" : "Home Visit" },
    ...(visitType === "HOME" && address.door ? [{
      icon: "location_on",
      label: "Your Address",
      value: [address.door, address.area, address.city, address.pincode].filter(Boolean).join(", "),
    }] : []),
    { icon: "calendar_today", label: "Date & Time", value: `${dateStr}  ·  ${selectedSlot}` },
    {
      icon: "inventory_2", label: "Package",
      value: `${packageType === "ONE_DAY" ? "1-Day" : "5-Day"} · ₹${perSession}/session × ${sessionCount}`,
    },
    ...(notes ? [{ icon: "notes", label: "Notes", value: notes }] : []),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a4a45] via-[#0F766E] to-[#14B8A6] flex items-center justify-center p-5 relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-white/5 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-black/10 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Confetti origin (behind the check icon area) */}
      <div className="absolute top-1/2 left-1/2 pointer-events-none" style={{ zIndex: 10 }}>
        {CONFETTI_PIECES.map((p, i) => (
          <ConfettiPiece key={i} {...p} />
        ))}
      </div>

      {/* Receipt card */}
      <div
        className="relative z-10 w-full max-w-sm"
        style={{
          transition: "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(48px)",
        }}
      >
        {/* ── Top gradient header ── */}
        <div className="bg-gradient-to-br from-[#0F766E] to-[#14B8A6] rounded-t-3xl px-6 pt-8 pb-12 text-center relative overflow-hidden">
          {/* Subtle shimmer lines */}
          <div className="absolute inset-0 opacity-10" style={{ background: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.3) 20px, rgba(255,255,255,0.3) 21px)" }} />

          {/* Animated check circle */}
          <div
            className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 relative z-10"
            style={{
              transition: "transform 0.5s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.4s ease",
              transform: iconVisible ? "scale(1)" : "scale(0)",
              opacity: iconVisible ? 1 : 0,
            }}
          >
            <span className="material-symbols-outlined text-white text-4xl">check_circle</span>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-white/40"
              style={{
                animation: iconVisible ? "ping 1.5s cubic-bezier(0,0,0.2,1) 0.5s 2" : "none",
              }}
            />
          </div>

          <h2 className="text-2xl font-bold text-white mb-1 relative z-10">Booking Confirmed!</h2>
          <p className="text-white/70 text-sm relative z-10">முன்பதிவு உறுதிப்படுத்தப்பட்டது</p>

          {/* Booking reference pill */}
          <div className="mt-4 inline-flex items-center gap-2.5 bg-black/20 backdrop-blur-md rounded-full px-5 py-2 border border-white/15 relative z-10">
            <span className="text-white/50 text-xs font-medium">REF</span>
            <span className="text-white font-mono font-bold tracking-[0.2em] text-sm">{bookingId.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        {/* ── Ticket tear divider ── */}
        <div className="relative bg-white" style={{ height: 0 }}>
          {/* Left notch */}
          <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#0a4a45] to-[#0F766E] -translate-x-1/2 -translate-y-1/2" />
          {/* Right notch */}
          <div className="absolute right-0 top-0 w-6 h-6 rounded-full bg-gradient-to-br from-[#0F766E] to-[#14B8A6] translate-x-1/2 -translate-y-1/2" />
          {/* Dashed line */}
          <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-gray-200" />
        </div>

        {/* ── Detail rows ── */}
        <div className="bg-white px-6 pt-6 pb-2">
          {rows.map((row, i) => (
            <div key={row.label} className={`flex items-start gap-3 py-3 ${i < rows.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[#0F766E] text-base">{row.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{row.label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5 leading-snug">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Amount bar ── */}
        <div className="bg-teal-50 border-t border-teal-100 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Total Payable</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-gray-400">payments</span>
              Cash at clinic · நேரில் செலுத்தவும்
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#0F766E]">₹{price}</p>
            {sessionCount > 1 && <p className="text-[10px] text-gray-400">₹{perSession} × {sessionCount} sessions</p>}
          </div>
        </div>

        {/* ── Info notice ── */}
        <div className="bg-amber-50 border-t border-amber-100 px-6 py-3 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">info</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            Our team will contact you on <span className="font-bold">+91 {phone}</span> to confirm your appointment. Please arrive 5 mins early.
          </p>
        </div>

        {/* ── Actions ── */}
        <div className="bg-white rounded-b-3xl px-6 pb-6 pt-4 space-y-3 border-t border-gray-100">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary w-full py-3"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Book Another Session
          </button>
          <Link href="/" className="btn-secondary w-full py-3 justify-center flex items-center gap-2">
            <span className="material-symbols-outlined text-base">home</span>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Bottom SKCT branding */}
      <p className="absolute bottom-4 left-0 right-0 text-center text-white/30 text-xs z-10">
        Sri Kambathukarar Physiotherapy &amp; Rehabilitation Center
      </p>
    </div>
  );
}

// ── Main Booking Page ───────────────────────────────────────────────────────
export default function BookingPage() {
  const [step, setStep] = useState<Step>("identity");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<Address>({ door: "", area: "", city: "", pincode: "" });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [packageType, setPackageType] = useState<PackageType>("ONE_DAY");
  const [visitType, setVisitType] = useState<VisitType>("CENTER");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    setDoctorsLoading(true);
    fetch("/api/doctors").then((r) => r.json()).then((d) => setDoctors(d.data ?? [])).finally(() => setDoctorsLoading(false));
    const dates = getAvailableDays(new Date(), 14);
    setAvailableDates(dates);
    setSelectedDate(dates[0]);
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    fetch(`/api/doctors/${selectedDoctor.id}/availability?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => {
        setAvailableSlots(d.data?.available_slots ?? []);
        setBookedSlots(d.data?.booked_slots ?? []);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDoctor, selectedDate]);

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setError("");
    setLoading(true);

    // Build notes — prepend home address when HOME visit
    const addressLines = visitType === "HOME"
      ? `[HOME ADDRESS]\nDoor/Street: ${address.door}\nArea/Landmark: ${address.area || "—"}\nCity: ${address.city} — ${address.pincode}`
      : "";
    const fullNotes = [addressLines, notes].filter(Boolean).join("\n\n");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        doctor_id: selectedDoctor.id,
        package_type: packageType,
        visit_type: visitType,
        start_date: selectedDate,
        scheduled_time: selectedSlot,
        notes: fullNotes || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Booking failed. Please try again."); return; }
    setBookingId(data.data.id);
    setStep("success");
  };

  const stepKeys = STEPS.map((s) => s.key);
  const currentStepIdx = stepKeys.indexOf(step as Exclude<Step, "success">);

  const goBack = () => { if (currentStepIdx > 0) setStep(stepKeys[currentStepIdx - 1]); };
  const goNext = () => {
    setError("");
    if (step === "identity") setStep("doctor");
    else if (step === "doctor") setStep("package");
    else if (step === "package") setStep("datetime");
    else if (step === "datetime") setStep("confirm");
    else if (step === "confirm") confirmBooking();
  };

  const addressIncomplete = visitType === "HOME" && (!address.door.trim() || !address.city.trim() || address.pincode.length < 6);

  const isNextDisabled =
    (step === "identity" && (name.trim().length < 2 || phone.length < 10)) ||
    (step === "doctor" && !selectedDoctor) ||
    (step === "package" && addressIncomplete) ||
    (step === "datetime" && (!selectedDate || !selectedSlot)) ||
    loading;

  const perSession = visitType === "HOME" ? 500 : 100;
  const sessionCount = packageType === "ONE_DAY" ? 1 : 5;
  const price = perSession * sessionCount;

  if (step === "success" && selectedDoctor) {
    return (
      <SuccessPage
        bookingId={bookingId}
        name={name}
        phone={phone}
        selectedDoctor={selectedDoctor}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        packageType={packageType}
        visitType={visitType}
        price={price}
        sessionCount={sessionCount}
        perSession={perSession}
        address={address}
        notes={notes}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background-soft">
      {/* Header */}
      <header className="bg-white border-b border-border-grey sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 p-1">
              <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-primary text-sm leading-none">SKCT Physio</p>
              <p className="text-text-muted text-xs mt-0.5">Book a Session</p>
            </div>
          </div>
          <Link href="/" className="btn-ghost py-2 px-4 text-sm">
            <span className="material-symbols-outlined text-base">arrow_back</span>Home
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-8">
        {/* Step indicator */}
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const isDone = i < currentStepIdx;
              const isActive = i === currentStepIdx;
              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? "bg-accent text-white" : isActive ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-border-grey text-text-muted"}`}>
                      {isDone ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                    </div>
                    <span className={`text-[10px] font-semibold hidden sm:block ${isActive ? "text-primary" : isDone ? "text-accent" : "text-text-muted"}`}>{s.label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${isDone ? "bg-accent" : "bg-border-grey"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">

            {/* Step: Identity */}
            {step === "identity" && (
              <div className="card p-6">
                <h2 className="font-bold text-text-dark mb-0.5 text-lg">Your Details</h2>
                <p className="text-xs text-text-muted mb-6">உங்கள் விவரங்கள் · No account needed</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input"
                      placeholder="e.g. Rajesh Kumar"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">Mobile Number</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">+91</span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="input pl-11"
                        placeholder="9876543210"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-4 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">info</span>
                  We use your number to look up existing bookings — no OTP required.
                </p>
              </div>
            )}

            {/* Step: Doctor */}
            {step === "doctor" && (
              <div className="card p-6">
                <h2 className="font-bold text-text-dark mb-0.5 text-lg">Choose Doctor</h2>
                <p className="text-xs text-text-muted mb-5">மருத்துவரைத் தேர்ந்தெடுக்கவும்</p>
                {doctorsLoading ? (
                  <div className="space-y-3">{[1,2].map((i) => <div key={i} className="skeleton h-20 w-full rounded-xl" />)}</div>
                ) : doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-3xl text-primary/30 block mb-2">person_off</span>
                    <p className="text-sm text-text-muted">No doctors available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {doctors.map((d) => (
                      <button key={d.id} type="button" onClick={() => setSelectedDoctor(d)}
                        className={`w-full text-left rounded-xl border-2 p-4 flex items-center gap-4 transition-all ${selectedDoctor?.id === d.id ? "border-primary bg-primary/5" : "border-border-grey hover:border-primary/40 bg-white"}`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">{d.users.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-text-dark">Dr. {d.users.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">{d.specialization}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedDoctor?.id === d.id ? "bg-primary border-primary" : "border-border-grey"}`}>
                          {selectedDoctor?.id === d.id && <span className="material-symbols-outlined text-white text-sm">check</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Package & Visit */}
            {step === "package" && (
              <div className="space-y-4">
                {/* Visit type */}
                <div className="card p-6">
                  <h2 className="font-bold text-text-dark mb-0.5 text-lg">Visit Type</h2>
                  <p className="text-xs text-text-muted mb-5">பார்வையின் வகையைத் தேர்ந்தெடுக்கவும்</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { type: "CENTER" as VisitType, label: "Center Visit", labelTa: "மையத்தில்", desc: "Visit our Komarapalayam clinic", per: 100, icon: "business" },
                      { type: "HOME" as VisitType, label: "Home Visit", labelTa: "வீட்டிற்கு", desc: "Therapist visits your home", per: 500, icon: "home" },
                    ].map((v) => (
                      <button key={v.type} type="button" onClick={() => setVisitType(v.type)}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${visitType === v.type ? "border-primary bg-primary/5" : "border-border-grey hover:border-primary/40 bg-white"}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`material-symbols-outlined text-2xl ${visitType === v.type ? "text-primary" : "text-text-muted"}`}>{v.icon}</span>
                          <span className={`text-sm font-bold ${visitType === v.type ? "text-primary" : "text-text-muted"}`}>₹{v.per}/session</span>
                        </div>
                        <p className="font-bold text-sm text-text-dark">{v.label}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">{v.labelTa} · {v.desc}</p>
                      </button>
                    ))}
                  </div>

                  {/* Home address fields — revealed when HOME selected */}
                  {visitType === "HOME" && (
                    <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        Your Home Address · வீட்டு முகவரி
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-amber-800 mb-1 opacity-80">Door No / Street <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={address.door}
                          onChange={(e) => setAddress((a) => ({ ...a, door: e.target.value }))}
                          className="input text-sm"
                          placeholder="e.g. 12/A, Gandhi Nagar Street"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-amber-800 mb-1 opacity-80">Area / Landmark</label>
                        <input
                          type="text"
                          value={address.area}
                          onChange={(e) => setAddress((a) => ({ ...a, area: e.target.value }))}
                          className="input text-sm"
                          placeholder="e.g. Near Panchayat Office"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-amber-800 mb-1 opacity-80">City <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={address.city}
                            onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                            className="input text-sm"
                            placeholder="e.g. Komarapalayam"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-amber-800 mb-1 opacity-80">Pincode <span className="text-red-500">*</span></label>
                          <input
                            type="tel"
                            value={address.pincode}
                            onChange={(e) => setAddress((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                            className="input text-sm"
                            placeholder="638183"
                            maxLength={6}
                          />
                        </div>
                      </div>
                      {addressIncomplete && (
                        <p className="text-xs text-amber-700 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">warning</span>
                          Door/Street, City &amp; Pincode required for home visits
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Package selection */}
                <div className="card p-6">
                  <h2 className="font-bold text-text-dark mb-0.5 text-lg">Select Package</h2>
                  <p className="text-xs text-text-muted mb-5">தொகுப்பைத் தேர்ந்தெடுக்கவும்</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { type: "ONE_DAY" as PackageType, label: "1-Day Package", labelTa: "ஒரு நாள்", count: 1, desc: "Single session", icon: "calendar_today" },
                      { type: "FIVE_DAY" as PackageType, label: "5-Day Package", labelTa: "ஐந்து நாட்கள்", count: 5, desc: "5 consecutive sessions (Mon–Sat)", icon: "date_range" },
                    ].map((pkg) => {
                      const total = perSession * pkg.count;
                      return (
                        <button key={pkg.type} type="button" onClick={() => setPackageType(pkg.type)}
                          className={`text-left rounded-xl border-2 p-5 transition-all ${packageType === pkg.type ? "border-primary bg-primary/5" : "border-border-grey hover:border-primary/40 bg-white"}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className={`material-symbols-outlined text-2xl ${packageType === pkg.type ? "text-primary" : "text-text-muted"}`}>{pkg.icon}</span>
                            <div className="text-right">
                              <span className={`text-2xl font-bold ${packageType === pkg.type ? "text-primary" : "text-text-dark"}`}>₹{total}</span>
                              {pkg.count > 1 && <p className="text-[10px] text-text-muted">₹{perSession} × {pkg.count}</p>}
                            </div>
                          </div>
                          <p className="font-bold text-text-dark">{pkg.label}</p>
                          <p className="text-xs text-text-muted mt-0.5">{pkg.labelTa} · {pkg.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Date & Time */}
            {step === "datetime" && (
              <div className="space-y-4">
                <div className="card p-6">
                  <h2 className="font-bold text-text-dark mb-0.5 text-lg">Select Date</h2>
                  <p className="text-xs text-text-muted mb-4">தேதி தேர்வு · Mon–Sat (Sunday closed)</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
                    {availableDates.map((d) => {
                      const date = new Date(d + "T00:00:00");
                      const isSelected = d === selectedDate;
                      return (
                        <button key={d} type="button" onClick={() => { setSelectedDate(d); setSelectedSlot(""); }}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-[60px] h-[76px] rounded-xl border-2 transition-all ${isSelected ? "bg-primary border-primary text-white shadow-lg shadow-primary/25" : "bg-white border-border-grey hover:border-primary/40"}`}
                        >
                          <span className={`text-[9px] font-bold uppercase ${isSelected ? "text-white/70" : "text-text-muted"}`}>{date.toLocaleDateString("en", { weekday: "short" })}</span>
                          <span className={`text-xl font-bold mt-0.5 ${isSelected ? "text-white" : "text-text-dark"}`}>{date.getDate()}</span>
                          <span className={`text-[9px] ${isSelected ? "text-white/60" : "text-text-muted"}`}>{date.toLocaleDateString("en", { month: "short" })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-bold text-text-dark">Available Slots</h2>
                      <p className="text-xs text-text-muted">நேர இடம் · Pick a time</p>
                    </div>
                    {slotsLoading && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                  </div>
                  {!slotsLoading && availableSlots.length === 0 && bookedSlots.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-3xl text-primary/30 block mb-2">schedule</span>
                      <p className="text-sm text-text-muted">No slots available — try another date</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                        {[...availableSlots, ...bookedSlots]
                          .sort((a, b) => a.localeCompare(b))
                          .map((slot) => {
                            const isBooked = bookedSlots.includes(slot);
                            const isSelected = selectedSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={isBooked}
                                onClick={() => !isBooked && setSelectedSlot(slot)}
                                title={isBooked ? "Already booked" : undefined}
                                className={`relative rounded-lg py-2.5 px-2 text-xs font-semibold border-2 transition-all
                                  ${isBooked
                                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed line-through"
                                    : isSelected
                                      ? "bg-primary border-primary text-white"
                                      : "bg-white border-border-grey text-text-dark hover:border-primary/40"
                                  }`}
                              >
                                {slot}
                                {isBooked && (
                                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-gray-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: "9px" }}>lock</span>
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                      {bookedSlots.length > 0 && (
                        <p className="text-[11px] text-text-muted mt-3 flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-gray-200 inline-block" />
                          Grayed slots already booked · வேறு நேரம் தேர்ந்தெடுக்கவும்
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="card p-6">
                  <label className="block text-xs font-bold text-text-dark mb-2 uppercase tracking-wide opacity-70">Notes (Optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input resize-none" placeholder="Any specific symptoms or requirements..." rows={3} />
                </div>
              </div>
            )}

            {/* Step: Confirm */}
            {step === "confirm" && selectedDoctor && (
              <div className="card p-6">
                <h2 className="font-bold text-text-dark mb-0.5 text-lg">Confirm Booking</h2>
                <p className="text-xs text-text-muted mb-5">முன்பதிவை உறுதிப்படுத்தவும்</p>
                <div className="space-y-0 mb-5">
                  {[
                    { icon: "person", label: "Patient", value: `${name} · +91 ${phone}` },
                    { icon: "stethoscope", label: "Doctor", value: `Dr. ${selectedDoctor.users.name} · ${selectedDoctor.specialization}` },
                    { icon: "inventory_2", label: "Package", value: `${packageType === "ONE_DAY" ? "1-Day" : "5-Day"} Package — ₹${perSession} × ${sessionCount} = ₹${price}` },
                    { icon: visitType === "CENTER" ? "business" : "home", label: "Visit Type", value: visitType === "CENTER" ? "Center Visit" : "Home Visit" },
                    ...(visitType === "HOME" && address.door ? [{
                      icon: "location_on",
                      label: "Address",
                      value: [address.door, address.area, address.city, address.pincode].filter(Boolean).join(", "),
                    }] : []),
                    { icon: "calendar_today", label: "Start Date", value: new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) },
                    { icon: "schedule", label: "Time", value: selectedSlot },
                    ...(notes ? [{ icon: "notes", label: "Notes", value: notes }] : []),
                  ].map((row) => (
                    <div key={row.label} className="flex items-start gap-3 py-3 border-b border-border-grey last:border-0">
                      <span className="material-symbols-outlined text-xl text-primary/50 shrink-0 mt-0.5">{row.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">{row.label}</p>
                        <p className="text-sm font-semibold text-text-dark mt-0.5">{row.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3.5 flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-bold text-text-muted uppercase tracking-wide">Total Amount</p>
                    <p className="text-xs text-text-muted mt-0.5">Payable at the clinic · cash only</p>
                  </div>
                  <p className="text-3xl font-bold text-primary">₹{price}</p>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">error</span>{error}
                  </div>
                )}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex items-center justify-between pt-2 pb-8">
              {step !== "identity" ? (
                <button type="button" onClick={goBack} className="btn-secondary px-5 py-2.5">
                  <span className="material-symbols-outlined text-base">arrow_back</span>Back
                </button>
              ) : (
                <Link href="/" className="btn-ghost px-5 py-2.5">
                  <span className="material-symbols-outlined text-base">arrow_back</span>Home
                </Link>
              )}
              <button type="button" disabled={isNextDisabled} onClick={goNext} className="btn-primary px-6 py-2.5 disabled:opacity-50">
                {step === "confirm"
                  ? loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Booking...</>
                    : <><span className="material-symbols-outlined text-base">check_circle</span>Confirm Booking</>
                  : <><span>Continue</span><span className="material-symbols-outlined text-base">arrow_forward</span></>}
              </button>
            </div>
          </div>

          {/* Summary sidebar (desktop) */}
          <div className="hidden xl:block">
            <div className="card p-5 sticky top-24">
              <p className="section-title mb-4">Booking Summary</p>
              <div className="space-y-3">
                {[
                  { icon: "person", label: "Patient", value: name || "—" },
                  { icon: "stethoscope", label: "Doctor", value: selectedDoctor ? `Dr. ${selectedDoctor.users.name}` : "Not selected" },
                  { icon: "inventory_2", label: "Package", value: `${packageType === "ONE_DAY" ? "1-Day" : "5-Day"} · ₹${price}` },
                  { icon: visitType === "CENTER" ? "business" : "home", label: "Visit", value: visitType === "CENTER" ? "Center Visit" : "Home Visit" },
                  ...(visitType === "HOME" && address.city ? [{ icon: "location_on", label: "City", value: address.city }] : []),
                  ...(selectedDate ? [{ icon: "calendar_today", label: "Date", value: new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) }] : []),
                  ...(selectedSlot ? [{ icon: "schedule", label: "Time", value: selectedSlot }] : []),
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 p-3 rounded-lg bg-background-soft">
                    <span className="material-symbols-outlined text-primary/50 text-lg">{row.icon}</span>
                    <div>
                      <p className="text-[11px] text-text-muted font-semibold uppercase">{row.label}</p>
                      <p className="text-sm font-bold text-text-dark">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-border-grey flex justify-between items-center">
                <p className="text-sm font-semibold text-text-muted">Total</p>
                <p className="text-2xl font-bold text-primary">₹{price}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
