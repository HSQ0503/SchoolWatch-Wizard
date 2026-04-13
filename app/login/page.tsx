"use client";

import { useState } from "react";
import WizardTopBar from "@/components/wizard/WizardTopBar";

type Status = "idle" | "sending" | "sent" | "error";

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
    <div className="theme-zine flex min-h-screen flex-col bg-[color:var(--paper)] text-[color:var(--color-ink)]">
      <WizardTopBar />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px]">
          <p
            className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            magic link · no passwords
          </p>
          <h1
            className="mb-2 font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]"
            style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(36px, 5vw, 52px)" }}
          >
            Edit your{" "}
            <span
              className="italic font-normal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              SchoolWatch.
            </span>
          </h1>
          <p
            className="mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Enter the email you used when setting up your dashboard. We&apos;ll send you a login link that expires in 15 minutes.
          </p>

          {status === "sent" ? (
            <div
              className="mt-10 border-l-[3px] border-[color:var(--color-ink)] pl-5 py-3"
            >
              <p
                className="text-[11px] uppercase tracking-[0.18em] text-[#3a7d5c]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                sent
              </p>
              <p
                className="mt-2 text-[16px] italic leading-[1.5] text-[color:var(--color-ink)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Check your inbox. Link expires in 15 minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Contact email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className="w-full border-0 border-b-2 border-[color:var(--color-ink)] bg-transparent px-0 py-2 text-[18px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none"
                  style={{ fontFamily: "var(--font-display)" }}
                />
              </div>

              {status === "error" && (
                <p
                  className="text-[14px] italic text-[color:var(--color-marker)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !email.trim()}
                className="group inline-flex w-full items-center justify-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-6 py-3.5 text-[color:var(--color-paper)] shadow-[6px_6px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--highlight)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-[0_0_0_var(--highlight)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                style={{ fontFamily: "var(--font-archivo)", fontSize: 15, letterSpacing: "0.02em" }}
              >
                {status === "sending" ? "Sending…" : "Send me a link"}
                {status !== "sending" && (
                  <span className="text-[20px] leading-[0] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                )}
              </button>
            </form>
          )}

          <p
            className="mt-12 text-[13px] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No dashboard yet?{" "}
            <a
              href="/setup"
              className="text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] transition-colors hover:text-[color:var(--color-marker)] hover:decoration-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
            >
              Make one
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
