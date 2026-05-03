"use client";

import Link from "next/link";

const SERVICES = [
  {
    icon: "directions_run",
    title: "Orthopedic & Sports Rehab",
    desc: "Recovery from injuries, joint pain, post-surgery rehabilitation, sports trauma, and movement restoration for working adults and athletes.",
  },
  {
    icon: "elderly",
    title: "Geriatric Physiotherapy",
    desc: "Mobility, balance, and strength programs for seniors — pain management, fall prevention, and post-stroke recovery.",
  },
  {
    icon: "self_improvement",
    title: "Neurological Therapy",
    desc: "Stroke rehabilitation, Parkinson's care, spinal cord recovery, and other nerve-related movement therapy for adults of any age.",
  },
  {
    icon: "home",
    title: "Home Visit Services",
    desc: "Therapist visits your home — for elderly patients, post-surgery recovery, or anyone who prefers care without traveling.",
  },
  {
    icon: "child_care",
    title: "Pediatric & Special Needs",
    desc: "Continuing our trust's heritage — specialized programs for children with developmental, motor, or intellectual challenges.",
  },
  {
    icon: "photo_camera",
    title: "Documented Progress",
    desc: "Every session tracked with photos and notes so you can see clear, measurable improvement over time.",
  },
];

const TESTIMONIALS = [
  {
    text: "After my knee surgery the home visit therapy got me back on my feet faster than I expected. Very clear instructions every session.",
    author: "Patient, Komarapalayam",
  },
  {
    text: "My father had a stroke last year. The therapists are patient and skilled — his mobility has improved a lot.",
    author: "Patient's Family, Pallipalayam",
  },
  {
    text: "Affordable, professional, and they actually explain the exercises. Best physiotherapy in the Erode district.",
    author: "Patient, Erode District",
  },
];

const HOURS = [
  { day: "Monday – Friday", time: "9:00 AM – 5:00 PM", open: true },
  { day: "Saturday", time: "9:00 AM – 3:00 PM", open: true },
  { day: "Sunday", time: "Closed", open: false },
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
              <p className="text-text-muted text-[11px] mt-0.5 hidden sm:block">Sri Kambathukarar Charitable Trust</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a href="#about" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors hidden md:block">About</a>
            <a href="#contact" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors hidden md:block">Contact</a>
            <Link href="/stafflogin" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors hidden sm:block">
              Staff Login
            </Link>
            <Link href="/booking" className="btn-primary py-2.5 px-5 text-sm">
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Book Now
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-5 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-3 py-1.5 rounded-full mb-5">
              <span className="material-symbols-outlined text-sm">location_on</span>
              Komarapalayam, Tamil Nadu
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-text-dark leading-tight mb-4">
              Expert Physiotherapy.<br />
              <span className="text-primary">For Every Body.</span>
            </h1>
            <p className="text-text-muted text-base lg:text-lg leading-relaxed mb-2">
              Sri Kambathukarar Charitable Trust offers professional physiotherapy and rehabilitation for everyone — orthopedic recovery, sports injuries, geriatric care, neurological therapy, and our trusted pediatric programs.
            </p>
            <p className="text-text-muted/70 text-sm mb-8">
              ஸ்ரீ கம்பத்துக்காரர் சேவை அறக்கட்டளை · கோமாரபாளையம்
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/booking" className="btn-primary py-3.5 px-7 text-base">
                <span className="material-symbols-outlined">calendar_month</span>
                Book a Session
              </Link>
              <a href="tel:+919976163200" className="btn-secondary py-3.5 px-7 text-base">
                <span className="material-symbols-outlined">call</span>
                +91 99761 63200
              </a>
            </div>
            <div className="flex items-center gap-8 mt-8">
              {[
                { value: "1000+", label: "Patients Treated" },
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
                    <span className="material-symbols-outlined text-white text-2xl">healing</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Book an Appointment</p>
                    <p className="text-xs text-text-muted">முன்பதிவு செய்யவும் · No account needed</p>
                  </div>
                </div>

                <div className="space-y-2.5 mb-5">
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-wide text-text-muted px-1">
                    <span>Package</span>
                    <span className="text-center">Center</span>
                    <span className="text-right">Home</span>
                  </div>
                  {[
                    { icon: "calendar_today", label: "1-Day", center: 100, home: 500 },
                    { icon: "date_range", label: "5-Day", center: 500, home: 2500 },
                  ].map((pkg) => (
                    <div key={pkg.label} className="grid grid-cols-3 gap-2 items-center p-3 bg-background-soft rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">{pkg.icon}</span>
                        <span className="text-sm font-bold text-text-dark">{pkg.label}</span>
                      </div>
                      <p className="text-base font-bold text-primary text-center">₹{pkg.center}</p>
                      <p className="text-base font-bold text-accent-warm text-right">₹{pkg.home}</p>
                    </div>
                  ))}
                  <p className="text-[11px] text-text-muted text-center pt-1">
                    Center ₹100/session · Home ₹500/session
                  </p>
                </div>

                {/* Hours */}
                <div className="border-t border-border-grey pt-4 mb-5 space-y-1">
                  {HOURS.map((h) => (
                    <div key={h.day} className="flex justify-between text-xs">
                      <span className="text-text-muted font-medium">{h.day}</span>
                      <span className={`font-bold ${h.open ? "text-text-dark" : "text-red-400"}`}>{h.time}</span>
                    </div>
                  ))}
                </div>

                <Link href="/booking" className="btn-primary w-full py-3.5 text-base justify-center">
                  <span className="material-symbols-outlined">arrow_forward</span>
                  Book Now — It&apos;s Free
                </Link>
                <p className="text-xs text-text-muted text-center mt-3">Payment at the clinic · Cash only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About SKCT ── */}
      <section id="about" className="bg-white border-y border-border-grey py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">About SKCT</span>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-dark mb-4">
                Trusted Physiotherapy for Komarapalayam
              </h2>
              <p className="text-text-muted text-base leading-relaxed mb-4">
                Sri Kambathukarar Charitable Trust (SKCT) is a community-rooted physiotherapy and rehabilitation centre
                serving patients across Erode District — from working professionals and athletes recovering from injury,
                to seniors managing pain and mobility, to children with special needs.
              </p>
              <p className="text-text-muted text-base leading-relaxed mb-6">
                Our vision is a full multi-specialty rehabilitation centre offering therapy, education, and support
                programs — combining clinical expertise with affordable, accessible care.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-4 bg-background-soft rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">verified</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark text-sm">Trained, Experienced Therapists</p>
                    <p className="text-xs text-text-muted">Licensed physiotherapists with expertise across orthopedic, neurological, and pediatric care</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background-soft rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark text-sm">Sri Kambathukarar Special School (SKSS)</p>
                    <p className="text-xs text-text-muted">Our sister institution serving children with developmental needs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background-soft rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">volunteer_activism</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark text-sm">Community-Focused Care</p>
                    <p className="text-xs text-text-muted">Affordable rates, home-visit options, and dedicated support for the Komarapalayam region</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SERVICES.map((s) => (
                <div key={s.title} className="card-hover p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary text-xl">{s.icon}</span>
                  </div>
                  <p className="font-bold text-text-dark text-sm mb-1">{s.title}</p>
                  <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="max-w-6xl mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Parent Feedback</span>
          <h2 className="text-2xl lg:text-3xl font-bold text-text-dark mb-2">What Families Say</h2>
          <p className="text-text-muted text-sm">பெற்றோர்களின் அனுபவங்கள்</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="material-symbols-outlined text-amber-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                ))}
              </div>
              <p className="text-sm text-text-muted leading-relaxed flex-1 mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2 pt-3 border-t border-border-grey">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-sm">person</span>
                </div>
                <p className="text-xs font-semibold text-text-muted">{t.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact & Location ── */}
      <section id="contact" className="bg-white border-y border-border-grey py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">Visit Us</span>
            <h2 className="text-2xl lg:text-3xl font-bold text-text-dark mb-2">Find Us in Komarapalayam</h2>
            <p className="text-text-muted text-sm">எங்களை சந்திக்கவும்</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Address */}
            <div className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              </div>
              <p className="font-bold text-text-dark mb-2">Address</p>
              <p className="text-sm text-text-muted leading-relaxed">
                5/60-8, Gandhi Nagar, 3rd Street,<br />
                Pallipalayam – Kumarapalayam Road,<br />
                Komarapalayam, Tamil Nadu 638183
              </p>
              <a
                href="https://maps.google.com/?q=Sri+Kambathukarar+Charitable+Trust,+Komarapalayam,+Tamil+Nadu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary mt-4 hover:underline"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Open in Maps
              </a>
            </div>

            {/* Phone */}
            <div className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-xl">call</span>
              </div>
              <p className="font-bold text-text-dark mb-2">Contact</p>
              <a href="tel:+919976163200" className="text-xl font-bold text-primary block hover:underline mb-1">
                +91 99761 63200
              </a>
              <p className="text-sm text-text-muted">Call us to enquire or for home visit requests</p>
              <a href="tel:+919976163200" className="btn-primary mt-4 text-sm py-2.5 px-4 inline-flex">
                <span className="material-symbols-outlined text-base">call</span>
                Call Now
              </a>
            </div>

            {/* Hours */}
            <div className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-xl">schedule</span>
              </div>
              <p className="font-bold text-text-dark mb-3">Operating Hours</p>
              <div className="space-y-2.5">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-text-muted">{h.day}</span>
                    <span className={`text-sm font-bold shrink-0 ${h.open ? "text-text-dark" : "text-red-400"}`}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border-grey flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Open today · Walk-ins welcome
              </div>
            </div>
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
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Book your first session today
              </h2>
              <p className="text-white/60 text-sm">
                Online booking in under 2 minutes. No account required. Payment at the clinic.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/booking" className="inline-flex items-center justify-center gap-2 bg-white text-primary font-bold px-7 py-3.5 rounded-xl hover:bg-white/95 transition-colors text-base shadow-lg">
                <span className="material-symbols-outlined">calendar_month</span>
                Book Appointment
              </Link>
              <a href="tel:+919976163200" className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base border border-white/20">
                <span className="material-symbols-outlined">call</span>
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border-grey bg-white">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 p-1.5 shrink-0">
                  <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-bold text-text-dark text-sm leading-none">SKCT Physio</p>
                  <p className="text-text-muted text-[11px] mt-0.5">Sri Kambathukarar Charitable Trust</p>
                </div>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Professional physiotherapy and rehabilitation for everyone — orthopedic, geriatric, neurological, and pediatric care in Komarapalayam, Tamil Nadu.
              </p>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold text-text-dark uppercase tracking-widest mb-3">Contact</p>
              <div className="space-y-2">
                <a href="tel:+919976163200" className="flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-base text-primary/50">call</span>
                  +91 99761 63200
                </a>
                <p className="flex items-start gap-2 text-sm text-text-muted">
                  <span className="material-symbols-outlined text-base text-primary/50 mt-0.5">location_on</span>
                  Gandhi Nagar, 3rd Street, Komarapalayam, TN 638183
                </p>
              </div>
            </div>

            {/* Hours */}
            <div>
              <p className="text-xs font-bold text-text-dark uppercase tracking-widest mb-3">Hours</p>
              <div className="space-y-1.5">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex justify-between text-sm">
                    <span className="text-text-muted">{h.day}</span>
                    <span className={`font-semibold ${h.open ? "text-text-dark" : "text-red-400"}`}>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border-grey pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} Sri Kambathukarar Charitable Trust. All rights reserved.
            </p>
            <Link href="/stafflogin" className="text-xs text-text-muted hover:text-primary transition-colors font-semibold">
              Staff Login →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
