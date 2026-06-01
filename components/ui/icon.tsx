import { SVGProps } from "react";

type IconName =
  | "home" | "dumbbell" | "calendar" | "chart" | "settings" | "sparkles"
  | "play" | "pause" | "check" | "plus" | "arrow_right" | "chevron_right"
  | "chevron_down" | "close" | "info" | "flame" | "heart" | "moon" | "sun"
  | "user" | "target" | "activity" | "refresh" | "bolt" | "bandage" | "eye"
  | "trend_up" | "trend_down" | "weight" | "person" | "leaf" | "clock"
  | "star" | "mail" | "lock" | "energy" | "timer" | "arrow_up" | "arrow_down"
  | "edit" | "notebook" | "upload" | "trash" | "google" | "apple";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-3v-7H8v7H5a2 2 0 0 1-2-2v-9z" /></>,
    dumbbell: <><path d="M6.5 6.5L17.5 17.5M3 9.5l1.5-1.5M19.5 16l1.5-1.5M5 11l-2 2 4 4 2-2M19 13l2-2-4-4-2 2" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    chart: <><path d="M3 21V3M3 21h18M7 16l4-5 3 3 5-7" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M1 12h4M19 12h4M4.2 19.8l2.8-2.8M17 7l2.8-2.8" /></>,
    sparkles: <><path d="M12 3l1.6 4.5L18 9l-4.4 1.5L12 15l-1.6-4.5L6 9l4.4-1.5z" /><path d="M19 14l.7 1.8L21 16.5l-1.3.7L19 19l-.7-1.8L17 16.5l1.3-.7z" /></>,
    play: <><polygon points="6 4 20 12 6 20" fill="currentColor" stroke="none" /></>,
    pause: <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
    check: <><path d="M4 12l5 5L20 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow_right: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    chevron_right: <><path d="M9 6l6 6-6 6" /></>,
    chevron_down: <><path d="M6 9l6 6 6-6" /></>,
    close: <><path d="M6 6l12 12M18 6L6 18" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v4h1" /></>,
    flame: <><path d="M12 3c0 4 4 5 4 9a4 4 0 0 1-8 0c0-2 1.5-3 1.5-5 0-1.5-1-2-1-2 1 1 3.5 0 3.5-2z" /></>,
    heart: <><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.7 1-1a5.5 5.5 0 0 0 0-7.7z" /></>,
    moon: <><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 14 0v1" /></>,
    target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
    activity: <><path d="M3 12h4l3-9 4 18 3-9h4" /></>,
    refresh: <><path d="M21 12a9 9 0 0 1-15 6.7L3 16M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M3 21v-5h5" /></>,
    bolt: <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
    bandage: <><path d="M14.5 9.5l-5 5M4 10a4 4 0 0 1 0-6 4 4 0 0 1 6 0l10 10a4 4 0 0 1-6 6L4 10z" /></>,
    eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>,
    trend_up: <><path d="M3 17l6-6 4 4 8-8M14 7h7v7" /></>,
    trend_down: <><path d="M3 7l6 6 4-4 8 8M14 17h7v-7" /></>,
    weight: <><path d="M5 8h14l-1 13H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
    person: <><circle cx="12" cy="7" r="4" /><path d="M5 21c0-4 3-7 7-7s7 3 7 7" /></>,
    leaf: <><path d="M11 20A7 7 0 0 1 4 13c0-6 7-9 16-9 0 8-3 16-9 16zM4 13c4 0 8 4 8 8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    star: <><path d="M12 3l2.5 6 6.5.5-5 4.5 1.5 6.5L12 17l-5.5 3.5L8 14 3 9.5 9.5 9z" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 7 9-7" /></>,
    lock: <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    energy: <><path d="M13 2L3 14h7l-1 8 11-13h-8z" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><path d="M9 2h6M12 9v4l3 2" /></>,
    arrow_up: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    arrow_down: <><path d="M12 5v14M19 12l-7 7-7-7" /></>,
    edit: <><path d="M11 4H4v16h16v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    notebook: <><path d="M4 4h13a2 2 0 0 1 2 2v14H4z" /><path d="M4 20h13a2 2 0 0 0 2-2M8 8h7M8 12h7M8 16h4" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" /></>,
    google: (
      <>
        <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.2-.9 2.3-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" stroke="none" />
        <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" stroke="none" />
        <path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.2 1.1 4.6L6.4 14z" fill="#FBBC05" stroke="none" />
        <path d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9C16.9 2.9 14.7 2 12 2 8 2 4.5 4.3 3.1 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" fill="#EA4335" stroke="none" />
      </>
    ),
    apple: <><path d="M16.5 11.4c0-2.6 2.1-3.9 2.2-4-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2.1-.9-3.4-.9-1.8 0-3.4 1-4.3 2.6-1.8 3.1-.5 7.7 1.3 10.3.9 1.2 1.9 2.6 3.3 2.6 1.3 0 1.8-.8 3.4-.8s2 .8 3.4.8c1.4 0 2.3-1.3 3.2-2.5 1-1.4 1.4-2.8 1.5-2.9-.1 0-2.9-1.1-3-4.1zM14 3.6c.7-.8 1.2-2 1-3.2-1 0-2.3.7-3 1.5-.6.7-1.2 1.9-1 3.1 1.1 0 2.3-.6 3-1.4z" fill="currentColor" stroke="none" /></>,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
