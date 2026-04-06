"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Helper to generate dynamic dates
const getNext5Days = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push({
      day: days[nextDate.getDay()],
      date: nextDate.getDate(),
      fullDate: nextDate.toISOString().split("T")[0] // Used for internal unique matching
    });
  }
  return dates;
};

export default function BookingPage() {
  const [selectedPart, setSelectedPart] = useState("back");
  const [dates, setDates] = useState<{day: string, date: number, fullDate: string}[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("10:30 AM");

  // Booking states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
  const [confirmedBookings, setConfirmedBookings] = useState<{date: string, time: string}[]>([]);

  useEffect(() => {
    // Generate dates on client to prevent hydration mismatch from server dates
    const initialDates = getNext5Days();
    setDates(initialDates);
    setSelectedDate(initialDates[0].fullDate);
  }, []);

  const bodyParts = [
    { id: "back", label: "Back Pain", tamil: "முதுகு வலி", icon: "accessibility_new" },
    { id: "neck", label: "Neck Pain", tamil: "கழுத்து வலி", icon: "sentiment_stressed" },
    { id: "sports", label: "Sports Injury", tamil: "விளையாட்டு காயம்", icon: "directions_run" },
    { id: "leg", label: "Leg Pain", tamil: "கால் வலி", icon: "steps" },
  ];

  const times = [
    "09:00 AM",
    "10:30 AM",
    "11:00 AM",
    "02:00 PM",
    "04:30 PM",
    "05:00 PM",
  ];

  const handleConfirmClick = () => {
    setShowModal(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmedBookings((prev) => [...prev, { date: selectedDate, time: selectedTime }]);
    setShowModal(false);
    // You could also clear the form data here if desired
  };

  return (
    <div className="bg-background-soft font-display antialiased text-text-dark selection:bg-primary selection:text-white min-h-screen">
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-soft">
        {/* Decorative Ambient Background */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Header */}
        <header className="flex items-center justify-between p-6 pb-2 pt-12 relative z-10">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full glass-panel text-primary hover:bg-white/40 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="text-center">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Physio Care</p>
            <h2 className="text-lg font-bold text-primary leading-tight">New Appointment</h2>
            <p className="text-[10px] text-primary/60 font-medium">புதிய நியமனம்</p>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full glass-panel text-primary hover:bg-white/40 transition-colors relative">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent rounded-full border border-background-soft"></span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar relative z-10 px-6">
          {/* Welcome Section */}
          <div className="mb-8 mt-4">
            <h1 className="text-3xl font-bold text-primary mb-1 tracking-tight">Good Morning, Guest</h1>
            <p className="text-xl text-primary/60 font-medium">காலை வணக்கம்</p>
          </div>

          {/* Body Part Selection */}
          <section className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="text-lg font-bold text-primary">What hurts today?</h3>
                <p className="text-sm text-primary/60 font-medium">வலிக்கான இடம்?</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {bodyParts.map((part) => (
                <div
                  key={part.id}
                  onClick={() => setSelectedPart(part.id)}
                  className={`glass-card rounded-2xl p-5 flex flex-col items-center text-center cursor-pointer group relative overflow-hidden ${
                    selectedPart === part.id ? "selected" : ""
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-border-grey">
                    <span className={`material-symbols-outlined text-3xl ${selectedPart === part.id ? "text-accent" : "text-primary/40 group-hover:text-accent transition-colors"}`}>
                      {part.icon}
                    </span>
                  </div>
                  <span className="text-primary font-bold text-base">{part.label}</span>
                  <span className="text-primary/60 text-xs mt-1">{part.tamil}</span>
                  {selectedPart === part.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[14px] text-white">check</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Date Selection */}
          <section className="mb-8">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-primary">Choose Date</h3>
              <p className="text-sm text-primary/60 font-medium">தேதியைத் தேர்ந்தெடுக்கவும்</p>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
              {dates.map((d) => (
                <div
                  key={d.fullDate}
                  onClick={() => setSelectedDate(d.fullDate)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[90px] rounded-2xl cursor-pointer transition-all ${
                    selectedDate === d.fullDate
                      ? "bg-gradient-to-b from-[#155F3A] to-[#2F7D57] shadow-lg shadow-primary/20 border border-white/20 transform scale-105"
                      : "glass-card hover:bg-white/60"
                  }`}
                >
                  <span className={`${selectedDate === d.fullDate ? "text-white/80" : "text-primary/40"} text-xs font-medium mb-1`}>
                    {d.day}
                  </span>
                  <span className={`${selectedDate === d.fullDate ? "text-white" : "text-primary"} text-2xl font-bold mb-1`}>
                    {d.date}
                  </span>
                  {selectedDate === d.fullDate && <span className="w-1 h-1 rounded-full bg-white"></span>}
                </div>
              ))}
            </div>
          </section>

          {/* Time Selection */}
          <section className="mb-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-primary">Available Time</h3>
              <p className="text-sm text-primary/60 font-medium">கிடைக்கும் நேரம்</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {times.map((time) => {
                const isConfirmedSlot = confirmedBookings.some((b) => b.date === selectedDate && b.time === time);
                const isPast = time === "04:30 PM"; // Keeping the original disabled state example
                const isDisabled = isPast || isConfirmedSlot;

                return (
                  <button
                    key={time}
                    onClick={() => !isDisabled && setSelectedTime(time)}
                    disabled={isDisabled}
                    className={`rounded-xl py-3 px-2 text-sm font-bold transition-all ${
                      selectedTime === time && !isDisabled
                        ? "bg-[#E6F0EA] border border-accent text-primary shadow-sm scale-105"
                        : isDisabled
                          ? "bg-secondary-bg/50 border border-border-grey text-text-dark/30 cursor-not-allowed opacity-50"
                          : "glass-card text-primary hover:bg-white/80"
                    }`}
                  >
                    <span className={isDisabled ? "line-through text-text-dark/40" : ""}>{time}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 w-full glass-panel border-t border-primary/10 p-5 z-20 rounded-t-3xl backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex flex-col bg-beige-card/40 px-3 py-1 rounded-lg">
              <span className="text-[10px] text-primary/60 font-bold uppercase tracking-tight">Total / மொத்தம்</span>
              <span className="text-xl font-black text-primary">₹850</span>
            </div>

            {confirmedBookings.some((b) => b.date === selectedDate && b.time === selectedTime) ? (
              <button disabled className="flex-1 bg-border-grey/50 text-primary/40 border border-primary/10 rounded-xl py-3.5 px-6 font-bold text-base transition-all flex items-center justify-center gap-2 cursor-not-allowed">
                <span>Booked</span>
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </button>
            ) : (
              <button onClick={handleConfirmClick} className="flex-1 bg-gradient-to-r from-[#155F3A] to-[#2F7D57] hover:opacity-90 text-white rounded-xl py-3.5 px-6 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                <span>Confirm Booking</span>
                <span className="opacity-70 font-normal text-xs hidden sm:inline">| முன்பதிவு</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* Booking Details Modal Collection Overlay */}
        {showModal && (
          <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center bg-primary/20 backdrop-blur-md">
            <div className="bg-background-soft w-full h-[80%] sm:h-auto sm:max-h-[80%] sm:w-[90%] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-bottom-10 border border-primary/10 overflow-hidden">
              <div className="flex justify-between items-center mb-6 pt-2">
                <div>
                  <h3 className="text-xl font-extrabold text-primary">Patient Details</h3>
                  <p className="text-xs text-primary/60 font-medium">நோயாளி விவரங்கள்</p>
                </div>
                <button onClick={() => setShowModal(false)} className="size-8 rounded-full bg-border-grey/50 hover:bg-border-grey flex items-center justify-center text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl glass-card bg-primary/5">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">{selectedDate} at {selectedTime}</p>
                  <p className="text-xs text-primary/60">Selected slot to book</p>
                </div>
              </div>

              <form onSubmit={handleModalSubmit} className="flex flex-col gap-4 flex-1 overflow-y-auto no-scrollbar pb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase opacity-80" htmlFor="name">Full Name</label>
                  <input 
                    id="name"
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/60 border border-border-grey rounded-xl py-3 px-4 text-sm text-primary placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase opacity-80" htmlFor="contact">Contact Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary/60">+91</span>
                    <input 
                      id="contact"
                      type="tel" 
                      required
                      value={formData.contact}
                      onChange={(e) => setFormData({...formData, contact: e.target.value})}
                      className="w-full bg-white/60 border border-border-grey rounded-xl py-3 pl-12 pr-4 text-sm text-primary placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                      placeholder="9876543210"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase opacity-80" htmlFor="message">Additional Notes (Optional)</label>
                  <textarea 
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-white/60 border border-border-grey rounded-xl py-3 px-4 text-sm text-primary placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium resize-none"
                    placeholder="Any specific symptoms or requirements?"
                    rows={3}
                  />
                </div>

                <button type="submit" className="w-full bg-green-gradient text-white rounded-xl py-3.5 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-auto sm:mt-4 flex items-center justify-center gap-2">
                  Confirm & Pay at Clinic
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
