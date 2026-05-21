"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [gpayQrUrl, setGpayQrUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([me, settings]) => {
      if (!me.success) { router.push("/stafflogin"); return; }
      setAdminName(me.data.name);
      if (settings.success) setGpayQrUrl(settings.data?.gpay_qr_url ?? "");
    });
  }, [router]);

  const saveGpayQr = async () => {
    setSaving(true); setError(""); setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "gpay_qr_url", value: gpayQrUrl }),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    else { const d = await res.json(); setError(d.error ?? "Failed to save"); }
  };

  return (
    <PortalLayout role="admin" userName={adminName}>
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Settings</h1>
        <p className="text-sm text-text-muted mt-0.5">Payment and clinic configuration</p>
      </div>

      {/* GPay QR */}
      <div className="card p-6 max-w-lg">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">qr_code_2</span>
          </div>
          <div>
            <p className="font-bold text-text-dark">GPay QR Code</p>
            <p className="text-xs text-text-muted">Image URL displayed to doctor when patient pays via GPay</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-dark mb-2 uppercase tracking-wide opacity-70">QR Image URL</label>
            <input
              type="url"
              value={gpayQrUrl}
              onChange={(e) => setGpayQrUrl(e.target.value)}
              placeholder="https://your-storage-url/gpay-qr.png"
              className="input w-full"
            />
            <p className="text-xs text-text-muted mt-1.5">
              Upload your GPay QR image to Supabase Storage or any image host, then paste the URL here.
            </p>
          </div>

          {/* Preview */}
          {gpayQrUrl && (
            <div className="rounded-xl border-2 border-dashed border-border-grey p-4 flex flex-col items-center gap-3">
              <p className="text-xs text-text-muted font-semibold uppercase tracking-wide">Preview</p>
              <img
                src={gpayQrUrl}
                alt="GPay QR"
                className="w-40 h-40 object-contain rounded-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-700 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>{error}
            </div>
          )}

          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm text-green-700 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>Saved successfully
            </div>
          )}

          <button onClick={saveGpayQr} disabled={saving} className="btn-primary w-full py-2.5">
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-base">save</span>Save QR URL</>
            )}
          </button>
        </div>
      </div>
    </PortalLayout>
  );
}
