import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Card, RoleBadge, Bar, btn, inputCls } from "@/components/app/ui";
import { usePilots, store, pilotHealth, criterionProgress, criteriaMet, USER_STEPS, uid } from "@/lib/pilots";

export const Route = createFileRoute("/hub/$token")({
  head: () => ({
    meta: [
      { title: "Your Pilot Hub — AutoPilot" },
      { name: "description", content: "Your pilot progress, next steps and a quick way to share feedback." },
      { property: "og:title", content: "Your Pilot Hub — AutoPilot" },
      { property: "og:description", content: "Your pilot progress, next steps and a quick way to share feedback." },
    ],
  }),
  component: Hub,
});

function Hub() {
  const { token } = Route.useParams();
  const p = usePilots().find((x) => x.token === token);
  const [as, setAs] = useState<string | null>(null);
  const [note, setNote] = useState("");
  if (!p) throw notFound();
  const me = p.stakeholders.find((s) => s.id === as);
  const h = pilotHealth(p);
  const healthText = { healthy: "On track", attention: "Needs a little attention", stalled: "Paused — let's restart", completed: "Complete" }[h];

  if (!me) {
    return (
      <div className="grid min-h-screen place-items-center bg-muted px-6">
        <Card className="w-full max-w-md p-8">
          <div className="text-xs font-medium text-primary">Pilot Hub</div>
          <h1 className="mt-1 text-xl font-semibold">{p.company} × AutoPilot</h1>
          <p className="mt-1 text-sm text-muted-foreground">Who's checking in?</p>
          <div className="mt-6 space-y-2">
            {p.stakeholders.map((s) => (
              <button key={s.id} onClick={() => setAs(s.id)} className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2.5 text-left text-sm hover:bg-secondary">
                <span><span className="font-medium">{s.name}</span><span className="text-muted-foreground"> · {s.title}</span></span>
                <RoleBadge role={s.role} />
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const touch = () => store.update(p.id, (x) => ({ ...x, stakeholders: x.stakeholders.map((s) => (s.id === me.id ? { ...s, lastActiveHoursAgo: 0 } : s)) }));
  const doStep = (i: number) =>
    store.update(p.id, (x) => ({ ...x, stakeholders: x.stakeholders.map((s) => (s.id === me.id ? { ...s, stepsDone: Math.max(s.stepsDone, i + 1), lastActiveHoursAgo: 0 } : s)) }));
  const send = () => {
    if (!note.trim()) return;
    store.update(p.id, (x) => ({ ...x, feedback: [{ id: uid(), author: me.name, text: note.trim().slice(0, 280), hoursAgo: 0 }, ...x.feedback] }));
    touch();
    setNote("");
    toast.success("Thanks — the team will reply within 4 business hours.");
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="mx-auto max-w-xl px-6 py-10">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-primary">{p.company} Pilot Hub</div>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setAs(null)}>Not {me.name.split(" ")[0]}?</button>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hi {me.name.split(" ")[0]} 👋</h1>

        {me.role === "champion" ? (
          <>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Mini label="Days left" value={String(Math.max(0, p.durationDays - p.dayNumber))} />
              <Mini label="Goals met" value={`${criteriaMet(p)}/${p.criteria.length}`} />
              <Mini label="Health" value={healthText} small />
            </div>
            <Card className="mt-4 divide-y divide-border">
              {p.criteria.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex justify-between text-sm"><span>{c.label}</span><span className="font-mono">{c.actual}{c.unit} / {c.target}{c.unit}</span></div>
                  <div className="mt-2"><Bar value={criterionProgress(c)} tone={criterionProgress(c) >= 1 ? "success" : "primary"} /></div>
                </div>
              ))}
            </Card>
            <Card className="mt-4 p-4 text-sm">
              <div className="text-xs text-muted-foreground">If goals are met</div>
              <div className="mt-1 font-medium">{p.nextStep}</div>
            </Card>
          </>
        ) : (
          <Card className="mt-6 p-2">
            <div className="px-3 pt-2 text-xs text-muted-foreground">Your 3 steps · {me.useCase}</div>
            {USER_STEPS.map((s, i) => {
              const done = i < me.stepsDone;
              const next = i === me.stepsDone;
              return (
                <button key={s} disabled={!next} onClick={() => doStep(i)} className={"mt-1 flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm " + (next ? "hover:bg-accent" : "")}>
                  <span className={"grid size-6 place-items-center rounded-full text-xs " + (done ? "bg-success text-primary-foreground" : next ? "border-2 border-primary text-primary" : "bg-secondary text-muted-foreground")}>
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </span>
                  <span className={done ? "text-muted-foreground line-through" : ""}>{s}</span>
                  {next && <span className="ml-auto text-xs font-medium text-primary">Mark done</span>}
                </button>
              );
            })}
            <div className="px-3 pb-3 pt-2"><Bar value={me.stepsDone / 3} tone="success" /></div>
          </Card>
        )}

        <Card className="mt-6 p-4">
          <div className="flex items-center gap-1.5 text-sm font-medium"><MessageSquare className="size-4" /> Stuck or found a bug?</div>
          <p className="text-xs text-muted-foreground">Drop a 1-line note.</p>
          <div className="mt-3 flex gap-2">
            <input className={inputCls} value={note} maxLength={280} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="e.g. Couldn't find the reschedule button" />
            <button className={btn()} onClick={send}>Send</button>
          </div>
        </Card>
      </div>
    </div>
  );
}
function Mini({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <Card className="p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={small ? "mt-1 text-sm font-medium" : "mt-1 font-mono text-xl font-semibold"}>{value}</div>
    </Card>
  );
}
