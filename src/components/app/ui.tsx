import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Crown, User } from "lucide-react";
import type { Health, Role } from "@/lib/pilots";
import { cn } from "@/lib/utils";

const HEALTH: Record<Health, { label: string; cls: string; dot: string }> = {
  healthy: { label: "Healthy", cls: "bg-success-soft text-success", dot: "bg-success" },
  attention: { label: "Needs Attention", cls: "bg-warning-soft text-warning", dot: "bg-warning" },
  stalled: { label: "Stalled", cls: "bg-danger-soft text-danger", dot: "bg-danger" },
  completed: { label: "Completed", cls: "bg-secondary text-muted-foreground", dot: "bg-muted-foreground" },
};

export function StatusPill({ health }: { health: Health }) {
  const h = HEALTH[health];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", h.cls)}>
      <span className={cn("size-1.5 rounded-full", h.dot)} />
      {h.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: Role }) {
  return role === "champion" ? (
    <span className="inline-flex items-center gap-1 rounded border border-champion/20 bg-champion-soft px-1.5 py-0.5 text-[11px] font-medium text-champion">
      <Crown className="size-3" /> Champion
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-1.5 py-0.5 text-[11px] font-medium text-secondary-foreground">
      <User className="size-3" /> Daily User
    </span>
  );
}

export function Bar({ value, tone = "primary" }: { value: number; tone?: "primary" | "success" | "warning" | "danger" }) {
  const t = { primary: "bg-primary", success: "bg-success", warning: "bg-warning", danger: "bg-danger" }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className={cn("h-full rounded-full transition-all", t)} style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }} />
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-lg border border-border bg-card shadow-[0_1px_2px_0_oklch(0_0_0/0.04)]", className)}>{children}</div>;
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid size-6 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">AP</span>
      AutoPilot
    </Link>
  );
}

export function AppHeader() {
  const link = "rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground";
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link to="/" className={link} activeOptions={{ exact: true }} activeProps={{ className: "bg-secondary text-foreground" }}>
            Command Center
          </Link>
          <Link to="/pilots/new" className={link} activeProps={{ className: "bg-secondary text-foreground" }}>
            New Pilot
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function btn(variant: "primary" | "secondary" | "ghost" = "primary") {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50";
  return cn(
    base,
    variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "secondary" && "border border-border bg-card text-foreground hover:bg-secondary",
    variant === "ghost" && "text-muted-foreground hover:bg-secondary hover:text-foreground",
  );
}
export const inputCls =
  "w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";
