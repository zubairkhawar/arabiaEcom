"use client";

import { useEffect, useState } from "react";
import { Plus, Phone, ChevronDown, ChevronRight, Globe2 } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { api, API_BASE } from "@/lib/api";
import { cn } from "@/lib/cn";
import { CopyField } from "@/components/ui/CopyField";
import type { PoolNumberOut, PoolAssignmentOut } from "@/lib/types";

export default function NumberPoolPage() {
  const [numbers, setNumbers] = useState<PoolNumberOut[]>([]);
  const [assignments, setAssignments] = useState<PoolAssignmentOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAssignments, setShowAssignments] = useState(false);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [n, a] = await Promise.all([
      api<PoolNumberOut[]>("/admin/pool-numbers"),
      api<PoolAssignmentOut[]>("/admin/pool-assignments"),
    ]);
    setNumbers(n);
    setAssignments(a);
    if (n.length > 0 && !expanded) setExpanded(n[0].country_code);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const byCountry: Record<string, PoolNumberOut[]> = {};
  numbers.forEach((n) => {
    byCountry[n.country_code] = byCountry[n.country_code] || [];
    byCountry[n.country_code].push(n);
  });

  return (
    <Shell
      portal="admin"
      title="Universal Number Pool"
      subtitle="50 resellers per number, auto-spillover to the next active number in the same country."
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button onClick={() => setShowAssignments(false)} className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md",
            !showAssignments ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"
          )}>Numbers by country</button>
          <button onClick={() => setShowAssignments(true)} className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md",
            showAssignments ? "bg-white text-[var(--text-primary)] shadow-sm" : "text-[var(--text-secondary)]"
          )}>Assignments</button>
        </div>
        <Button leftIcon={<Plus size={14} />} onClick={() => setOpen(true)}>Add number</Button>
      </div>

      {loading ? (
        <Card>Loading…</Card>
      ) : !showAssignments ? (
        Object.keys(byCountry).length === 0 ? (
          <Card>
            <EmptyState
              icon={<Globe2 />}
              title="No pool numbers yet"
              description="Add a number to start receiving universal-pool customers."
              action={<Button leftIcon={<Plus size={14} />} onClick={() => setOpen(true)}>Add number</Button>}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(byCountry).map(([code, nums]) => {
              const isExpanded = expanded === code;
              const totalUsed = nums.reduce((s, n) => s + n.assigned, 0);
              const totalCap = nums.reduce((s, n) => s + n.capacity, 0);
              return (
                <Card key={code} padded={false}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : code)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{nums[0].flag}</span>
                      <div className="text-left">
                        <div className="font-semibold text-[var(--text-primary)]">{nums[0].country}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{nums.length} numbers · {totalUsed} / {totalCap} resellers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block w-40">
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-[var(--accent)]" style={{ width: `${totalCap > 0 ? (totalUsed / totalCap) * 100 : 0}%` }} />
                        </div>
                      </div>
                      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                      {nums.map((n) => {
                        const used = n.capacity > 0 ? (n.assigned / n.capacity) * 100 : 0;
                        return (
                          <div key={n.id} className="px-5 py-4 flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><Phone size={15} /></div>
                              <div className="min-w-0">
                                <div className="font-mono text-sm font-medium">{n.number}</div>
                                <div className="text-xs text-[var(--text-secondary)]">
                                  {n.assigned} / {n.capacity} resellers · {n.has_token ? "WABA configured" : "no WA token"}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:w-72">
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full rounded-full" style={{
                                  width: `${used}%`,
                                  background: used >= 100 ? "var(--accent-violet)" : used > 80 ? "var(--warning)" : "var(--accent)",
                                }} />
                              </div>
                              <Badge tone={statusTone(n.status)} dot>{n.status}</Badge>
                              <button
                                onClick={async () => {
                                  const next = n.status === "disabled" ? "active" : "disabled";
                                  await api(`/admin/pool-numbers/${n.id}`, { method: "PATCH", body: { status: next } });
                                  load();
                                }}
                                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                              >
                                {n.status === "disabled" ? "Enable" : "Disable"}
                              </button>
                            </div>
                            </div>
                            {n.has_token && (
                              <>
                                <CopyField
                                  label="Meta webhook URL — paste in WhatsApp Manager"
                                  value={`${API_BASE}/webhooks/wa/pool/${n.id}`}
                                />
                                <PoolNumberMetaBox numberId={n.id} onChanged={load} />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )
      ) : (
        <Card padded={false}>
          <CardHeader title="Reseller assignments" subtitle="Current routing" className="px-5 pt-5" />
          {assignments.length === 0 ? (
            <EmptyState title="No assignments yet" description="Resellers are auto-assigned to a pool slot on their first link click." />
          ) : (
            <div className="px-2 pb-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-[var(--border)]">
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Reseller</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Country</th>
                    <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Assigned number</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.reseller_id + a.pool_number_id} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-3 py-3 font-medium">{a.reseller_name}</td>
                      <td className="px-3 py-3">{a.country_code}</td>
                      <td className="px-3 py-3 font-mono text-xs">{a.number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {open && <AddNumberModal onClose={() => setOpen(false)} onAdded={async () => { await load(); setOpen(false); }} />}
    </Shell>
  );
}

function AddNumberModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [country, setCountry] = useState("United Arab Emirates");
  const [countryCode, setCountryCode] = useState("UAE");
  const [flag, setFlag] = useState("🇦🇪");
  const [number, setNumber] = useState("");
  const [waba, setWaba] = useState("");
  const [pn, setPn] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      await api("/admin/pool-numbers", {
        method: "POST",
        body: { number, country, country_code: countryCode, flag, capacity: 50, waba_id: waba || null, phone_number_id: pn || null, access_token: token || null },
      });
      onAdded();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Add pool number" footer={
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} disabled={!number || busy}>{busy ? "Adding…" : "Add"}</Button>
      </>
    }>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United Arab Emirates" />
          </div>
          <Input label="Code" value={countryCode} onChange={(e) => setCountryCode(e.target.value.toUpperCase())} placeholder="UAE" />
        </div>
        <Input label="Flag emoji" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="🇦🇪" />
        <Input label="Phone number (E.164)" value={number} onChange={(e) => setNumber(e.target.value)} placeholder="+971 4 555 0101" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="WABA ID (optional)" value={waba} onChange={(e) => setWaba(e.target.value)} />
          <Input label="Phone Number ID (optional)" value={pn} onChange={(e) => setPn(e.target.value)} />
        </div>
        <Input label="Permanent Access Token (optional)" type="password" value={token} onChange={(e) => setToken(e.target.value)} />
        {err && <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">{err}</div>}
      </div>
    </Modal>
  );
}

interface MetaStatus {
  ok: boolean;
  status_code: number;
  display_phone_number: string | null;
  verified_name: string | null;
  code_verification_status: string | null;
  quality_rating: string | null;
  name_status: string | null;
  is_pin_enabled: boolean;
  throughput_level: string | null;
  cloud_status: string | null;
  raw: Record<string, unknown>;
}

function PoolNumberMetaBox({ numberId, onChanged }: { numberId: string; onChanged: () => void }) {
  const [status, setStatus] = useState<MetaStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const check = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const s = await api<MetaStatus>(`/admin/pool-numbers/${numberId}/meta-status`);
      setStatus(s);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Status check failed" });
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!/^\d{6}$/.test(pin)) {
      setMsg({ kind: "err", text: "PIN must be exactly 6 digits" });
      return;
    }
    if (!confirm(`Register this number with Meta using PIN ${pin}? This is a one-time activation — remember the PIN.`)) return;
    setBusy(true);
    setMsg(null);
    try {
      await api(`/admin/pool-numbers/${numberId}/register`, { method: "POST", body: { pin } });
      setMsg({ kind: "ok", text: "Registered — status should flip to CONNECTED within seconds." });
      setShowPin(false);
      setPin("");
      await check();
      onChanged();
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Register failed" });
    } finally {
      setBusy(false);
    }
  };

  const cloudStatus = status?.cloud_status;
  const connected = cloudStatus === "CONNECTED";
  const pending = cloudStatus === "PENDING";
  const chipTone = connected ? "bg-emerald-100 text-emerald-800"
    : pending ? "bg-amber-100 text-amber-800"
    : "bg-slate-100 text-slate-600";

  return (
    <div className="mt-2 rounded-lg border border-[var(--border)] bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[var(--text-secondary)]">Meta status</span>
          {status ? (
            <>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${chipTone}`}>
                {cloudStatus ?? "unknown"}
              </span>
              {status.verified_name && (
                <span className="text-[var(--text-muted)]">· {status.verified_name}</span>
              )}
              {status.throughput_level && status.throughput_level !== "NOT_APPLICABLE" && (
                <span className="text-[var(--text-muted)]">· throughput {status.throughput_level}</span>
              )}
              {status.is_pin_enabled && (
                <span className="text-emerald-700 font-medium">· 2FA on</span>
              )}
            </>
          ) : (
            <span className="text-[var(--text-muted)]">not checked</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={check}
            disabled={loading}
            className="text-xs px-2 h-7 rounded-md border border-[var(--border)] bg-white hover:bg-slate-50"
          >
            {loading ? "Checking…" : "Check status"}
          </button>
          {(pending || !connected) && (
            <button
              onClick={() => setShowPin((v) => !v)}
              className="text-xs px-2 h-7 rounded-md bg-[var(--accent)] text-white hover:bg-emerald-600"
            >
              {showPin ? "Cancel" : "Register with Meta"}
            </button>
          )}
        </div>
      </div>
      {showPin && (
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              6-digit 2FA PIN (memorize it — Meta asks for this on any future re-register)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full h-9 rounded-md border border-[var(--border)] px-3 text-sm bg-white font-mono tracking-widest"
              placeholder="524866"
            />
          </div>
          <button
            onClick={register}
            disabled={busy || pin.length !== 6}
            className="h-9 px-4 rounded-md bg-[var(--accent)] text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-50"
          >
            {busy ? "Registering…" : "Confirm"}
          </button>
        </div>
      )}
      {msg && (
        <div className={`mt-2 text-xs rounded-md px-2 py-1.5 ${
          msg.kind === "ok" ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {msg.text}
        </div>
      )}
    </div>
  );
}
