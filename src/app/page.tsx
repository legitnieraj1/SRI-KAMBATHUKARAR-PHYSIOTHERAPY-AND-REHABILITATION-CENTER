"use client";

import Link from "next/link";

const FEATURES = [
  { icon: "accessibility_new", title: "Expert Physiotherapy", desc: "Certified physiotherapists with years of clinical experience in musculoskeletal rehabilitation." },
  { icon: "home", title: "Home Visits", desc: "Can't travel? Our doctors come to you. Book a home visit for the same professional care." },
  { icon: "date_range", title: "5-Day Packages", desc: "Structured Mon–Fri treatment plans for faster recovery with consistent care." },
  { icon: "photo_camera", title: "Progress Tracking", desc: "Every session is documented with photos and notes so you can see your recovery journey." },
  { icon: "currency_rupee", title: "Affordable Care", desc: "Sessions start at just ₹100. Quality physiotherapy shouldn't be a luxury." },
  { icon: "schedule", title: "Flexible Timing", desc: "Morning and evening slots available six days a week to fit your schedule." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-soft text-text-dark font-display antialiased">

      {/* ── Nav ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border-grey sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 p-1.5 shrink-0">
              <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-primary text-sm leading-none">SKCT Physio</p>
              <p className="text-text-muted text-[11px] mt-0.5 hidden sm:block">Sri Kambathukarar Physiotherapy Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/stafflogin" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors hidden sm:block">
              Staff Login
            </Link>
            <Link href="/booking" className="btn-primary py-2.5 px-5 text-sm">
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Now accepting new patients
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-text-dark leading-tight mb-4">
              Recover faster.<br />
              <span className="text-primary">Move better.</span>
            </h1>
            <p className="text-text-muted text-base lg:text-lg leading-relaxed mb-2">
              Professional physiotherapy and rehabilitation care — at our center or at your home.
            </p>
            <p className="text-text-muted/70 text-sm mb-8">
              ஸ்ரீ கம்பத்துக்காரர் பிசியோதெரபி மற்றும் மறுவாழ்வு மையம்
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/booking" className="btn-primary py-3.5 px-7 text-base">
                <span className="material-symbols-outlined">calendar_month</span>
                Book a Session
              </Link>
              <a href="tel:+919500000000" className="btn-secondary py-3.5 px-7 text-base">
                <span className="material-symbols-outlined">call</span>
                Call Us
              </a>
            </div>
            <div className="flex items-center gap-6 mt-8">
              {[
                { value: "500+", label: "Patients Treated" },
                { value: "₹100", label: "Starting Price" },
                { value: "6 Days", label: "A Week" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-text-muted font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — booking card */}
          <div className="lg:pl-8">
            <div className="card p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">medical_services</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Book Appointment</p>
                    <p className="text-xs text-text-muted">முன்பதிவு செய்யவும் · No account needed</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { icon: "calendar_today", label: "1-Day Package", price: "₹100", desc: "Single session" },
                    { icon: "date_range", label: "5-Day Package", price: "₹300", desc: "Mon–Fri sessions" },
                  ].map((pkg) => (
                    <div key={pkg.label} className="flex items-center gap-3 p-3.5 bg-background-soft rounded-xl">
                      <span className="material-symbols-outlined text-primary text-xl">{pkg.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-text-dark">{pkg.label}</p>
                        <p className="text-xs text-text-muted">{pkg.desc}</p>
                      </div>
                      <p className="text-lg font-bold text-primary">{pkg.price}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  {["Center Visit", "Home Visit"].map((v) => (
                    <div key={v} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-background-soft px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-sm text-primary">{v === "Center Visit" ? "business" : "home"}</span>
                      {v}
                    </div>
                  ))}
                </div>

                <Link href="/booking" className="btn-primary w-full py-3.5 text-base justify-center">
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Book Now — It's Free
                </Link>
                <p className="text-xs text-text-muted text-center mt-3">Payment collected at the clinic · Cash only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-border-grey py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-text-dark mb-2">Why Choose SKCT Physio?</h2>
            <p className="text-text-muted">ஏன் எங்களை தேர்வு செய்ய வேண்டும்?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-hover p-5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">{f.icon}</span>
                </div>
                <p className="font-bold text-text-dark mb-1.5">{f.title}</p>
                <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-6xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="bg-primary rounded-2xl p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 lg:flex items-center justify-between gap-8">
            <div className="mb-6 lg:mb-0">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">Ready to start your recovery?</h2>
              <p className="text-white/60 text-sm">Book online in under 2 minutes. No account, no OTP, no hassle.</p>
            </div>
            <Link href="/booking" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-3.5 rounded-xl hover:bg-white/95 transition-colors shrink-0 text-base shadow-lg">
              <span className="material-symbols-outlined">calendar_month</span>
              Book Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border-grey bg-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 p-1">
              <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-text-muted">Sri Kambathukarar Physiotherapy &amp; Rehabilitation Center</p>
          </div>
          <Link href="/stafflogin" className="text-sm text-text-muted hover:text-primary transition-colors font-medium">
            Staff Login →
          </Link>
        </div>
      </footer>
    </div>
  );
}
