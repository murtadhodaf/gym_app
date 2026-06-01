"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/home");
      } else {
        setError("Additional verification required.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { errors?: { message: string }[] })?.errors?.[0]?.message ??
        "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "oauth_google" | "oauth_apple") {
    if (!isLoaded || !signIn) return;
    await signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/home",
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    fontSize: 14,
    color: "var(--ink)",
    outline: "none",
    transition: "border 0.12s, box-shadow 0.12s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--ink)";
    e.target.style.boxShadow = "0 0 0 3px rgba(215,242,82,0.35)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "var(--border)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--bg)" }}>

      {/* ── Left: art panel ───────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--ink)",
        color: "var(--bg)",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
      }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 80% 20%, rgba(215,242,82,0.25), transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(74,107,212,0.18), transparent 50%)
          `,
          pointerEvents: "none",
        }} />

        {/* Brand */}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--accent)", display: "grid", placeItems: "center" }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--ink)", boxShadow: "inset 0 0 0 3px var(--accent)" }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--bg)" }}>
            For<em style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic", fontWeight: 400 }}>ma</em>
          </span>
        </div>

        {/* Art content */}
        <div style={{ position: "relative", marginTop: "auto" }}>
          <p style={{ fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.05, maxWidth: 460, color: "var(--bg)" }}>
            Train with <em style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic" }}>intent.</em><br />
            Adapt with <em style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic" }}>evidence.</em>
          </p>
          <p style={{ color: "rgba(242,239,229,0.55)", fontSize: 13, marginTop: 24 }}>
            Smart, adaptive fitness programs built around your body, your recovery, and your goals.
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { value: "2.1M+", label: "Sessions tracked" },
              { value: "87%",   label: "Hit weekly goal"  },
              { value: "4.9★",  label: "App Store"        },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 22, color: "var(--accent)", fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(242,239,229,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────────────── */}
      <div style={{ padding: "56px 64px", display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 380, margin: "0 auto" }}>

          <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.025em", margin: "0 0 6px", color: "var(--ink)" }}>
            Welcome <em style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic" }}>back.</em>
          </h2>
          <p style={{ color: "var(--ink-3)", marginBottom: 30, fontSize: 14 }}>
            Sign in to continue your training.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, marginBottom: 6, color: "var(--ink-2)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-2)" }}>Password</label>
                <button
                  type="button"
                  style={{ background: "none", border: "none", color: "var(--ink-2)", fontSize: 11.5, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  Forgot?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {error && <p style={{ fontSize: 13, color: "var(--coral)", marginBottom: 10 }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 10,
                padding: "13px 20px",
                background: "var(--accent)",
                color: "var(--accent-ink)",
                border: "1px solid var(--accent-2)",
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "background 0.12s",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "var(--accent-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
            >
              {loading ? "Signing in…" : (
                <>Sign in <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>
              )}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", color: "var(--ink-3)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            or continue with
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_google")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--ink)", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("oauth_apple")}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 13, color: "var(--ink)", fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--surface)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: 28, color: "var(--ink-3)", fontSize: 13 }}>
            New to Forma?{" "}
            <Link href="/sign-up" style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "none" }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
