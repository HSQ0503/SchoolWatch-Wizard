"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type State =
  | { kind: "loading" }
  | { kind: "guest" }
  | { kind: "owner"; slug: string };

export default function AuthButton() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { slug?: string | null } | null) => {
        if (cancelled) return;
        if (data?.slug) setState({ kind: "owner", slug: data.slug });
        else setState({ kind: "guest" });
      })
      .catch(() => {
        if (!cancelled) setState({ kind: "guest" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "loading") {
    // reserve space so the nav doesn't jump
    return <span className="hidden md:inline w-[60px]" aria-hidden="true" />;
  }

  if (state.kind === "owner") {
    return (
      <Link
        href={`/manage/${state.slug}`}
        className="hidden md:inline text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden md:inline text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]"
    >
      Login
    </Link>
  );
}
