"use client";

import Link from "next/link";

const SERVICES = [
  {
    icon: "child_care",
    title: "Specialized for Children",
    desc: "Expert physiotherapy for children with intellectual and developmental disabilities — tailored programs, not generic care.",
  },
  {
    icon: "directions_run",
    title: "Motor Rehabilitation",
    desc: "Targeted therapy to improve physical mobility, balance, and coordination for children with motor challenges.",
  },
  {
    icon: "psychology",
    title: "Developmental Support",
    desc: "Specially designed programs that address medical, social, and educational needs of children with special needs.",
  },
  {
    icon: "home",
    title: "Home Visit Services",
    desc: "Our therapists come to your home — comfortable, familiar-environment therapy that works better for many children.",
  },
  {
    icon: "school",
    title: "Sri Kambathukarar Special School",
    desc: "SKSS provides specialized education alongside therapy — a holistic approach to rehabilitation and learning.",
  },
  {
    icon: "photo_camera",
    title: "Progress Documentation",
    desc: "Every session is recorded with photos and notes so families can clearly see their child's recovery journey.",
  },
];

const TESTIMONIALS = [
  {
    text: "The physiotherapists teach the exercises in a very clear and patient way. My child has improved so much.",
    author: "Parent, Komarapalayam",
  },
  {
    text: "Specialized care for children with special needs. They truly understand what these children require.",
    author: "Parent, Pallipalayam",
  },
  {
    text: "The home visit service is incredibly helpful. Professional care without the stress of travel for my child.",
    author: "Parent, Erode District",
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
              Specialized Care<br />
              <span className="text-primary">for Special Children.</span>
            </h1>
            <p className="text-text-muted text-base lg:text-lg leading-relaxed mb-2">
              Sri Kambathukarar Charitable Trust provides expert physiotherapy and rehabilitation for children with intellectual and developmental disabilities.
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
                { value: "500+", label: "Children Supported" },
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
                    <span className="material-symbols-outlined text-white text-2xl">child_care</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark">Book an Appointment</p>
                    <p className="text-xs text-text-muted">முன்பதிவு செய்யவும் · No account needed</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  {[
                    { icon: "calendar_today", label: "1-Day Session", price: "₹100", desc: "Single physiotherapy session" },
                    { icon: "date_range", label: "5-Day Package", price: "₹300", desc: "5 consecutive sessions" },
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

                <div className="flex gap-2 mb-5">
                  {[
                    { label: "Center Visit", icon: "business" },
                    { label: "Home Visit", icon: "home" },
                  ].map((v) => (
                    <div key={v.label} className="flex items-center gap-1.5 text-xs font-semibold text-text-muted bg-background-soft px-3 py-1.5 rounded-full">
                      <span className="material-symbols-outlined text-sm text-primary">{v.icon}</span>
                      {v.label}
                    </div>
                  ))}
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
                A Trust Built for Children Who Need It Most
              </h2>
              <p className="text-text-muted text-base leading-relaxed mb-4">
                Sri Kambathukarar Charitable Trust (SKCT) in Komarapalayam provides specialized physiotherapy services
                for children with intellectual and developmental disabilities — addressing their motor, medical, and
                social challenges through expert care.
              </p>
              <p className="text-text-muted text-base leading-relaxed mb-6">
                Our vision is a full multi-specialty rehabilitation center offering therapies, education, and support
                programs so every child can live with greater independence and dignity.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-4 bg-background-soft rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">school</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark text-sm">Sri Kambathukarar Special School (SKSS)</p>
                    <p className="text-xs text-text-muted">Specialized education for children with special needs, alongside therapy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-background-soft rounded-xl">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-xl">volunteer_activism</span>
                  </div>
                  <div>
                    <p className="font-bold text-text-dark text-sm">Community-Focused Care</p>
                    <p className="text-xs text-text-muted">Identification, support programs, and home services for families across Erode District</p>
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
                Book your child&apos;s first session today
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
                Specialized physiotherapy and rehabilitation for children with intellectual and developmental disabilities in Komarapalayam, Tamil Nadu.
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
