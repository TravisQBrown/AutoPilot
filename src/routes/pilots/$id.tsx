import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink, Copy, FileText, Zap, Check } from "lucide-react";
import { toast } from "sonner";
import { AppHeader, Card, StatusPill, RoleBadge, Bar, btn } from "@/components/app/ui";
import { usePilots, pilotHealth, stallBreakers, criterionProgress, relTime, USER_STEPS } from "@/lib/pilots";

export const Route = createFileRoute("/pilots/$id")({
  head: () => ({
    meta: [
      { title: "Pilot details — AutoPilot" },
      { name: "description", content: "Stakeholder engagement, success criteria and stall breakers for this pilot." },
      { property: "og:title", content: "Pilot details — AutoPilot" },
      { property: "og:description", content: "Stakeholder engagement, success criteria and stall breakers for this pilot." },
    ],
  }),
  component: PilotPage,
});

function PilotPage() {
  const { id } = Route.useParams();
  const pilot = usePilots().find((p) => p.id === id);
  if (!pilot) throw notFound();
  const h = pilotHealth(pilot);
  const plays = stallBreakers(pilot);
  const hubUrl = typeof window !== "undefined" ? `${window.location.origin}/hub/${pilot.token}` : `/hub/${pilot.token}`;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Command Center</Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{pilot.company}</h1>
              <StatusPill health={h} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{pilot.industry} · {pilot.teamSize} people · Day {pilot.dayNumber} of {pilot.durationDays}</p>
          </div>
          <div className="flex gap-2">
            <button className={btn("secondary")} onClick={() => { navigator.clipboard?.writeText(hubUrl); toast.success("Magic link copied"); }}>
              <Copy className="size-3.5" /> Copy magic link
            </button>
            <Link to="/hub/$token" params={{ token: pilot.token }} className={btn("secondary")}><ExternalLink className="size-3.5" /> Partner Hub</Link>
            <Link to="/pilots/$id/closeout" params={{ id: pilot.id }} className={btn()}><FileText className="size-3.5" /> Conversion summary</Link>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm"><span className="text-muted-foreground">Hypothesis — </span>{pilot.hypothesis}</p>

        {plays.length > 0 && (
          <div className="mt-6 space-y-3">
            {plays.map((pl) => (
              <Card key={pl.id} className="flex items-center justify-between gap-4 border-warning/30 bg-warning-soft p-4">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium"><Zap className="size-4 text-warning" /> {pl.title}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{pl.detail}</p>
                </div>
                <button className={btn() + " shrink-0"} onClick={() => toast.success(pl.to === "champion" ? "Escalation sent to owner" : "Quick-start checklist sent")}>{pl.action}</button>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold">{pilot.dayNumber >= 14 ? "Day-14 progress card" : "Progress vs. hypothesis"}</h2>
              <Card className="divide-y divide-border">
                {pilot.criteria.map((c) => {
                  const pr = criterionProgress(c);
                  return (
                    <div key={c.id} className="px-4 py-4">
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span>{c.label}</span>
                        <span className="font-mono tabular-nums">
                          <span className={pr >= 1 ? "text-success" : pr >= 0.6 ? "text-warning" : "text-danger"}>{c.actual}{c.unit}</span>
                          <span className="text-muted-foreground"> / {c.target}{c.unit}</span>
                        </span>
                      </div>
                      <div className="mt-2"><Bar value={pr} tone={pr >= 1 ? "success" : pr >= 0.6 ? "warning" : "danger"} /></div>
                    </div>
                  );
                })}
              </Card>
            </section>
            <section>
              <h2 className="mb-3 text-sm font-semibold">Stakeholders</h2>
              <Card className="divide-y divide-border">
                {pilot.stakeholders.map((s) => (
                  <div key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 md:grid-cols-[1.3fr_1fr_110px]">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium">{s.name} <RoleBadge role={s.role} /></div>
                      <div className="truncate text-xs text-muted-foreground">{s.title}{s.useCase ? ` · ${s.useCase}` : ""}</div>
                    </div>
                    <div className="hidden md:flex md:items-center md:gap-1">
                      {s.role === "user" ? USER_STEPS.map((_, i) => (
                        <span key={i} className={"grid size-5 place-items-center rounded-full text-[10px] " + (i < s.stepsDone ? "bg-success text-primary-foreground" : "bg-secondary text-muted-foreground")}>
                          {i < s.stepsDone ? <Check className="size-3" /> : i + 1}
                        </span>
                      )) : <span className="text-xs text-muted-foreground">Approves conversion</span>}
                    </div>
                    <div className={"text-right text-xs " + (s.lastActiveHoursAgo === null || s.lastActiveHoursAgo > 72 ? "text-danger" : "text-muted-foreground")}>
                      {relTime(s.lastActiveHoursAgo)}
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          </div>
          <aside className="space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold">Mutual commitments</h2>
              <Card className="space-y-4 p-4 text-sm">
                <Commit title="We commit" items={pilot.startupCommits} />
                <Commit title={`${pilot.company} commits`} items={pilot.partnerCommits} />
                <div className="border-t border-border pt-3">
                  <div className="text-xs font-medium text-muted-foreground">When criteria are met</div>
                  <div className="mt-1">{pilot.nextStep}</div>
                </div>
              </Card>
            </section>
            <section>
              <h2 className="mb-3 text-sm font-semibold">Friction log</h2>
              <Card className="divide-y divide-border">
                {pilot.feedback.length === 0 && <div className="p-4 text-sm text-muted-foreground">No notes yet.</div>}
                {pilot.feedback.map((f) => (
                  <div key={f.id} className="p-4 text-sm">
                    <p>"{f.text}"</p>
                    <div className="mt-1 text-xs text-muted-foreground">{f.author} · {relTime(f.hoursAgo)}</div>
                  </div>
                ))}
              </Card>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Commit({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground">{title}</div>
      <ul className="mt-1.5 space-y-1">
        {items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" />{i}</li>)}
      </ul>
    </div>
  );
}
