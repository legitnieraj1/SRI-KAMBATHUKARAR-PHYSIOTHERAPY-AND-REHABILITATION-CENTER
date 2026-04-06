"use client";

import Link from "next/link";

export default function DoctorSchedule() {
  const days = [
    { day: "Mon", date: 12, active: true },
    { day: "Tue", date: 13, active: false },
    { day: "Wed", date: 14, active: false },
    { day: "Thu", date: 15, active: false },
    { day: "Fri", date: 16, active: false },
  ];

  return (
    <div className="bg-background-light text-text-primary font-display min-h-screen flex flex-col overflow-hidden relative selection:bg-primary selection:text-white">
      {/* Ambient Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]"></div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-full overflow-y-auto no-scrollbar pb-24">
        {/* Header Section */}
        <header className="pt-14 px-6 pb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-primary-gradient-start to-primary-gradient-end">
                <div className="w-full h-full rounded-full bg-background-light p-0.5">
                  <img
                    alt="Doctor profile portrait"
                    className="w-full h-full rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZKiYVd2jmMsQVrGM1-PkjoyTQMnyGzmh3-xBbD1zkt4yg8mkjXFiQNZJ5jEdHG8DUaJ7nSVwZfe9zkH4ZNB-manm9a12WVTRzGmeDbQBuRjx6tO6RGjVthSwwS5z3XrcRfLgFiII0S9_8TNHz9CVsx6K9Z-jPwHCBbQkYTd8VwJdR3VYL7qPD025j0zMcfavA747NnaztJpKUUTkxbP_AGmINR9lOk-Mwkt7pk0aNIuAOK2lkEF2Q761cV4p4BKf0q_Aeg7PpDTc"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-accent border-2 border-background-light rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-primary leading-tight">
                Dr. Anjali <br />
                <span className="text-sm font-medium text-text-secondary">காலை வணக்கம்</span>
              </h1>
            </div>
          </div>
          <button className="glass-button w-12 h-12 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors relative">
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-3 right-3.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </header>

        {/* Calendar Strip */}
        <section className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-primary">September 2023 / <span className="text-text-secondary text-base font-medium">செப்டம்பர்</span></h2>
            <button className="text-accent text-sm font-bold">View All</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
            {days.map((item) => (
              <div
                key={item.date}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-24 rounded-2xl cursor-pointer transition-all ${
                  item.active
                    ? "bg-gradient-to-b from-primary-gradient-start to-primary-gradient-end shadow-[0_8px_16px_rgba(14,75,47,0.2)] text-white"
                    : "glass-card text-text-secondary border-border-grey"
                }`}
              >
                <span className={`text-xs font-medium mb-1 ${item.active ? "opacity-80" : "opacity-60"}`}>{item.day}</span>
                <span className={`text-2xl font-bold ${item.active ? "text-white" : "text-text-primary"}`}>{item.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Overview */}
        <section className="px-6 mb-6 grid grid-cols-2 gap-4">
          <div className="glass-card p-4 rounded-2xl flex flex-col bg-mint-card border-transparent">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <span className="material-symbols-outlined text-[20px]">schedule</span>
              <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">4</span>
            <span className="text-xs text-text-secondary">Patients remaining</span>
          </div>
          <div className="glass-card p-4 rounded-2xl flex flex-col bg-beige-card border-transparent">
            <div className="flex items-center gap-2 mb-2 text-accent">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span className="text-xs font-bold uppercase tracking-wider">Finished</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">2</span>
            <span className="text-xs text-text-secondary">Patients treated</span>
          </div>
        </section>

        {/* Appointments List */}
        <section className="px-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-primary">Today &apos;s Schedule <span className="font-normal text-text-secondary text-base">/ இன்றைய அட்டவணை</span></h3>
          </div>
          {/* Current Appointment (Highlighted) */}
          <div className="glass-card glass-highlight rounded-2xl p-5 relative overflow-hidden group border-none">
            <div className="absolute top-0 right-0 px-3 py-1 bg-primary/10 rounded-bl-xl text-[10px] font-bold text-primary border-l border-b border-primary/10">
              IN PROGRESS / நடந்து கொண்டிருக்கிறது
            </div>
            <div className="flex items-start gap-4 mb-4 mt-2">
              <div className="relative w-16 h-16 shrink-0">
                <img
                  alt="Portrait of elderly female patient"
                  className="w-full h-full rounded-xl object-cover border border-border-grey"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD4yyhsnnXJOmXPhtt035Q4bew0sTJOeuV7mNWDBncCaeeSoVvlFEH0VnmLjhaEJ9B4q1_J7QVk03zAxhmKohvHo_GCw4pa6XElIdHJSZHwQpJHScmY85QTqqd_szKd6C_eotE18vR4RkchA9v-rH-6kB2mLNK8m4cduo0fUn1GAVN3Wy8IlkhP7Zc9oO4CIqyCQ1r2M7Aeujl41skzcD906StFvAcYCpLn4mbUlTxZF3WI1e-vQwPMwYj8kidmeCxv0-Epz0WT_w"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-0.5">Mrs. Lakshmi</h4>
                <p className="text-sm text-text-secondary mb-1">Knee Rehab / முழங்கால் மறுவாழ்வு</p>
                <div className="flex items-center gap-2 text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded w-fit">
                  <span className="material-symbols-outlined text-[14px]">access_time</span>
                  09:00 AM - 10:00 AM
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_small</span>
                Verify / சரிபார்
              </button>
              <button className="w-12 h-11 flex items-center justify-center rounded-xl glass-button text-primary hover:bg-primary/10 transition-colors">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>
          {/* Upcoming Appointment */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden border-border-grey">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative w-16 h-16 shrink-0">
                <img
                  alt="Portrait of middle aged male patient"
                  className="w-full h-full rounded-xl object-cover border border-border-grey grayscale opacity-80"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7GLTD7IPH5CMQ3D53jr-A5ZHu86fmTB43ytD4iXv2b9wOC3jK2y-bD-lOKANrcMjgSWN7wIzrSJiJ-RCOvzdIyCSeYHf9_vPEMIUK8itPyJ97am6F5UWkQEuWEraoifeAdggObpKLyQgDKw22b9psuLsiiV1q_vSHTUaezhBykCi-WubOuSjDa_dKBVRiTL3nY0LXuMKExjbkWbp6utkXtciTaFXiOIo1hYsA_anGx42jBtb2L0dfrTtUovXYeAv8ByMpNut1AFk"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-0.5">Mr. Sharma</h4>
                <p className="text-sm text-text-secondary mb-1">Lower Back Pain / முதுகு வலி</p>
                <div className="flex items-center gap-2 text-xs font-medium text-text-secondary bg-black/5 px-2 py-1 rounded w-fit border border-border-grey/50">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  10:30 AM - 11:30 AM
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-white hover:bg-accent/5 border border-border-grey text-primary font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                Start Session / தொடங்கு
              </button>
              <button className="w-12 h-11 flex items-center justify-center rounded-xl glass-button text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors">
                <span className="material-symbols-outlined">visibility</span>
              </button>
            </div>
          </div>
          {/* Bottom Spacer for Nav */}
          <div className="h-8"></div>
        </section>
        {/* Floating Action Button */}
        <button className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-primary-gradient-start to-accent rounded-full shadow-[0_8px_20px_rgba(14,75,47,0.3)] flex items-center justify-center text-white z-20 hover:scale-105 transition-transform">
          <span className="material-symbols-outlined text-[28px]">add</span>
        </button>
      </main>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-30 glass-nav pb-5 pt-3 px-6">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <Link className="flex flex-col items-center gap-1 group" href="/doctor/schedule">
            <div className="p-2 rounded-xl bg-primary/10 text-primary transition-colors">
              <span className="material-symbols-outlined filled text-[24px]">calendar_month</span>
            </div>
            <span className="text-[10px] font-bold text-primary tracking-wide">Schedule</span>
          </Link>
          <a className="flex flex-col items-center gap-1 group" href="#">
            <div className="p-2 rounded-xl text-text-secondary group-hover:bg-primary/5 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">groups</span>
            </div>
            <span className="text-[10px] font-medium text-text-secondary group-hover:text-primary tracking-wide">Patients</span>
          </a>
          <a className="flex flex-col items-center gap-1 group" href="#">
            <div className="p-2 rounded-xl text-text-secondary group-hover:bg-primary/5 group-hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[24px]">settings</span>
            </div>
            <span className="text-[10px] font-medium text-text-secondary group-hover:text-primary tracking-wide">Settings</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
