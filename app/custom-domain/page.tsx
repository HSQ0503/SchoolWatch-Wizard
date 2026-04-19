"use client";

import { useEffect, useState } from "react";
import WizardTopBar from "@/components/wizard/WizardTopBar";

type Status = "idle" | "sending" | "sent" | "error";

const labelCls =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]";
const underlineInputCls =
  "w-full border-0 border-b-2 border-[color:var(--color-ink)] bg-transparent px-0 py-2 text-[18px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none";
const textareaCls =
  "w-full border-2 border-[color:var(--color-ink)] bg-transparent px-3 py-2.5 text-[15px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none";
const labelFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const inputFont: React.CSSProperties = { fontFamily: "var(--font-display)" };

export default function CustomDomainPage() {
  const [schoolName, setSchoolName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [desiredDomain, setDesiredDomain] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Pre-fill email if the visitor is signed in
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { email?: string } | null) => {
        if (!cancelled && data?.email) setContactEmail(data.email);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!schoolName.trim() || !contactEmail.trim() || !desiredDomain.trim()) return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/custom-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolName: schoolName.trim(),
          contactEmail: contactEmail.trim(),
          currentUrl: currentUrl.trim(),
          desiredDomain: desiredDomain.trim(),
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Something went wrong");
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
        <div className="w-full max-w-[560px]">
          <p
            className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            upgrade · custom domain
          </p>
          <h1
            className="mb-2 font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]"
            style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(36px, 5vw, 52px)" }}
          >
            Want your{" "}
            <span
              className="italic font-normal"
              style={{ fontFamily: "var(--font-display)" }}
            >
              own domain?
            </span>
          </h1>
          <p
            className="mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Tell us what you have in mind and we&apos;ll handle the DNS and registration for you. Usually takes a day or two once we agree on terms.
          </p>

          {status === "sent" ? (
            <div className="mt-10 border-l-[3px] border-[color:var(--color-ink)] pl-5 py-3">
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
                We got it. Expect a reply within a day or two.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div>
                <label htmlFor="schoolName" className={labelCls} style={labelFont}>
                  School name
                </label>
                <input
                  id="schoolName"
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Windermere Preparatory School"
                  className={underlineInputCls}
                  style={inputFont}
                />
              </div>

              <div>
                <label htmlFor="contactEmail" className={labelCls} style={labelFont}>
                  Contact email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className={underlineInputCls}
                  style={inputFont}
                />
              </div>

              <div>
                <label htmlFor="currentUrl" className={labelCls} style={labelFont}>
                  Current SchoolWatch URL <span className="text-[color:var(--color-ink-faded)]/70">(optional)</span>
                </label>
                <input
                  id="currentUrl"
                  type="text"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="schoolwatch-your-school.vercel.app"
                  className={underlineInputCls}
                  style={inputFont}
                />
              </div>

              <div>
                <label htmlFor="desiredDomain" className={labelCls} style={labelFont}>
                  Domain you want
                </label>
                <input
                  id="desiredDomain"
                  type="text"
                  required
                  value={desiredDomain}
                  onChange={(e) => setDesiredDomain(e.target.value)}
                  placeholder="yourschoolwatch.com"
                  className={underlineInputCls}
                  style={inputFont}
                />
              </div>

              <div>
                <label htmlFor="notes" className={labelCls} style={labelFont}>
                  Budget, timing, anything else <span className="text-[color:var(--color-ink-faded)]/70">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="We have ~$50/year budget. Want it live by mid-August for the new school year."
                  className={textareaCls}
                  style={inputFont}
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
                disabled={
                  status === "sending" ||
                  !schoolName.trim() ||
                  !contactEmail.trim() ||
                  !desiredDomain.trim()
                }
                className="group inline-flex w-full items-center justify-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-6 py-3.5 text-[color:var(--color-paper)] shadow-[6px_6px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--highlight)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-[0_0_0_var(--highlight)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                style={{ fontFamily: "var(--font-archivo)", fontSize: 15, letterSpacing: "0.02em" }}
              >
                {status === "sending" ? "Sending…" : "Send request"}
                {status !== "sending" && (
                  <span className="text-[20px] leading-[0] transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
