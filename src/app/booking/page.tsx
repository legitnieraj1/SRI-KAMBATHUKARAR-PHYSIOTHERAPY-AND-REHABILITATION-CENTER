"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface Doctor {
  id: string;
  specialization: string;
  users: { name: string; phone: string };
}

type Step = "identity" | "doctor" | "package" | "datetime" | "confirm" | "success";
type PackageType = "ONE_DAY" | "FIVE_DAY";
type VisitType = "CENTER" | "HOME";

const STEPS: { key: Exclude<Step, "success">; label: string }[] = [
  { key: "identity", label: "Your Info" },
  { key: "doctor", label: "Doctor" },
  { key: "package", label: "Package" },
  { key: "datetime", label: "Schedule" },
  { key: "confirm", label: "Confirm" },
];

const getWeekdays = (from: Date, count: number) => {
  const days: string[] = [];
  const d = new Date(from);
  while (days.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
};

export default function BookingPage() {
  const [step, setStep] = useState<Step>("identity");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [packageType, setPackageType] = useState<PackageType>("ONE_DAY");
  const [visitType, setVisitType] = useState<VisitType>("CENTER");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
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
    const dates = getWeekdays(new Date(), 14);
    setAvailableDates(dates);
    setSelectedDate(dates[0]);
  }, []);

  useEffect(() => {
    if (!selectedDoctor || !selectedDate) return;
    setSlotsLoading(true);
    fetch(`/api/doctors/${selectedDoctor.id}/availability?date=${selectedDate}`)
      .then((r) => r.json())
      .then((d) => setAvailableSlots(d.data?.available_slots ?? []))
      .finally(() => setSlotsLoading(false));
  }, [selectedDoctor, selectedDate]);

  const confirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return;
    setError("");
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, doctor_id: selectedDoctor.id, package_type: packageType, visit_type: visitType, start_date: selectedDate, scheduled_time: selectedSlot, notes }),
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

  const isNextDisabled =
    (step === "identity" && (name.trim().length < 2 || phone.length < 10)) ||
    (step === "doctor" && !selectedDoctor) ||
    (step === "datetime" && (!selectedDate || !selectedSlot)) ||
    loading;

  const price = packageType === "ONE_DAY" ? 100 : 300;

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background-soft flex items-center justify-center p-5">
        <div className="card p-10 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-text-dark mb-1">Booking Confirmed!</h2>
          <p className="text-text-muted text-sm mb-1">முன்பதிவு உறுதிப்படுத்தப்பட்டது</p>
          <p className="text-xs text-text-muted font-mono bg-background-soft rounded-lg px-3 py-1.5 inline-block mt-2 mb-6">
            ID: {bookingId.slice(0, 8).toUpperCase()}
          </p>
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium mb-6 text-left space-y-1.5">
            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">person</span>{name}</p>
            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">stethoscope</span>Dr. {selectedDoctor?.users.name}</p>
            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">calendar_today</span>{selectedDate} at {selectedSlot}</p>
            <p className="flex items-center gap-2"><span className="material-symbols-outlined text-base">payments</span>₹{price} — payable at the clinic</p>
          </div>
          <Link href="/" className="btn-primary w-full py-3 justify-center">
            <span className="material-symbols-outlined text-base">home</span>Back to Home
          </Link>
        </div>
      </div>
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
                <div className="card p-6">
                  <h2 className="font-bold text-text-dark mb-0.5 text-lg">Select Package</h2>
                  <p className="text-xs text-text-muted mb-5">தொகுப்பைத் தேர்ந்தெடுக்கவும்</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { type: "ONE_DAY" as PackageType, label: "1-Day Package", price: "₹100", desc: "Single physiotherapy session", icon: "calendar_today" },
                      { type: "FIVE_DAY" as PackageType, label: "5-Day Package", price: "₹300", desc: "Mon–Fri, 5 consecutive sessions", icon: "date_range" },
                    ].map((pkg) => (
                      <button key={pkg.type} type="button" onClick={() => setPackageType(pkg.type)}
                        className={`text-left rounded-xl border-2 p-5 transition-all ${packageType === pkg.type ? "border-primary bg-primary/5" : "border-border-grey hover:border-primary/40 bg-white"}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className={`material-symbols-outlined text-2xl ${packageType === pkg.type ? "text-primary" : "text-text-muted"}`}>{pkg.icon}</span>
                          <span className={`text-2xl font-bold ${packageType === pkg.type ? "text-primary" : "text-text-dark"}`}>{pkg.price}</span>
                        </div>
                        <p className="font-bold text-text-dark">{pkg.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{pkg.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card p-6">
                  <h2 className="font-bold text-text-dark mb-4">Visit Type</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: "CENTER" as VisitType, label: "Center Visit", desc: "Visit our clinic", icon: "business" },
                      { type: "HOME" as VisitType, label: "Home Visit", desc: "Doctor comes to you", icon: "home" },
                    ].map((v) => (
                      <button key={v.type} type="button" onClick={() => setVisitType(v.type)}
                        className={`text-left rounded-xl border-2 p-4 transition-all ${visitType === v.type ? "border-primary bg-primary/5" : "border-border-grey hover:border-primary/40 bg-white"}`}
                      >
                        <span className={`material-symbols-outlined text-2xl block mb-2 ${visitType === v.type ? "text-primary" : "text-text-muted"}`}>{v.icon}</span>
                        <p className="font-bold text-sm text-text-dark">{v.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{v.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Date & Time */}
            {step === "datetime" && (
              <div className="space-y-4">
                <div className="card p-6">
                  <h2 className="font-bold text-text-dark mb-0.5 text-lg">Select Date</h2>
                  <p className="text-xs text-text-muted mb-4">தேதி தேர்வு · Weekdays only</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2">
                    {availableDates.map((d) => {
                      const date = new Date(d);
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
                  {!slotsLoading && availableSlots.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-3xl text-primary/30 block mb-2">schedule</span>
                      <p className="text-sm text-text-muted">No slots available — try another date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {availableSlots.map((slot) => (
                        <button key={slot} type="button" onClick={() => setSelectedSlot(slot)}
                          className={`rounded-lg py-2.5 px-2 text-xs font-semibold border-2 transition-all ${selectedSlot === slot ? "bg-primary border-primary text-white" : "bg-white border-border-grey text-text-dark hover:border-primary/40"}`}
                        >{slot}</button>
                      ))}
                    </div>
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
                    { icon: "inventory_2", label: "Package", value: packageType === "ONE_DAY" ? "1-Day Package — ₹100" : "5-Day Package — ₹300" },
                    { icon: visitType === "CENTER" ? "business" : "home", label: "Visit Type", value: visitType === "CENTER" ? "Center Visit" : "Home Visit" },
                    { icon: "calendar_today", label: "Start Date", value: new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) },
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
                  { icon: "inventory_2", label: "Package", value: packageType === "ONE_DAY" ? "1-Day · ₹100" : "5-Day · ₹300" },
                  { icon: visitType === "CENTER" ? "business" : "home", label: "Visit", value: visitType === "CENTER" ? "Center Visit" : "Home Visit" },
                  ...(selectedDate ? [{ icon: "calendar_today", label: "Date", value: new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) }] : []),
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
