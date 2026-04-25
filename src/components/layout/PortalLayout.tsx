"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  icon: string;
  label: string;
  labelTa?: string;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  role: "admin" | "doctor" | "patient";
  userName?: string;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  admin: [
    { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard", labelTa: "டாஷ்போர்டு" },
    { href: "/admin/doctors", icon: "stethoscope", label: "Doctors", labelTa: "மருத்துவர்கள்" },
    { href: "/admin/reports", icon: "bar_chart_4_bars", label: "Reports", labelTa: "அறிக்கைகள்" },
  ],
  doctor: [
    { href: "/doctor/schedule", icon: "calendar_month", label: "Schedule", labelTa: "அட்டவணை" },
  ],
  patient: [
    { href: "/patient/dashboard", icon: "home", label: "Home", labelTa: "முகப்பு" },
    { href: "/booking", icon: "add_circle", label: "Book", labelTa: "முன்பதிவு" },
    { href: "/patient/sessions", icon: "event_available", label: "Sessions", labelTa: "சிகிச்சை" },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Super Admin",
  doctor: "Doctor Portal",
  patient: "Patient Portal",
};

export default function PortalLayout({ children, role, userName }: PortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = NAV_ITEMS[role] ?? [];

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  return (
    <div className="min-h-screen bg-background-soft flex">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 sidebar fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/15 p-1.5 flex items-center justify-center shrink-0">
            <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-xs leading-tight truncate">SKCT Physio</p>
            <p className="text-white/50 text-[10px]">{ROLE_LABELS[role]}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`sidebar-item ${pathname === item.href || pathname.startsWith(item.href + "/") ? "active" : ""}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
                {item.labelTa && <span className="ml-auto text-[10px] opacity-40">{item.labelTa}</span>}
              </div>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {userName?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userName ?? "User"}</p>
              <p className="text-white/40 text-[11px] truncate capitalize">{role}</p>
            </div>
            <button onClick={logout} title="Logout" className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-white/60 text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 sidebar h-full flex flex-col z-10">
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 p-1.5 flex items-center justify-center">
                  <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">SKCT Physio</p>
                  <p className="text-white/50 text-[10px]">{ROLE_LABELS[role]}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white/60 text-lg">close</span>
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`sidebar-item ${pathname === item.href ? "active" : ""}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-white/10">
              <button onClick={logout} className="sidebar-item w-full text-red-300 hover:bg-red-500/20">
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 min-h-screen">

        {/* Top header (mobile hamburger + desktop breadcrumb) */}
        <header className="sticky top-0 z-30 bg-background-soft/90 backdrop-blur-md border-b border-border-grey px-4 lg:px-6 xl:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg hover:bg-white flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-primary text-xl">menu</span>
          </button>
          <div className="flex-1">
            <p className="text-xs text-text-muted font-medium hidden lg:block">
              {navItems.find((i) => pathname.startsWith(i.href))?.label ?? ""}
            </p>
            <p className="text-sm font-bold text-primary lg:hidden">SKCT Physio</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-2 text-sm text-text-muted">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {userName?.[0] ?? "U"}
              </div>
              <span className="font-medium text-text-dark">{userName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 xl:px-8 py-5 lg:py-7 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 mobile-nav">
        <div className="flex items-center justify-around px-2 py-2 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[60px]">
                <span className={`material-symbols-outlined text-2xl transition-colors ${isActive ? "text-primary" : "text-text-muted"}`}>
                  {item.icon}
                </span>
                <span className={`text-[10px] font-semibold transition-colors ${isActive ? "text-primary" : "text-text-muted"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
