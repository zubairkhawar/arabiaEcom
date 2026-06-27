"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, MessageSquare, AlertTriangle, CheckCircle2, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { useRole } from "@/lib/role";
import { relTime } from "@/lib/format";
import { cn } from "@/lib/cn";

interface NotifOut {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  meta: Record<string, unknown> | null;
  seen: boolean;
  created_at: string;
}

interface ListResp {
  items: NotifOut[];
  unseen: number;
}

// One short WebAudio "ping" — no asset needed
let _audioCtx: AudioContext | null = null;
function playPing() {
  try {
    _audioCtx = _audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = _audioCtx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  } catch {
    /* autoplay blocked; will work after first user interaction */
  }
}

function iconFor(t: string) {
  switch (t) {
    case "escalation":
      return <AlertTriangle size={14} className="text-amber-600" />;
    case "order_confirmed":
      return <CheckCircle2 size={14} className="text-emerald-600" />;
    case "new_chat":
    case "new_message":
      return <MessageSquare size={14} className="text-blue-600" />;
    default:
      return <Bell size={14} className="text-slate-500" />;
  }
}

export function NotificationsDropdown() {
  const { profile } = useRole();
  const [items, setItems] = useState<NotifOut[]>([]);
  const [unseen, setUnseen] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevUnseen = useRef(0);
  const seedDone = useRef(false);

  const load = async (silent = false) => {
    try {
      const data = await api<ListResp>("/me/notifications?limit=15");
      setItems(data.items);
      setUnseen(data.unseen);
      if (!silent && seedDone.current && data.unseen > prevUnseen.current) {
        playPing();
      }
      prevUnseen.current = data.unseen;
      seedDone.current = true;
    } catch {
      /* ignore */
    }
  };

  // Initial fetch + 12s polling, only when logged in
  useEffect(() => {
    if (!profile) return;
    load(true);
    const t = setInterval(() => load(false), 12000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const openBell = async () => {
    setOpen(true);
    if (unseen > 0) {
      try {
        await api("/me/notifications/mark-seen", { method: "POST" });
        setUnseen(0);
        setItems((arr) => arr.map((i) => ({ ...i, seen: true })));
      } catch {
        /* ignore */
      }
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear all notifications?")) return;
    try {
      await api("/me/notifications", { method: "DELETE" });
      setItems([]);
      setUnseen(0);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={() => (open ? setOpen(false) : openBell())}
        className="relative h-9 w-9 rounded-lg border border-[var(--border)] bg-white flex items-center justify-center hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell size={16} className="text-slate-600" />
        {unseen > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--danger)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unseen > 99 ? "99+" : unseen}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[90vw] bg-white rounded-xl shadow-xl border border-[var(--border)] overflow-hidden z-40">
          <header className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1"
                  title="Clear all"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={14} />
              </button>
            </div>
          </header>
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
              No notifications yet.
            </div>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto scrollbar-thin">
              {items.map((n) => (
                <li key={n.id} className="border-b border-[var(--border)] last:border-0">
                  <Link
                    href={n.href ?? "#"}
                    onClick={() => {
                      setOpen(false);
                      api(`/me/notifications/${n.id}/read`, { method: "POST" }).catch(() => {});
                    }}
                    className={cn(
                      "block px-4 py-3 hover:bg-slate-50 transition-colors",
                      !n.seen && "bg-emerald-50/40"
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5">{iconFor(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)] leading-snug">
                          {n.title}
                        </div>
                        {n.body && (
                          <div className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                            {n.body}
                          </div>
                        )}
                        <div className="text-[10px] text-[var(--text-muted)] mt-1">
                          {relTime(n.created_at)}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
