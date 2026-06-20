"use client";

import { use, useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";

interface ResolveResp {
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  currency: string;
  pixel_id: string | null;
  default_event: string;
  wa_target_number: string;
  wa_deeplink: string;
  ref_token: string;
  reseller_id: string;
  reseller_name: string;
}

interface ClickResp {
  ref_token: string;
  click_session_id: string;
  event_id: string;
  pixel_id: string | null;
  wa_deeplink: string;
  capi_status: string;
  capi_response_code: number | null;
  bot: boolean;
}

// minimal global typing for fbq
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function inferPlatform(params: URLSearchParams): string {
  const src = (params.get("src") || params.get("utm_source") || "").toLowerCase();
  if (src.includes("meta") || src.includes("facebook") || src.includes("instagram"))
    return "meta";
  if (src.includes("tiktok")) return "tiktok";
  if (src.includes("snap")) return "snapchat";
  if (src.includes("google")) return "google";
  if (params.get("fbclid")) return "meta";
  if (params.get("ttclid")) return "tiktok";
  if (params.get("sclid")) return "snapchat";
  if (params.get("gclid")) return "google";
  return src || "other";
}

function injectPixel(pixelId: string) {
  if (window.fbq) return;
  // standard Meta pixel loader
  const f: Window = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq: any = function () {
    // eslint-disable-next-line prefer-rest-params
    (fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments));
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  f.fbq = fbq;
  f._fbq = fbq;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  fbq("init", pixelId);
}

export default function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [stage, setStage] = useState<"loading" | "redirecting" | "error">("loading");
  const [info, setInfo] = useState<{ productName?: string; pixelId?: string | null; capi?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      try {
        const query = new URLSearchParams(window.location.search);

        // 1. Resolve product + reseller + pixel
        const resolveRes = await fetch(`${API_BASE}/links/resolve/${encodeURIComponent(slug)}`);
        if (!resolveRes.ok) {
          setError("Product link not found.");
          setStage("error");
          return;
        }
        const resolved: ResolveResp = await resolveRes.json();
        setInfo({ productName: resolved.product_name, pixelId: resolved.pixel_id });

        // 2. Inject reseller's pixel + fire top-of-funnel event (if pixel configured)
        if (resolved.pixel_id) {
          try {
            injectPixel(resolved.pixel_id);
            window.fbq?.(
              "track",
              resolved.default_event || "InitiateCheckout",
              {
                content_ids: [resolved.product_id],
                content_name: resolved.product_name,
                value: resolved.price,
                currency: resolved.currency,
              },
              { eventID: resolved.ref_token }
            );
          } catch {
            /* pixel inject can throw under ad-blockers — ignore, CAPI mirror will cover */
          }
        }

        // 3. POST click → backend creates click_session + mirrors event via CAPI
        const clickBody = {
          slug,
          src_platform: inferPlatform(query),
          fbclid: query.get("fbclid"),
          fbp: readCookie("_fbp"),
          fbc: readCookie("_fbc"),
          ttclid: query.get("ttclid"),
          sclid: query.get("sclid"),
          gclid: query.get("gclid"),
          utm_source: query.get("utm_source"),
          utm_medium: query.get("utm_medium"),
          utm_campaign: query.get("utm_campaign"),
          utm_content: query.get("utm_content"),
          utm_term: query.get("utm_term"),
          user_agent: navigator.userAgent,
          referer: document.referrer || null,
          landing_url: window.location.href,
        };

        const clickRes = await fetch(`${API_BASE}/links/click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clickBody),
        });
        const click: ClickResp = await clickRes.json();
        setInfo((i) => ({ ...i, capi: click.capi_status }));

        // 4. Confirm pixel beacon flushed
        if (click.click_session_id) {
          const beaconBody = JSON.stringify({ click_session_id: click.click_session_id });
          try {
            const blob = new Blob([beaconBody], { type: "application/json" });
            navigator.sendBeacon?.(`${API_BASE}/links/pixel-fired`, blob);
          } catch {
            fetch(`${API_BASE}/links/pixel-fired`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: beaconBody,
              keepalive: true,
            }).catch(() => {});
          }
        }

        // 5. Redirect to WhatsApp — short hold to let the browser pixel beacon flush
        setStage("redirecting");
        const target = click.wa_deeplink || resolved.wa_deeplink;
        setTimeout(() => {
          window.location.replace(target);
        }, 350);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        setStage("error");
      }
    };

    run();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-7 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
          {stage === "error" ? "✕" : "💬"}
        </div>
        {stage !== "error" ? (
          <>
            <h1 className="mt-4 font-semibold text-lg text-slate-900">
              Opening WhatsApp…
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {info.productName
                ? `Connecting you to chat about ${info.productName}.`
                : "Hang tight, redirecting you to chat."}
            </p>
            <div className="mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {info.pixelId ? "Tracking ad attribution" : "No pixel configured"}
                {info.capi && ` · CAPI ${info.capi}`}
              </span>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-4 font-semibold text-lg text-slate-900">Link unavailable</h1>
            <p className="text-sm text-slate-600 mt-1">{error}</p>
          </>
        )}
      </div>
    </div>
  );
}
