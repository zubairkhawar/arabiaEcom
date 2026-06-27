"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Send, Bot, UserRound, Lock, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { useDateRange } from "@/lib/dateRange";
import { cn } from "@/lib/cn";
import { relTime, money } from "@/lib/format";

type ChatMode = "ai" | "human" | "pending_human";

interface ChatSummary {
  id: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string;
  channel: string;
  mode: ChatMode;
  unread: number;
  last_message: string | null;
  last_message_at: string | null;
  reseller_name?: string;
}

interface MessageOut {
  id: string;
  sender: "customer" | "ai" | "human";
  text: string;
  created_at: string;
}

interface ChatDetail {
  id: string;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string;
  customer_location: string | null;
  customer_total_orders: number;
  customer_total_spent: number;
  channel: string;
  mode: ChatMode;
  click_session_id: string | null;
  src_platform: string | null;
  draft_items: Array<Record<string, unknown>>;
  messages: MessageOut[];
}

export function LiveChatPanel({ scope = "reseller" }: { scope?: "reseller" | "admin" }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [active, setActive] = useState<ChatDetail | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listEndpoint = scope === "admin" ? "/admin/chats" : "/chats";

  const loadList = async () => {
    try {
      const rows = await api<ChatSummary[]>(listEndpoint);
      setChats(rows);
      if (!activeId && rows.length > 0) {
        setActiveId(rows[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadActive = async (id: string) => {
    const detail = await api<ChatDetail>(`/chats/${id}`);
    setActive(detail);
  };

  useEffect(() => {
    loadList();
    const t = setInterval(loadList, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (activeId) loadActive(activeId).catch(() => {});
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  const { range } = useDateRange();
  const filtered = useMemo(() => {
    const cutoff = Date.now() - range * 24 * 3600 * 1000;
    return chats.filter((c) => {
      if (c.last_message_at && new Date(c.last_message_at).getTime() < cutoff) return false;
      if (filter === "ai" && c.mode !== "ai") return false;
      if (filter === "human" && c.mode !== "human") return false;
      if (filter === "unread" && c.unread === 0) return false;
      if (q && !(c.customer_name ?? "").toLowerCase().includes(q.toLowerCase())
        && !c.customer_phone.includes(q))
        return false;
      return true;
    });
  }, [chats, range, filter, q]);

  const setMode = async (mode: "ai" | "human") => {
    if (!active) return;
    setBusy(true);
    try {
      const next = await api<ChatDetail>(`/chats/${active.id}/mode`, {
        method: "POST",
        body: { mode },
      });
      setActive(next);
      await loadList();
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!active || !draft.trim() || active.mode !== "human") return;
    setBusy(true);
    try {
      await api(`/chats/${active.id}/reply`, {
        method: "POST",
        body: { text: draft.trim() },
      });
      setDraft("");
      await loadActive(active.id);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-145px)] flex items-center justify-center rounded-2xl border border-[var(--border)] bg-white">
        Loading chats…
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="h-[calc(100vh-145px)] rounded-2xl border border-[var(--border)] bg-white flex items-center justify-center">
        <EmptyState
          icon={<Bot />}
          title="No chats yet"
          description="When a customer messages your WhatsApp number, the conversation will appear here."
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-145px)] grid grid-cols-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_320px] rounded-2xl border border-[var(--border)] bg-white overflow-hidden card-shadow">
      {/* Left: chat list */}
      <aside className="border-r border-[var(--border)] flex flex-col min-h-0">
        <div className="p-3 border-b border-[var(--border)] space-y-2.5">
          <Input placeholder="Search" leftIcon={<Search size={14} />} value={q} onChange={(e) => setQ(e.target.value)} />
          <Tabs
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: "all", label: "All" },
              { id: "ai", label: "AI" },
              { id: "human", label: "Human" },
              { id: "unread", label: "Unread" },
            ]}
          />
        </div>
        <ul className="flex-1 overflow-y-auto scrollbar-thin">
          {filtered.map((c) => {
            const isActive = c.id === activeId;
            return (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 border-b border-[var(--border)] flex items-start gap-3 hover:bg-slate-50",
                    isActive && "bg-[var(--accent-soft)] border-l-2 border-l-[var(--accent)]"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar name={c.customer_name || c.customer_phone} size={38} />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white",
                        c.mode === "ai" ? "bg-[var(--accent)]" : "bg-[var(--warning)]"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">
                        {c.customer_name || c.customer_phone}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                        {c.last_message_at ? relTime(c.last_message_at) : ""}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {c.last_message ?? "—"}
                    </div>
                    {c.reseller_name && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                        {c.reseller_name}
                      </div>
                    )}
                  </div>
                  {c.unread > 0 && (
                    <span className="bg-[var(--accent)] text-white text-[10px] font-semibold px-1.5 rounded-full min-w-[18px] text-center">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Center: conversation */}
      <section className="flex flex-col min-h-0">
        {active ? (
          <>
            <header className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3">
              <Avatar name={active.customer_name || active.customer_phone} size={36} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{active.customer_name || "Unknown"}</div>
                <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <span>{active.customer_phone}</span>
                  <span>·</span>
                  <Badge tone={active.channel === "whatsapp" ? "success" : "violet"} dot>
                    {active.channel}
                  </Badge>
                  {active.src_platform && (
                    <>
                      <span>·</span>
                      <Badge tone="info">from {active.src_platform}</Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {active.mode === "ai" && (
                  <>
                    <Badge tone="success" dot>AI is handling</Badge>
                    <Button variant="outline" size="sm" leftIcon={<UserRound size={14} />} onClick={() => setMode("human")} disabled={busy}>
                      Take over
                    </Button>
                  </>
                )}
                {active.mode === "pending_human" && (
                  <>
                    <Badge tone="warning" dot>Customer asked for a real agent</Badge>
                    <Button size="sm" leftIcon={<UserRound size={14} />} onClick={() => setMode("human")} disabled={busy}>
                      Join chat
                    </Button>
                  </>
                )}
                {active.mode === "human" && (
                  <>
                    <Badge tone="warning" dot>Human · AI paused</Badge>
                    <Button size="sm" leftIcon={<Bot size={14} />} onClick={() => setMode("ai")} disabled={busy}>
                      Hand back to AI
                    </Button>
                  </>
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40 scrollbar-thin">
              {active.mode === "pending_human" && (
                <div className="mb-4 mx-auto max-w-md text-center bg-amber-50 border border-amber-300 text-amber-900 rounded-xl px-3 py-2 text-xs">
                  <strong>Real-agent requested.</strong> AI has paused. Click "Join chat" to reply.
                </div>
              )}
              {active.mode === "human" && (
                <div className="mb-4 mx-auto max-w-md text-center bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs">
                  AI paused — you are replying as a human.
                </div>
              )}
              <div className="space-y-3">
                {active.messages.map((m) => {
                  const fromCustomer = m.sender === "customer";
                  return (
                    <div key={m.id} className={cn("flex", fromCustomer ? "justify-start" : "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                          fromCustomer
                            ? "bg-white border border-[var(--border)] rounded-tl-sm"
                            : m.sender === "ai"
                            ? "bg-emerald-500 text-white rounded-tr-sm"
                            : "bg-amber-100 text-amber-900 border border-amber-200 rounded-tr-sm"
                        )}
                      >
                        {m.text}
                        <div className="text-[10px] mt-1 opacity-60 text-right">{relTime(m.created_at)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            <footer className="p-3 border-t border-[var(--border)] bg-white">
              {active.mode === "ai" && (
                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-slate-100 rounded-lg px-3 py-2.5">
                  <Lock size={14} /> AI is handling — you can take over if you need to.
                </div>
              )}
              {active.mode === "pending_human" && (
                <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <Lock size={14} /> Customer asked for a real agent.
                  Click <strong className="mx-1">Join chat</strong> above to start replying.
                </div>
              )}
              {active.mode === "human" && (
                <div className="flex items-center gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendReply()}
                    placeholder="Type a message…"
                    className="flex-1 h-10 rounded-lg border border-[var(--border)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button onClick={sendReply} leftIcon={<Send size={14} />} disabled={busy || !draft.trim()}>
                    Send
                  </Button>
                </div>
              )}
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] text-sm">
            Select a chat to begin
          </div>
        )}
      </section>

      {/* Right: customer details */}
      <aside className="hidden xl:flex flex-col min-h-0 border-l border-[var(--border)] overflow-y-auto scrollbar-thin">
        {active && (
          <>
            <div className="p-5 border-b border-[var(--border)] flex flex-col items-center text-center">
              <Avatar name={active.customer_name || active.customer_phone} size={64} />
              <div className="mt-3 font-semibold">{active.customer_name || "Unknown"}</div>
              <div className="text-xs text-[var(--text-secondary)]">{active.customer_phone}</div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <Row icon={<Phone size={14} />} label="Phone" value={active.customer_phone} />
              {active.customer_location && (
                <Row icon={<MapPin size={14} />} label="Location" value={active.customer_location} />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Total orders" value={String(active.customer_total_orders)} />
                <Stat label="Total spent" value={money(active.customer_total_spent)} />
              </div>
              {active.click_session_id && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-900">
                  ✓ Attributed to {active.src_platform ?? "unknown"} ad click
                  <div className="text-[10px] text-emerald-700 mt-1 break-all">
                    click_session: {active.click_session_id}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className="text-base font-semibold mt-0.5">{value}</div>
    </div>
  );
}
