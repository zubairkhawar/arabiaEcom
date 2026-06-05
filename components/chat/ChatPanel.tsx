"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  Send,
  Bot,
  UserRound,
  Sparkles,
  Lock,
  Phone,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { chats as seed } from "@/lib/mock/chats";
import { customerById } from "@/lib/mock/customers";
import { productById } from "@/lib/mock/products";
import { resellerById } from "@/lib/mock/resellers";
import { relTime, money } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Chat, ChatMode } from "@/lib/mock/types";

export function ChatPanel({ showReseller = false }: { showReseller?: boolean }) {
  const [chats, setChats] = useState<Chat[]>(seed);
  const [activeId, setActiveId] = useState(chats[0].id);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");

  const filtered = useMemo(
    () =>
      chats.filter((c) => {
        if (filter === "ai" && c.mode !== "ai") return false;
        if (filter === "human" && c.mode !== "human") return false;
        if (filter === "unread" && c.unread === 0) return false;
        if (q) {
          const cust = customerById(c.customerId);
          if (!cust?.name.toLowerCase().includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [chats, filter, q]
  );

  const active = chats.find((c) => c.id === activeId) ?? chats[0];
  const cust = customerById(active.customerId);
  const reseller = resellerById(active.resellerId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  const setMode = (mode: ChatMode) => {
    setChats((arr) =>
      arr.map((c) => (c.id === activeId ? { ...c, mode } : c))
    );
  };

  const send = () => {
    if (!draft.trim() || active.mode !== "human") return;
    setChats((arr) =>
      arr.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Math.random().toString(36).slice(2),
                  from: "human",
                  text: draft.trim(),
                  at: new Date().toISOString(),
                },
              ],
            }
          : c
      )
    );
    setDraft("");
  };

  const draftTotal =
    active.draftItems?.reduce((sum, i) => {
      const p = productById(i.productId);
      return sum + (p?.price ?? 0) * i.qty;
    }, 0) ?? 0;

  return (
    <div className="h-[calc(100vh-145px)] grid grid-cols-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_320px] rounded-2xl border border-[var(--border)] bg-white overflow-hidden card-shadow">
      {/* Left pane */}
      <aside className="border-r border-[var(--border)] flex flex-col min-h-0">
        <div className="p-3 border-b border-[var(--border)] space-y-2.5">
          <Input
            placeholder="Search conversations"
            leftIcon={<Search size={14} />}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
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
            const cu = customerById(c.customerId);
            const last = c.messages[c.messages.length - 1];
            const isActive = c.id === active.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => setActiveId(c.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 border-b border-[var(--border)] flex items-start gap-3 hover:bg-slate-50 transition-colors",
                    isActive && "bg-[var(--accent-soft)] border-l-2 border-l-[var(--accent)]"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar name={cu?.name ?? "?"} size={38} />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white",
                        c.mode === "ai" ? "bg-[var(--accent)]" : "bg-[var(--warning)]"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{cu?.name}</span>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">
                        {relTime(last.at)}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {last.text}
                    </div>
                    {showReseller && (
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">
                        {resellerById(c.resellerId)?.name}
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

      {/* Center pane */}
      <section className="flex flex-col min-h-0">
        <header className="px-5 py-3 border-b border-[var(--border)] flex items-center gap-3">
          <Avatar name={cust?.name ?? "?"} size={36} />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{cust?.name}</div>
            <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
              <span>{cust?.phone}</span>
              <span>·</span>
              <Badge tone={active.channel === "whatsapp" ? "success" : "violet"} dot>
                {active.channel === "whatsapp" ? "WhatsApp" : "Shopify"}
              </Badge>
              {showReseller && (
                <>
                  <span>·</span>
                  <span className="text-[var(--text-muted)]">{reseller?.name}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {active.mode === "ai" ? (
              <>
                <Badge tone="success" dot>
                  AI is handling
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<UserRound size={14} />}
                  onClick={() => setMode("human")}
                >
                  Take over
                </Button>
              </>
            ) : (
              <>
                <Badge tone="warning" dot>
                  Human · AI paused
                </Badge>
                <Button
                  size="sm"
                  leftIcon={<Bot size={14} />}
                  onClick={() => setMode("ai")}
                >
                  Hand back to AI
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/40 scrollbar-thin">
          {active.mode === "human" && (
            <div className="mb-4 mx-auto max-w-md text-center bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs">
              AI paused — you are replying as a human.
            </div>
          )}
          <div className="space-y-3">
            {active.messages.map((m) => {
              const fromCustomer = m.from === "customer";
              return (
                <div
                  key={m.id}
                  className={cn(
                    "flex",
                    fromCustomer ? "justify-start" : "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-snug shadow-sm",
                      fromCustomer
                        ? "bg-white border border-[var(--border)] rounded-tl-sm"
                        : m.from === "ai"
                        ? "bg-emerald-500 text-white rounded-tr-sm"
                        : "bg-amber-100 text-amber-900 rounded-tr-sm border border-amber-200"
                    )}
                  >
                    {!fromCustomer && (
                      <div className="text-[10px] uppercase tracking-wide opacity-80 mb-0.5 flex items-center gap-1">
                        {m.from === "ai" ? (
                          <>
                            <Sparkles size={10} /> AI
                          </>
                        ) : (
                          <>
                            <UserRound size={10} /> Agent
                          </>
                        )}
                      </div>
                    )}
                    {m.text}
                    <div className="text-[10px] mt-1 opacity-60 text-right">
                      {relTime(m.at)}
                    </div>
                  </div>
                </div>
              );
            })}
            {active.mode === "ai" && (
              <div className="flex justify-end">
                <div className="bg-emerald-50 text-emerald-700 text-xs rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span
                      className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                  AI is typing…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        <footer className="p-3 border-t border-[var(--border)] bg-white">
          {active.mode === "ai" ? (
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] bg-slate-100 rounded-lg px-3 py-2.5">
              <Lock size={14} />
              AI is handling this chat — take over to reply.
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…"
                className="flex-1 h-10 rounded-lg border border-[var(--border)] px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button onClick={send} leftIcon={<Send size={14} />}>
                Send
              </Button>
            </div>
          )}
        </footer>
      </section>

      {/* Right pane — customer details */}
      <aside className="hidden xl:flex flex-col min-h-0 border-l border-[var(--border)] overflow-y-auto scrollbar-thin">
        <div className="p-5 border-b border-[var(--border)] flex flex-col items-center text-center">
          <Avatar name={cust?.name ?? "?"} size={64} />
          <div className="mt-3 font-semibold">{cust?.name}</div>
          <div className="text-xs text-[var(--text-secondary)]">
            Customer since {new Date(cust?.customerSince ?? "").toLocaleDateString()}
          </div>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div className="space-y-2.5">
            <Row icon={<Phone size={14} />} label="Phone" value={cust?.phone ?? ""} />
            <Row
              icon={<MapPin size={14} />}
              label="Location"
              value={cust?.location ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stat label="Total orders" value={String(cust?.totalOrders ?? 0)} />
            <Stat
              label="Total spent"
              value={money(cust?.totalSpent ?? 0)}
            />
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
              <ShoppingBag size={12} /> Live order being assembled
            </div>
            {active.draftItems && active.draftItems.length > 0 ? (
              <div className="rounded-xl bg-slate-50 border border-[var(--border)] p-3">
                <ul className="space-y-1.5">
                  {active.draftItems.map((i, idx) => {
                    const p = productById(i.productId);
                    return (
                      <li
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate">
                          <span className="text-[var(--text-muted)] mr-1.5">{i.qty}×</span>
                          {p?.name}
                        </span>
                        <span className="font-medium">
                          {money((p?.price ?? 0) * i.qty)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-[var(--border)] mt-2 pt-2 flex justify-between font-semibold text-sm">
                  <span>Total</span>
                  <span>{money(draftTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--text-muted)]">
                No draft order yet for this chat.
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div className="flex-1">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide">
          {label}
        </div>
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
