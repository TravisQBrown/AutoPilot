import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink, Copy, FileText, Zap, Check, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { EditPilotDialog } from "@/components/app/EditPilotDialog";
import { AppHeader, Card, StatusPill, RoleBadge, Bar, btn, inputCls } from "@/components/app/ui";
import { usePilots, pilotHealth, stallBreakers, criterionProgress, relTime, USER_STEPS, draftNudge, store, needsDefinition, type Play, type Pilot } from "@/lib/pilots";

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
  const [reviewing, setReviewing] = useState<Play | null>(null);
  const [problemDraft, setProblemDraft] = useState("");
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
              {pilot.draft ? <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">Draft</span> : <StatusPill health={h} />}
              {needsDefinition(pilot) && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning">Needs definition</span>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{pilot.industry} · {pilot.teamSize} people · Day {pilot.dayNumber} of {pilot.durationDays}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <EditPilotDialog pilot={pilot} />
            {!pilot.draft && <button className={btn("secondary")} onClick={() => { const o = pilot.stakeholders.find((s) => s.role === "champion"); const c = pilot.criteria[0]; navigator.clipboard?.writeText(`Hi ${o?.name.split(" ")[0] ?? "there"}, our ${pilot.durationDays}-day pilot is live.${pilot.problem ? ` The goal: ${pilot.problem.replace(/\.$/, "")}.` : ""}${c ? ` We'll call it a win at ${c.target}${c.unit ? " " + c.unit : ""} — ${c.label.toLowerCase()}.` : ""} Your team's link: ${hubUrl} — I'll check in this week.`); toast.success("Kickoff message copied"); }}>
              <Mail className="size-3.5" /> Copy kickoff message
            </button>}
            <button className={btn("secondary")} onClick={() => { navigator.clipboard?.writeText(hubUrl); toast.success("Magic link copied"); }}>
              <Copy className="size-3.5" /> Copy magic link
            </button>
            <Link to="/hub/$token" params={{ token: pilot.token }} className={btn("secondary")}><ExternalLink className="size-3.5" /> Partner Hub</Link>
            <Link to="/pilots/$id/closeout" params={{ id: pilot.id }} className={btn()}><FileText className="size-3.5" /> Conversion summary</Link>
          </div>
        </div>

        {needsDefinition(pilot) && (
          <Card className="mt-6 max-w-2xl space-y-2 border-warning/30 bg-warning-soft p-4">
            <div className="text-sm font-medium">What's the one problem we're trying to solve during this pilot?</div>
            <textarea className={inputCls} rows={2} value={problemDraft} onChange={(e) => setProblemDraft(e.target.value)} placeholder="Reduce time spent answering repetitive employee questions." />
            <div className="flex justify-end">
              <button className={btn()} disabled={!problemDraft.trim()} onClick={() => { store.update(pilot.id, (p) => ({ ...p, problem: problemDraft.trim(), draft: undefined })); toast.success(pilot.draft ? "Pilot launched" : "Problem saved"); }}>
                {pilot.draft ? "Save & launch pilot" : "Save problem"}
              </button>
            </div>
          </Card>
        )}
        {pilot.problem && <p className="mt-6 max-w-2xl text-sm"><span className="text-muted-foreground">Problem we're solving — </span>{pilot.problem}</p>}
        <p className="mt-2 max-w-2xl text-sm"><span className="text-muted-foreground">Hypothesis — </span>{pilot.hypothesis}</p>

        {plays.length > 0 && (
          <div className="mt-6 space-y-3">
            {plays.map((pl) => (
              <Card key={pl.id} className="flex items-center justify-between gap-4 border-warning/30 bg-warning-soft p-4">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium"><Zap className="size-4 text-warning" /> {pl.title}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{pl.detail}</p>
                </div>
                {(() => {
                  const sent = pilot.nudges?.find((n) => n.playId === pl.id);
                  return sent
                    ? <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"><Check className="size-3.5 text-success" /> Email sent {new Date(sent.sentAt).toLocaleDateString()}</span>
                    : <button className={btn() + " shrink-0"} onClick={() => setReviewing(pl)}><Mail className="size-3.5" /> Review email</button>;
                })()}
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
      {reviewing && <ReviewEmail pilot={pilot} play={reviewing} onClose={() => setReviewing(null)} />}
    </div>
  );
}

function ReviewEmail({ pilot, play, onClose }: { pilot: Pilot; play: Play; onClose: () => void }) {
  const draft = draftNudge(pilot, play);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const approve = () => {
    store.update(pilot.id, (p) => ({ ...p, nudges: [...(p.nudges ?? []), { playId: play.id, to: draft.to, subject, body, sentAt: Date.now() }] }));
    toast.success(`Email sent to ${draft.to}`);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" onClick={onClose}>
      <Card className="w-full max-w-xl space-y-4 bg-card p-6" >
        <div onClick={(e) => e.stopPropagation()} className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Review before sending</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">AutoPilot drafted this from: {play.title.toLowerCase()}. Edit anything, then approve.</p>
            </div>
            <button className={btn("ghost")} onClick={onClose} aria-label="Close"><X className="size-4" /></button>
          </div>
          <div className="text-xs"><span className="text-muted-foreground">To: </span>{draft.to}</div>
          <input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject" />
          <textarea className={inputCls + " font-sans"} rows={12} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Email body" />
          <div className="flex justify-end gap-2">
            <button className={btn("ghost")} onClick={onClose}>Dismiss</button>
            <button className={btn()} onClick={approve} disabled={!subject.trim() || !body.trim()}><Check className="size-3.5" /> Approve & send</button>
          </div>
        </div>
      </Card>
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
