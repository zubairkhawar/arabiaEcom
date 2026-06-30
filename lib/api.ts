"use client";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const TOKEN_KEY = "arabia_token";

// Render free-tier containers cold-start in ~30s. We give each request up
// to 60s and retry once on TCP-level failures (TypeError/AbortError) — the
// first request often wakes the container; the second hits it warm.
const TIMEOUT_MS = 60_000;
const RETRY_DELAY_MS = 2_000;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface ApiOpts {
  method?: string;
  body?: unknown;
  noAuth?: boolean;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown, message: string) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function isNetworkError(e: unknown): boolean {
  // fetch throws TypeError ("Failed to fetch") on network failure, and
  // AbortError when our timeout signal fires. Both indicate "no HTTP
  // response was received" and are safe to retry.
  return e instanceof Error && (e.name === "TypeError" || e.name === "AbortError");
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function api<T = unknown>(
  path: string,
  opts: ApiOpts = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers ?? {}),
  };
  if (!opts.noAuth) {
    const tok = getToken();
    if (tok) headers["Authorization"] = `Bearer ${tok}`;
  }
  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  };
  const url = `${API_BASE}${path}`;

  let res: Response;
  try {
    res = await fetchWithTimeout(url, init);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    // First attempt failed at the network layer. Wait, retry once.
    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    try {
      res = await fetchWithTimeout(url, init);
    } catch (e2) {
      // Both attempts failed. Surface as ApiError so callers get a real
      // message instead of the raw "Failed to fetch" / AbortError.
      const isTimeout = e2 instanceof Error && e2.name === "AbortError";
      const msg = isTimeout
        ? `Request timed out after ${TIMEOUT_MS / 1000}s. The server may be cold-starting — try again in a moment.`
        : "Network error — could not reach the server. Check your connection and try again.";
      throw new ApiError(0, null, msg);
    }
  }

  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    /* leave as text */
  }
  if (!res.ok) {
    const msg =
      typeof parsed === "object" && parsed && "detail" in parsed
        ? String((parsed as { detail: unknown }).detail)
        : `HTTP ${res.status}`;
    throw new ApiError(res.status, parsed, msg);
  }
  return parsed as T;
}
