"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Icon } from "@/components/ui/icon";

const NAV_TRAIN = [
  { href: "/home",     label: "Home",      icon: "home"      as const },
  { href: "/workout",  label: "Workout",   icon: "dumbbell"  as const, badge: "Today" },
  { href: "/program",  label: "Program",   icon: "calendar"  as const },
  { href: "/coach",    label: "AI Coach",  icon: "sparkles"  as const },
  { href: "/progress", label: "Progress",  icon: "chart"     as const },
];

interface SidebarProps {
  userName: string | null;
  userEmail: string | null;
  initials: string;
}

export function Sidebar({ userName, userEmail, initials }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      style={{
        width: 232,
        minWidth: 232,
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px 24px" }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "var(--ink)",
            display: "grid",
            placeItems: "center",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "var(--accent)",
              boxShadow: "inset 0 0 0 3px var(--ink)",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
          }}
        >
          For<em style={{ fontFamily: "var(--font-instrument)", fontStyle: "italic", fontWeight: 400 }}>ma</em>
        </div>
      </div>

      {/* Train section */}
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--ink-3)",
          padding: "16px 10px 6px",
        }}
      >
        Train
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {NAV_TRAIN.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 10,
              color: active ? "var(--bg)" : "var(--ink-2)",
              background: active ? "var(--ink)" : "transparent",
              fontSize: 13.5,
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.12s, color 0.12s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-2)";
              }
            }}
          >
            <Icon name={item.icon} size={18} />
            <span>{item.label}</span>
            {"badge" in item && item.badge && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "1px 7px",
                  borderRadius: 999,
                  background: active ? "var(--accent)" : "var(--surface)",
                  color: active ? "var(--accent-ink)" : "var(--ink-2)",
                }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
      </div>

      {/* Account section */}
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--ink-3)",
          padding: "16px 10px 6px",
        }}
      >
        Account
      </div>

      {(() => {
        const active = isActive("/settings");
        return (
          <Link
            href="/settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 10px",
              borderRadius: 10,
              color: active ? "var(--bg)" : "var(--ink-2)",
              background: active ? "var(--ink)" : "transparent",
              fontSize: 13.5,
              fontWeight: 500,
              textDecoration: "none",
              transition: "background 0.12s, color 0.12s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.background = "var(--surface)";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                (e.currentTarget as HTMLAnchorElement).style.color = "var(--ink-2)";
              }
            }}
          >
            <Icon name="settings" size={18} />
            <span>Settings</span>
          </Link>
        );
      })()}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User card */}
      <SignOutButton redirectUrl="/sign-in">
        <button
          title="Sign out"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 10,
            borderRadius: 12,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            width: "100%",
            textAlign: "left",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--surface)")}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #D7F252, #88B33A)",
              color: "var(--accent-ink)",
              fontWeight: 600,
              fontSize: 12,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ lineHeight: 1.15, minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{userName ?? "User"}</div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
              }}
            >
              {userEmail ?? ""}
            </div>
          </div>
        </button>
      </SignOutButton>
    </aside>
  );
}
