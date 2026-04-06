"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-background-soft text-text-dark font-display antialiased min-h-screen flex flex-col relative overflow-hidden selection:bg-primary selection:text-white">
      {/* Ambient Background Elements */}
      <div className="glow-orb-1"></div>
      <div className="glow-orb-2"></div>

      {/* Header / Top Bar */}
      <header className="flex items-center justify-between px-6 py-5 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center shrink-0 size-14 rounded-xl bg-white/50 border border-primary/20 backdrop-blur-sm p-1 shadow-sm">
            <img src="/skct.png" alt="SKCT Logo" className="w-full h-full object-contain object-center" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-wide text-primary">SRI KAMBATHUKARAR PHYSIOTHERAPY AND REHABILITATION CENTER</h1>
            <p className="text-xs text-primary/60 font-medium">ஸ்ரீ கம்பத்துக்காரர் பிசியோதெரபி மற்றும் மறுவாழ்வு மையம்</p>
          </div>
        </div>
        {/* Language Toggle */}
        <button className="glass-button flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-all active:scale-95 group">
          <span className="text-xs font-bold text-primary group-hover:text-primary-light transition-colors">ENG</span>
          <span className="h-3 w-px bg-primary/20"></span>
          <span className="text-xs font-bold text-primary/70 group-hover:text-primary transition-colors">தமிழ்</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start px-5 pb-24 z-10 relative w-full max-w-lg mx-auto">
        {/* Hero Card */}
        <div className="glass-card bg-mint-card rounded-3xl p-6 mb-8 mt-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <p className="text-primary-light text-sm font-bold tracking-wider uppercase mb-1">Welcome / வணக்கம்</p>
          <h2 className="text-3xl font-extrabold text-primary leading-tight mb-2">
            Your Health, <br />
            <span className="text-transparent bg-clip-text bg-green-gradient">Our Priority.</span>
          </h2>
          <p className="text-text-dark/80 text-sm leading-relaxed max-w-[90%] font-medium">
            Experience world-class physiotherapy care.
            <br />
            <span className="text-text-dark/60 text-xs">உலகத் தரம் வாய்ந்த பிசியோதெரபி சிகிச்சை.</span>
          </p>
        </div>

        {/* Primary Action: Book Appointment */}
        <div className="flex flex-col gap-6">
          <Link href="/booking" className="relative w-full group">
            {/* Glowing background effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary-light rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            {/* Main Button Card */}
            <div className="relative flex flex-col items-center justify-center bg-beige-card rounded-[1.8rem] p-8 border border-primary/10 shadow-lg overflow-hidden active:scale-[0.98] transition-all duration-200">
              {/* Decorative subtle shine */}
              <div className="absolute inset-0 bg-card-shine opacity-30"></div>
              {/* Icon Container */}
              <div className="size-20 bg-green-gradient rounded-full flex items-center justify-center mb-5 shadow-[0_10px_20px_rgba(14,75,47,0.2)] group-hover:scale-110 transition-transform duration-300 z-10">
                <span className="material-symbols-outlined text-white text-4xl">calendar_month</span>
              </div>
              <h3 className="text-2xl font-bold text-primary z-10">Book Appointment</h3>
              <h3 className="text-xl font-medium text-primary/80 mb-2 z-10 mt-1">முன்பதிவு செய்யவும்</h3>
              <p className="text-text-dark/50 text-sm font-medium z-10">New or returning patients</p>
            </div>
          </Link>

          {/* Quick Stats / Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/40 transition-colors cursor-pointer active:scale-95">
              <div className="size-10 rounded-full bg-primary-light/20 text-primary-light flex items-center justify-center mb-2">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <span className="text-primary font-bold text-sm">Open Today</span>
              <span className="text-text-dark/60 text-xs font-medium mt-0.5">9 AM - 9 PM</span>
            </div>
            <div className="glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/40 transition-colors cursor-pointer active:scale-95">
              <div className="size-10 rounded-full bg-primary-light/20 text-primary-light flex items-center justify-center mb-2">
                <span className="material-symbols-outlined">star</span>
              </div>
              <span className="text-primary font-bold text-sm">Top Rated</span>
              <span className="text-text-dark/60 text-xs font-medium mt-0.5">5.0 Rating</span>
            </div>
          </div>


        </div>
      </main>

      {/* Bottom Navigation / Quick Contacts */}
      <nav className="fixed bottom-0 left-0 right-0 glass-nav z-50 pb-safe pt-2">
        <div className="flex justify-between items-center px-6 py-3 max-w-lg mx-auto">
          <a className="flex flex-col items-center gap-1 group w-16" href="tel:+1234567890">
            <div className="size-12 rounded-full bg-white border border-border-grey flex items-center justify-center group-active:scale-90 transition-all group-hover:border-primary/50 group-hover:bg-mint-card">
              <span className="material-symbols-outlined text-primary text-2xl">call</span>
            </div>
            <span className="text-[10px] font-bold text-text-dark/60 group-hover:text-primary">Call</span>
          </a>
          <a className="flex flex-col items-center gap-1 group w-16 -mt-8" href="#">
            <div className="size-14 rounded-full bg-green-gradient shadow-[0_4px_20px_rgba(14,75,47,0.3)] flex items-center justify-center group-active:scale-90 transition-all border-4 border-background-soft">
              <span className="material-symbols-outlined text-white text-3xl">map</span>
            </div>
            <span className="text-[10px] font-bold text-primary">Map</span>
          </a>
          <a className="flex flex-col items-center gap-1 group w-16" href="#">
            <div className="size-12 rounded-full bg-white border border-border-grey flex items-center justify-center group-active:scale-90 transition-all group-hover:border-primary-light/50 group-hover:bg-mint-card">
              <span className="material-symbols-outlined text-primary-light text-2xl">chat</span>
            </div>
            <span className="text-[10px] font-bold text-text-dark/60 group-hover:text-primary-light">Help</span>
          </a>
        </div>
        {/* Safe area spacing for iOS home indicator */}
        <div className="h-6 w-full"></div>
      </nav>

      {/* Abstract background image for texture */}
      <div
        className="fixed inset-0 z-[-1] opacity-5 pointer-events-none mix-blend-multiply"
        style={{
          backgroundImage:
            "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB82v2xirGcxRawGar6lhlogdGC0hnYLj1RI_OdcTZ5aEr-vHQAZh8cKqDjZ4FdfYgWbBn5_7I5qxFALk-wk5RSMD_NnqvdkuGChU3GI98nPNtIT0iY-xmqwoBSebiCc59-nVLpymb6RJQpl6QLiYkB_eaMpguuAtnPlWBPZ3bPtJ37EqY-X5rpNR4zwCCdsbF84zv_maHFMLEV73JkT0lm8ft7jWbTzcpW9rU-BeNRM0ACq8nDjv95wdBuouvwBDqlNajmKSI4Tgw')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </div>
  );
}
