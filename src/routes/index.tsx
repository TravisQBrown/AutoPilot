import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap } from "lucide-react";
import { AppHeader, Card, StatusPill, Bar, btn } from "@/components/app/ui";
import { usePilots, pilotHealth, criteriaMet, relTime, stallBreakers, type Health } from "@/lib/pilots";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Center — AutoPilot" },
      { name: "description", content: "Track every B2B pilot, spot stalls early, and convert design partners." },
      { property: "og:title", content: "Command Center — AutoPilot" },
      { property: "og:description", content: "Track every B2B pilot, spot stalls early, and convert design partners." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const pilots = usePilots();
  const counts: Record<Health, number> = { healthy: 0, attention: 0, stalled: 0, completed: 0 };
  pilots.forEach((p) => counts[pilotHealth(p)]++);
  const active = pilots.filter((p) => !p.completed);
  const plays = active.flatMap((p) => stallBreakers(p).map((pl) => ({ ...pl, pilot: p })));

  const feed = active
    .flatMap((p) => p.stakeholders.map((s) => ({ p, s })))
    .sort((a, b) => (a.s.lastActiveHoursAgo ?? 9999) - (b.s.lastActiveHoursAgo ?? 9999));

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Command Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">{active.length} active pilots · {plays.length} need a nudge</p>
          </div>
          <Link to="/pilots/new" className={btn()}>New pilot</Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {([
            ["Active", active.length],
            ["On Track", counts.healthy],
            ["At Risk", counts.attention + counts.stalled],
            ["Completed", counts.completed],
          ] as const).map(([l, n]) => (
            <Card key={l} className="p-4">
              <div className="text-xs font-medium text-muted-foreground">{l}</div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">{n}</div>
            </Card>
          ))}
        </div>

        {plays.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold"><Zap className="size-4 text-warning" /> Stall Breakers</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {plays.map((pl) => (
                <Card key={pl.pilot.id + pl.id} className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">{pl.pilot.company} · Day {pl.pilot.dayNumber}</div>
                    <div className="mt-0.5 text-sm font-medium">{pl.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{pl.detail}</p>
                  </div>
                  <Link to="/pilots/$id" params={{ id: pl.pilot.id }} className={btn("secondary") + " shrink-0"}>Review</Link>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <section>
            <h2 className="mb-3 text-sm font-semibold">Pipeline</h2>
            <Card className="divide-y divide-border">
              {pilots.map((p) => {
                const h = pilotHealth(p);
                return (
                  <Link key={p.id} to="/pilots/$id" params={{ id: p.id }} className="group grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3.5 hover:bg-muted md:grid-cols-[1.4fr_1fr_120px_auto]">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.company}</div>
                      <div className="truncate text-xs text-muted-foreground">{p.industry} · {p.teamSize} people</div>
                    </div>
                    <div className="hidden md:block">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Day {p.dayNumber}/{p.durationDays}</span>
                        <span>{criteriaMet(p)}/{p.criteria.length} criteria</span>
                      </div>
                      <Bar value={p.dayNumber / p.durationDays} tone={h === "stalled" ? "danger" : h === "attention" ? "warning" : "primary"} />
                    </div>
                    <div className="hidden md:block"><StatusPill health={h} /></div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </Link>
                );
              })}
            </Card>
          </section>
          <section>
            <h2 className="mb-3 text-sm font-semibold">Activity</h2>
            <Card className="divide-y divide-border">
              {feed.slice(0, 9).map(({ p, s }) => (
                <div key={p.id + s.id} className="px-4 py-3 text-sm">
                  <span className="font-medium">{s.role === "champion" ? "Owner " : ""}{s.name}</span>
                  <span className="text-muted-foreground"> · {p.company}</span>
                  <div className={"text-xs " + (s.lastActiveHoursAgo === null || s.lastActiveHoursAgo > 72 ? "text-danger" : "text-muted-foreground")}>
                    {s.lastActiveHoursAgo === null ? "Hasn't opened the app yet" : `Last active ${relTime(s.lastActiveHoursAgo)}`}
                  </div>
                </div>
              ))}
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
