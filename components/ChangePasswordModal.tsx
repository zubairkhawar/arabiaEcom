"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

export function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const reset = () => {
    setOldPw("");
    setNewPw("");
    setConfirmPw("");
    setErr(null);
    setOk(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(false);
    if (newPw !== confirmPw) {
      setErr("New passwords don't match");
      return;
    }
    if (newPw.length < 8) {
      setErr("New password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await api("/auth/password", {
        method: "POST",
        body: { old_password: oldPw, new_password: newPw },
      });
      setOk(true);
      setOldPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(close, 1200);
    } catch (e) {
      if (e instanceof ApiError) {
        setErr(e.message);
      } else {
        setErr(e instanceof Error ? e.message : "Couldn't change password");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Change password" size="sm" footer={
      <>
        <Button variant="outline" onClick={close} disabled={busy}>Cancel</Button>
        <Button type="submit" form="change-pw-form" disabled={busy || ok}>
          {busy ? "Saving…" : ok ? "Saved" : "Change password"}
        </Button>
      </>
    }>
      <form id="change-pw-form" onSubmit={submit} className="space-y-4">
        <Input
          label="Current password"
          type="password"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
          autoComplete="current-password"
          required
        />
        <Input
          label="New password"
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          autoComplete="new-password"
          hint="Minimum 8 characters."
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          autoComplete="new-password"
          required
        />
        {err && (
          <div className="text-sm text-[var(--danger)] bg-[var(--danger-soft)] border border-red-200 rounded-lg px-3 py-2">
            {err}
          </div>
        )}
        {ok && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            Password updated.
          </div>
        )}
      </form>
    </Modal>
  );
}
