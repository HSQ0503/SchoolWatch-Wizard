"use client";

import { useState } from "react";
import WizardTopBar from "@/components/wizard/WizardTopBar";

type Status = "idle" | "sending" | "sent" | "error";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error === "School not found"
            ? "No school found with that email. Use the email you entered when setting up your dashboard."
            : body?.error ?? "Something went wrong"
        );
      }

      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-[color:var(--background)] text-[color:var(--color-foreground)]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <WizardTopBar />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md" style={fontMono}>
          <div className="mb-6 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
            <h1 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
              <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
              auth
            </h1>
            <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
              edit your dashboard. we&apos;ll email you a magic link.
            </p>
          </div>

          {status === "sent" ? (
            <div className="rounded-[3px] border border-[color:var(--color-ok)]/40 bg-[rgba(16,185,129,0.08)] p-5">
              <p className="text-sm font-bold text-[color:var(--color-ok)]">
                ✓ check your inbox
              </p>
              <p className="mt-2 text-[13px] text-[color:var(--color-text-dim)]">
                sent a login link to{" "}
                <strong className="text-[color:var(--color-foreground)]">{email}</strong>.
                expires in 15 min.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label htmlFor="email" className="text-xs text-[color:var(--color-text-faded)]">
                  contact_email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]"
                  style={fontMono}
                />
              </div>

              {status === "error" && (
                <p className="text-[13px] text-[color:var(--color-accent)]">✗ {error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !email.trim()}
                className="w-full cursor-pointer rounded-[3px] border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                style={fontMono}
              >
                {status === "sending" ? "sending..." : "send magic link →"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[11px] text-[color:var(--color-text-faded)]">
            no dashboard yet?{" "}
            <a
              href="/setup"
              className="text-[color:var(--color-accent)] underline underline-offset-2 hover:brightness-110"
            >
              create one
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
