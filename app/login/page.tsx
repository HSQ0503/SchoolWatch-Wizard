"use client";

import { useState } from "react";

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
        throw new Error(body?.error === "School not found"
          ? "No school found with that email. Use the email you entered when setting up your dashboard."
          : body?.error ?? "Something went wrong");
      }

      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-white text-center">
          Edit Your Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-400 text-center">
          Enter the email you used when setting up your school. We&apos;ll send a magic link to edit your config.
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
            <p className="text-sm font-semibold text-green-400">Check your inbox</p>
            <p className="mt-1 text-sm text-green-300/70">
              We sent a login link to <strong className="text-green-300">{email}</strong>. It expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Contact Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.edu"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending" || !email.trim()}
              className="w-full cursor-pointer rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors duration-150 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "sending" ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-600">
          Don&apos;t have a dashboard yet?{" "}
          <a href="/setup" className="text-gray-400 underline underline-offset-2 hover:text-white transition-colors duration-150">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
