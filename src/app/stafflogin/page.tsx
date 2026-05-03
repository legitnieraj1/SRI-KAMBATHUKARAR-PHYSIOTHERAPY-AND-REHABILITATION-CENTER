"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Invalid credentials"); return; }
      const role = data.data?.user?.role;
      if (role === "SUPER_ADMIN") router.push("/admin/dashboard");
      else if (role === "DOCTOR") router.push("/doctor/schedule");
      else setError("Access denied for this account");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-soft flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] xl:w-[40%] bg-primary p-10 xl:p-14 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/15 p-1.5">
            <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">SKCT Physio</p>
            <p className="text-white/50 text-xs">Staff Portal</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            Welcome back<br />to your<br />workspace.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Manage appointments, track patient progress, and monitor revenue — all in one place.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {["Patient Management", "Revenue Reports", "Session Tracking", "Doctor Scheduling"].map((f) => (
              <span key={f} className="text-xs font-medium text-white/70 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                {f}
              </span>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs relative z-10">
          Sri Kambathukarar Physiotherapy &amp; Rehabilitation Center
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-5 py-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 p-1.5">
              <img src="/skct.png" alt="SKCT" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-primary text-sm">SKCT Physio</p>
              <p className="text-text-muted text-xs">Staff Portal</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-dark mb-1">Sign in</h2>
          <p className="text-text-muted text-sm mb-7">பணியாளர் உள்நுழைவு · Doctor &amp; Admin access</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  className="input pl-11"
                  placeholder="9876543210"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-text-dark mb-1.5 uppercase tracking-wide opacity-70">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input pr-11"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
                : <>Sign In <span className="material-symbols-outlined text-lg">arrow_forward</span></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border-grey text-center space-y-3">
            <p className="text-xs text-text-muted">
              Need to book an appointment?{" "}
              <Link href="/booking" className="text-primary font-semibold hover:underline underline-offset-2">
                Book here
              </Link>
            </p>
            <Link href="/" className="text-xs text-text-muted hover:text-primary transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
