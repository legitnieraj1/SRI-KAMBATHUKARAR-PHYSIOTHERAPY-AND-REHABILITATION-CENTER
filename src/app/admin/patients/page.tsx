"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import PortalLayout from "@/components/layout/PortalLayout";

interface Patient {
  id: string;
  name: string;
  phone: string;
  ref_number: string;
  registered_at: string;
  total_bookings: number;
  completed_sessions: number;
}

export default function AdminPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [adminName, setAdminName] = useState("Admin");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchPatients = useCallback(async (q: string, s: string, o: string, p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ search: q, sort: s, order: o, page: String(p), limit: String(limit) });
    const res = await fetch(`/api/patients?${params}`);
    const data = await res.json();
    if (!res.ok) { router.push("/stafflogin"); return; }
    setPatients(data.data?.patients ?? []);
    setTotal(data.data?.total ?? 0);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((me) => {
      if (me.success) setAdminName(me.data.name);
    });
    fetchPatients("", "created_at", "desc", 1);
  }, [fetchPatients]);

  const handleSearch = (v: string) => {
    setSearch(v); setPage(1);
    fetchPatients(v, sort, order, 1);
  };

  const handleSort = (col: string) => {
    const newOrder = sort === col && order === "desc" ? "asc" : "desc";
    setSort(col); setOrder(newOrder); setPage(1);
    fetchPatients(search, col, newOrder, 1);
  };

  const downloadCSV = () => {
    const headers = ["Ref No", "Name", "Phone", "Registered", "Bookings", "Completed Sessions"];
    const rows = patients.map((p) => [
      p.ref_number,
      `"${p.name}"`,
      p.phone,
      new Date(p.registered_at).toLocaleDateString("en-IN"),
      p.total_bookings,
      p.completed_sessions,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `patients-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="material-symbols-outlined text-sm ml-0.5 opacity-50">
      {sort === col ? (order === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );

  return (
    <PortalLayout role="admin" userName={adminName}>
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-text-dark">Patients</h1>
          <p className="text-sm text-text-muted mt-0.5">{total} registered patients</p>
        </div>
        <button onClick={downloadCSV} disabled={patients.length === 0} className="btn-secondary gap-2">
          <span className="material-symbols-outlined text-base">download</span>
          Export CSV
        </button>
      </div>

      {/* Search + sort bar */}
      <div className="card p-4 mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, phone or ref no…"
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="input sm:w-48"
        >
          <option value="created_at">Sort: Date Registered</option>
          <option value="name">Sort: Name</option>
          <option value="phone">Sort: Phone</option>
          <option value="ref_number">Sort: Ref No</option>
        </select>
        <button
          onClick={() => { const newO = order === "asc" ? "desc" : "asc"; setOrder(newO); fetchPatients(search, sort, newO, page); }}
          className="btn-secondary px-3"
          title={order === "asc" ? "Ascending" : "Descending"}
        >
          <span className="material-symbols-outlined text-base">{order === "asc" ? "arrow_upward" : "arrow_downward"}</span>
        </button>
      </div>

      {/* Desktop table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-4xl text-primary/20 block mb-3">group</span>
            <p className="font-bold text-text-dark">No patients found</p>
            <p className="text-sm text-text-muted mt-1">Try a different search term</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th><button onClick={() => handleSort("ref_number")} className="flex items-center gap-0.5">Ref No <SortIcon col="ref_number" /></button></th>
                    <th><button onClick={() => handleSort("name")} className="flex items-center gap-0.5">Name <SortIcon col="name" /></button></th>
                    <th><button onClick={() => handleSort("phone")} className="flex items-center gap-0.5">Phone <SortIcon col="phone" /></button></th>
                    <th><button onClick={() => handleSort("created_at")} className="flex items-center gap-0.5">Registered <SortIcon col="created_at" /></button></th>
                    <th>Bookings</th>
                    <th>Sessions Done</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className="font-mono text-xs font-bold text-primary bg-primary/8 px-2 py-1 rounded-lg">{p.ref_number}</span>
                      </td>
                      <td className="font-semibold">{p.name}</td>
                      <td className="text-text-muted">{p.phone}</td>
                      <td className="text-text-muted text-sm">
                        {new Date(p.registered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td>{p.total_bookings}</td>
                      <td>
                        <span className={`badge ${p.completed_sessions > 0 ? "badge-green" : "badge-grey"}`}>{p.completed_sessions}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border-grey">
              {patients.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-dark truncate">{p.name}</p>
                      <span className="font-mono text-[10px] font-bold text-primary bg-primary/8 px-1.5 py-0.5 rounded shrink-0">{p.ref_number}</span>
                    </div>
                    <p className="text-xs text-text-muted">{p.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-text-dark">{p.total_bookings} bookings</p>
                    <p className="text-xs text-text-muted">{p.completed_sessions} done</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <p className="text-text-muted">Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => { const p = page - 1; setPage(p); fetchPatients(search, sort, order, p); }}
              className="btn-secondary py-1.5 px-3 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>
            <button
              disabled={page * limit >= total}
              onClick={() => { const p = page + 1; setPage(p); fetchPatients(search, sort, order, p); }}
              className="btn-secondary py-1.5 px-3 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}
