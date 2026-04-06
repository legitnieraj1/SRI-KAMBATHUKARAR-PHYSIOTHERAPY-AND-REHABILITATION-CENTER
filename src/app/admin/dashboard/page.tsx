"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="bg-background-soft font-display text-text-dark antialiased overflow-hidden select-none min-h-screen">
      {/* Ambient Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="blob bg-primary w-64 h-64 rounded-full top-[-50px] left-[-50px]"></div>
        <div className="blob bg-accent w-80 h-80 rounded-full bottom-[-100px] right-[-50px] animation-delay-2000"></div>
        <div className="blob bg-primary w-48 h-48 rounded-full top-[40%] left-[20%] opacity-10"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col h-screen w-full max-w-md mx-auto overflow-hidden shadow-2xl bg-transparent">
        {/* Header Section */}
        <header className="flex items-center justify-between px-6 pt-10 pb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-primary to-accent">
                <img
                  alt="Dr. Arun Portrait"
                  className="w-full h-full rounded-full object-cover border-2 border-background-soft"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBROOxfCEM9GjDApDbSUTiyAN5VpENOqUvutw0QagwSCa4HZLWEdwCJEogGiGCpZ9C74Wwf9ZcPBO9G-HHVy0dyxrsLaqoYEWsWj5entGDj89k7odjzT6Je8DYhVdSk4en__ntBIkZP15ArQ3W408xK5eDz9ooxYK8LBgAM1KJiwDvKZ7pLxhhmBgsgBTXeOxYSyVDAexXBo-rkhyH3egGAKle6V7x1ffDIdMsIuENZGQSm8D4-oQebGp63grkelsoVqvCVMKvuFeM"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-background-soft rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-tight text-primary">Hello, Dr. Arun</h1>
              <p className="text-xs text-text-dark/70 font-medium">வணக்கம், டாக்டர் அருண்</p>
            </div>
          </div>
          <button className="glass-card w-10 h-10 rounded-full flex items-center justify-center relative active:scale-95 transition-transform border-border-grey">
            <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border border-background-soft"></span>
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 space-y-6">
          {/* Date Filter & Quick Stats Row */}
          <div className="flex items-center justify-between">
            <button className="glass-card px-4 py-2 rounded-full flex items-center gap-2 active:scale-95 transition-transform border-border-grey">
              <span className="text-xs font-semibold text-primary">This Month / இந்த மாதம்</span>
              <span className="material-symbols-outlined text-primary/60 text-[16px]">expand_more</span>
            </button>
            <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-1 rounded-lg border border-accent/20">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span className="text-xs font-bold">+12%</span>
            </div>
          </div>

          {/* Hero Revenue Card */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden group border-border-grey">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-primary text-[48px]">attach_money</span>
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <p className="text-text-dark/60 text-sm font-medium">Total Revenue / மொத்த வருவாய்</p>
              <h2 className="text-4xl font-bold text-primary tracking-tight">₹12.5L</h2>
              <p className="text-xs text-text-dark/40 mt-1">Updated 2 mins ago</p>
            </div>
            {/* Abstract Chart Line */}
            <div className="mt-6 h-16 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#155F3A" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#2F7D57" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,35 Q10,30 20,25 T40,20 T60,10 T80,15 T100,5 V40 H0 Z" fill="url(#chartGradient)"></path>
                <path d="M0,35 Q10,30 20,25 T40,20 T60,10 T80,15 T100,5" fill="none" stroke="#155F3A" strokeLinecap="round" strokeWidth="2.5"></path>
              </svg>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Active Patients */}
            <div className="glass-card-accent rounded-xl p-5 flex flex-col gap-3 transition-colors border-border-grey">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">vital_signs</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">42</p>
                <p className="text-xs text-text-dark/70 font-medium leading-tight">Active Patients<br /><span className="opacity-60 text-[10px]">நோயாளிகள்</span></p>
              </div>
            </div>
            {/* Staff Utilization */}
            <div className="glass-card rounded-xl p-5 flex flex-col gap-3 transition-colors border-border-grey">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <span className="material-symbols-outlined text-[20px]">stethoscope</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">85%</p>
                <p className="text-xs text-text-dark/70 font-medium leading-tight">Staff Utilization<br /><span className="opacity-60 text-[10px]">ஊழியர் பயன்பாடு</span></p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">Quick Actions</h3>
              <span className="text-xs text-accent font-semibold cursor-pointer">View All</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center group-active:scale-95 transition-all group-active:bg-primary/10 border-border-grey">
                  <span className="material-symbols-outlined text-primary text-[24px]">group_add</span>
                </div>
                <span className="text-[10px] font-medium text-text-dark/80 text-center">Staff<br />ஊழியர்</span>
              </button>
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center group-active:scale-95 transition-all group-active:bg-primary/10 border-border-grey">
                  <span className="material-symbols-outlined text-primary text-[24px]">lab_profile</span>
                </div>
                <span className="text-[10px] font-medium text-text-dark/80 text-center">Reports<br />அறிக்கைகள்</span>
              </button>
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center group-active:scale-95 transition-all group-active:bg-primary/10 border-border-grey">
                  <span className="material-symbols-outlined text-primary text-[24px]">inventory_2</span>
                </div>
                <span className="text-[10px] font-medium text-text-dark/80 text-center">Stock<br />சரக்கு</span>
              </button>
              <button className="flex flex-col items-center gap-2 group">
                <div className="w-14 h-14 glass-card rounded-2xl flex items-center justify-center group-active:scale-95 transition-all group-active:bg-primary/10 border-border-grey">
                  <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                </div>
                <span className="text-[10px] font-medium text-text-dark/80 text-center">Settings<br />அமைப்புகள்</span>
              </button>
            </div>
          </div>

          {/* Staff Status List */}
          <div className="flex flex-col gap-4 pb-4">
            <h3 className="text-lg font-bold text-primary">On Duty Staff <span className="text-sm font-normal text-text-dark/50 ml-2">/ பணியில்</span></h3>
            <div className="glass-card rounded-xl p-1 flex flex-col border-border-grey overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-border-grey hover:bg-background-light/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <img
                    alt="Dr. Sarah"
                    className="w-10 h-10 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCn90ja-4DKAf5_-5DauKOOfVE1swZxkXt4HYjUql3XtHvDxWxQb4SRAvnnIhI7y5urMgTdOxow-RkK6x__3F2k2NBe8YD3xhKqu4us_NtJXpWO7YZ4v5hlf-dCWj4UxxUbtZix7cLikUDYxpAYRMnsTABXfsQ5Gg2hocPdwd7985fyH8kANvaqs63v6kzs65C9XH52MBQratj_0w-ZM8HG8CpEtQL4vkmrOHv3GwdDANAYyLiZvSUTsBAtIOZE6V13NGY9n4VvtIM"
                  />
                  <div>
                    <p className="text-sm font-bold text-primary">Dr. Sarah K.</p>
                    <p className="text-xs text-accent">Physiotherapist</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-accent/20 rounded text-[10px] font-bold text-accent uppercase tracking-wide">Active</div>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-background-light/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <img
                    alt="Nurse Rajesh"
                    className="w-10 h-10 rounded-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpinUA-yoDRtn5EJKBjgUnDk8e2UUjZtkN3Nokk9ceDt-vZvZl9thIKgUTbonJrGG45aMJhGp_TjSr0zfCS8UPVpxxZHegMn9dELqNus3utge_u6U8vIYCpIDHP4KKgfLBrv01gY2IeVIoxSC-gLI29R86--4dry-u3MHqERxv2a6eeiXAloagFClp2XH4vvl6fBBc4fcyEERctPoqdI5ux-eDU1KiD3I2pXmwnDrl115eOp-5ANWovM4XqT5iAYWG-pjuSHprY4I"
                  />
                  <div>
                    <p className="text-sm font-bold text-primary">Rajesh M.</p>
                    <p className="text-xs text-accent">Assistant</p>
                  </div>
                </div>
                <div className="px-2 py-1 bg-beige-card rounded text-[10px] font-bold text-text-dark/60 uppercase tracking-wide">Break</div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation Bar (Floating) */}
        <div className="absolute bottom-6 left-0 right-0 px-6 z-50">
          <div className="glass-card rounded-full px-6 py-4 flex justify-between items-center shadow-2xl backdrop-blur-xl bg-white/90 border border-border-grey">
            <Link className="flex flex-col items-center gap-1 text-primary" href="/">
              <span className="material-symbols-outlined text-[24px]">home</span>
              <span className="text-[10px] font-bold">Home</span>
            </Link>
            <Link className="flex flex-col items-center gap-1 text-text-dark/40 hover:text-primary transition-colors" href="/doctor/schedule">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
              <span className="text-[10px] font-medium">Schedule</span>
            </Link>
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center -mt-8 shadow-lg shadow-primary/30 border-4 border-background-soft">
              <span className="material-symbols-outlined text-white text-[28px]">add</span>
            </div>
            <a className="flex flex-col items-center gap-1 text-text-dark/40 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-[24px]">group</span>
              <span className="text-[10px] font-medium">Patients</span>
            </a>
            <a className="flex flex-col items-center gap-1 text-text-dark/40 hover:text-primary transition-colors" href="#">
              <span className="material-symbols-outlined text-[24px]">payments</span>
              <span className="text-[10px] font-medium">Finance</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick Support Floating Bar */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2">
        <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">call</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">map</span>
        </button>
        <button className="w-10 h-10 rounded-full bg-text-dark text-white flex items-center justify-center shadow-lg active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
      </div>
    </div>
  );
}
