"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login and redirect to dashboard
    router.push("/admin/dashboard");
  };

  return (
    <div className="bg-background-soft text-text-dark font-display antialiased min-h-screen flex flex-col justify-center items-center relative overflow-hidden selection:bg-primary selection:text-white px-6">
      {/* Ambient Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center size-16 mx-auto rounded-2xl bg-white/80 border border-primary/20 backdrop-blur-sm p-1.5 shadow-sm mb-6">
            <img src="/skct.png" alt="SKCT Logo" className="w-full h-full object-contain object-center" />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-1">Staff Access</h1>
          <p className="text-sm text-text-dark/60 font-medium">பணியாளர் உள்நுழைவு</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card bg-mint-card/50 rounded-3xl p-8 flex flex-col gap-5 border border-primary/10 shadow-lg shadow-primary/5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary tracking-wide uppercase opacity-80" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-xl">mail</span>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/50 border border-border-grey rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                placeholder="staff@kambathukarar.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-primary tracking-wide uppercase opacity-80" htmlFor="password">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 text-xl">lock</span>
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white/50 border border-border-grey rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-green-gradient hover:opacity-90 text-white rounded-xl py-3.5 font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2">
            <span>Login to Dashboard</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-dark/50 font-medium">
          <Link href="/" className="hover:text-primary hover:underline underline-offset-2 transition-all flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Home / முகப்பு
          </Link>
        </div>
      </div>
    </div>
  );
}
