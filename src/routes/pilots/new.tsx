import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppHeader, Card, RoleBadge, btn, inputCls } from "@/components/app/ui";
import { store, uid, type Stakeholder } from "@/lib/pilots";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pilots/new")({
  head: () => ({
    meta: [
      { title: "New Pilot — AutoPilot" },
      { name: "description", content: "Launch a pilot in three quick steps: who and the problem, one win, and the ground rules." },
      { property: "og:title", content: "New Pilot — AutoPilot" },
      { property: "og:description", content: "Launch a pilot in three quick steps: who and the problem, one win, and the ground rules." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wizard,
});

const STEPS = ["Who & the problem", "One win", "Ground rules"];
const PROBLEMS = [
  "Stop the team interrupting the owner with repetitive questions.",
  "Cut morning crew scheduling time in half.",
  "Find job history and client notes instantly on a phone.",
];
const WINS = [
  { label: "Days a week the team uses it", target: 3, unit: "days" },
  { label: "Questions answered per person each week", target: 5, unit: "" },
  { label: "Hours saved on scheduling each week", target: 3, unit: "h" },
];
const OUR = "We reply within 2 hours by text or chat\nWe won't change how you work today\nWe check in with the owner once a week";
const THEIRS = "Owner joins a 10-minute check-in each week\nThe team tries it in their normal day";

function Wizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [owner, setOwner] = useState({ name: "", email: "" });
  const [team, setTeam] = useState([{ name: "", title: "" }]);
  const [problem, setProblem] = useState("");
  const [win, setWin] = useState(WINS[0]!);
  const [duration, setDuration] = useState(14);
  const [ours, setOurs] = useState(OUR);
  const [theirs, setTheirs] = useState(THEIRS);
  const [nextStep, setNextStep] = useState("Move to the $199/mo Founding Partner plan");

  const valid = [
    company.trim() && owner.name.trim() && owner.email.trim() && team.some((t) => t.name.trim()),
    win.label.trim() && win.target > 0,
    nextStep.trim() && problem.trim(),
  ][step];

  const launch = (draft = false) => {
    const id = "p-" + uid();
    const users = team.filter((t) => t.name.trim());
    const stakeholders: Stakeholder[] = [
      { id: uid(), name: owner.name, email: owner.email, title: "Owner", role: "champion", lastActiveHoursAgo: null, stepsDone: 0 },
      ...users.map((t) => ({ id: uid(), name: t.name, email: "", title: t.title, useCase: problem.trim(), role: "user" as const, lastActiveHoursAgo: null, stepsDone: 0 })),
    ];
    store.add({
      id, token: company.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) + "-" + uid().slice(0, 4),
      company, industry: industry.trim() || "Small business", teamSize: Math.max(users.length + 1, 1), durationDays: duration, dayNumber: 0,
      hypothesis: `Win: ${win.label} — reach ${win.target}${win.unit ? " " + win.unit : ""}`,
      problem: problem.trim() || undefined, draft: draft || undefined,
      criteria: [{ ...win, id: uid(), actual: 0 }],
      stakeholders,
      startupCommits: ours.split("\n").filter(Boolean),
      partnerCommits: theirs.split("\n").filter(Boolean),
      nextStep, feedback: [],
    });
    nav({ to: "/pilots/$id", params: { id } });
  };

  const L = ({ children }: { children: React.ReactNode }) => <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{children}</label>;
  const chip = (on: boolean) => cn("rounded-full border px-3 py-1.5 text-left text-xs", on ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-secondary");

  const problemBox = (
    <div>
      <L>What's the one problem we're solving? {step === 0 && "(you can add this later)"}</L>
      <div className="mb-2 flex flex-wrap gap-2">
        {PROBLEMS.map((p) => <button key={p} className={chip(problem === p)} onClick={() => setProblem(p)}>{p}</button>)}
      </div>
      <textarea className={inputCls} rows={2} value={problem} onChange={(e) => setProblem(e.target.value)} placeholder="Or write it in one sentence…" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">New pilot</h1>
        <p className="mt-1 text-sm text-muted-foreground">Three quick steps. Sensible defaults are filled in — change only what you need.</p>
        <ol className="mt-8 flex gap-1">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={cn("h-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />
              <div className={cn("mt-2 text-xs", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>{i + 1}. {s}</div>
            </li>
          ))}
        </ol>

        <Card className="mt-6 space-y-6 p-6">
          {step === 0 && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><L>Business name</L><input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Bluebird Movers" /></div>
                <div><L>Type of business (optional)</L><input className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Moving" /></div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><RoleBadge role="champion" /><span className="text-xs text-muted-foreground">The owner who says yes at the end</span></div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className={inputCls} placeholder="Name" value={owner.name} onChange={(e) => setOwner({ ...owner, name: e.target.value })} />
                  <input className={inputCls} placeholder="Phone or email" value={owner.email} onChange={(e) => setOwner({ ...owner, email: e.target.value })} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><RoleBadge role="user" /><span className="text-xs text-muted-foreground">1–2 people who'll use it every day</span></div>
                <div className="space-y-2">
                  {team.map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inputCls} placeholder="Name" value={t.name} onChange={(e) => setTeam(team.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                      <input className={inputCls} placeholder="Job (e.g. Dispatcher)" value={t.title} onChange={(e) => setTeam(team.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
                      {team.length > 1 && <button className={btn("ghost")} onClick={() => setTeam(team.filter((_, j) => j !== i))}><Trash2 className="size-3.5" /></button>}
                    </div>
                  ))}
                  {team.length < 3 && <button className={btn("ghost")} onClick={() => setTeam([...team, { name: "", title: "" }])}><Plus className="size-3.5" /> Add person</button>}
                </div>
              </div>
              {problemBox}
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <L>What one result proves this works?</L>
                <div className="space-y-2">
                  {WINS.map((w) => (
                    <button key={w.label} className={cn(chip(win.label === w.label), "block w-full rounded-md")} onClick={() => setWin(w)}>{w.label}</button>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px_80px]">
                <div><L>Win</L><input className={inputCls} value={win.label} onChange={(e) => setWin({ ...win, label: e.target.value })} /></div>
                <div><L>Target</L><input type="number" min={1} className={inputCls} value={win.target} onChange={(e) => setWin({ ...win, target: +e.target.value })} /></div>
                <div><L>Unit</L><input className={inputCls} value={win.unit} onChange={(e) => setWin({ ...win, unit: e.target.value })} /></div>
              </div>
              <div>
                <L>How long?</L>
                <div className="flex gap-2">
                  {[14, 21, 30].map((d) => (
                    <button key={d} onClick={() => setDuration(d)} className={cn(btn("secondary"), "flex-1", duration === d && "border-primary bg-accent text-accent-foreground")}>{d} days{d === 14 && " · best"}</button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Short pilots keep busy teams engaged.</p>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div><L>Our promise (one per line)</L><textarea className={inputCls} rows={3} value={ours} onChange={(e) => setOurs(e.target.value)} /></div>
              <div><L>Their promise (one per line)</L><textarea className={inputCls} rows={2} value={theirs} onChange={(e) => setTheirs(e.target.value)} /></div>
              <div><L>If we hit the win…</L><input className={inputCls} value={nextStep} onChange={(e) => setNextStep(e.target.value)} /></div>
              {!problem.trim() && (
                <div className="rounded-md border border-warning/30 bg-warning-soft p-3">
                  {problemBox}
                  <p className="mt-2 text-xs text-muted-foreground">Needs definition — required to launch. You can save as a draft instead.</p>
                </div>
              )}
            </>
          )}
        </Card>

        <div className="mt-6 flex justify-between">
          <button className={btn("ghost")} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          {step < 2 ? (
            <button className={btn()} disabled={!valid} onClick={() => setStep(step + 1)}>Continue</button>
          ) : (
            <div className="flex gap-2">
              {!problem.trim() && <button className={btn("secondary")} disabled={!nextStep.trim()} onClick={() => launch(true)}>Save as draft</button>}
              <button className={btn()} disabled={!valid} onClick={() => launch()}>Launch pilot</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
