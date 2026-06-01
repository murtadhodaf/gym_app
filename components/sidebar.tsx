"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Icon } from "@/components/ui/icon";

type IconName = "home" | "dumbbell" | "calendar" | "sparkles" | "chart" | "settings";

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  badge?: string;
}

const NAV_TRAIN: NavItem[] = [
  { href: "/home",     label: "Home",      icon: "home"      },
  { href: "/workout",  label: "Workout",   icon: "dumbbell",  badge: "Today" },
  { href: "/program",  label: "Program",   icon: "calendar"  },
  { href: "/coach",    label: "AI Coach",  icon: "sparkles"  },
  { href: "/progress", label: "Progress",  icon: "chart"     },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const firstName = user?.firstName ?? "";
  const lastName  = user?.lastName  ?? "";
  const userName  = [firstName, lastName].filter(Boolean).join(" ") || null;
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? null;
  const initials  =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : firstName
      ? firstName.slice(0, 2).toUpperCase()
      : userEmail
      ? userEmail.slice(0, 2).toUpperCase()
      : "··";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    // Styles for .sb-link and .sb-user-btn live in globals.css — never inject a
    // new <style> tag per render, which was causing navigation lag.
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
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)" }}>
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
                className={`sb-link${active ? " active" : ""}`}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {item.badge && (
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

        <Link
          href="/settings"
          className={`sb-link${isActive("/settings") ? " active" : ""}`}
        >
          <Icon name="settings" size={18} />
          <span>Settings</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User card */}
        <SignOutButton>
          <button title="Sign out" className="sb-user-btn">
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
