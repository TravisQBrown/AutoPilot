import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AppHeader, Card, RoleBadge, btn, inputCls } from "@/components/app/ui";
import { store, uid, DEFAULT_PARTNER_COMMITS, DEFAULT_STARTUP_COMMITS, type Stakeholder, type Criterion } from "@/lib/pilots";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pilots/new")({
  head: () => ({
    meta: [
      { title: "New Pilot Charter — AutoPilot" },
      { name: "description", content: "Set up a pilot with clear stakeholders, success criteria and mutual commitments." },
      { property: "og:title", content: "New Pilot Charter — AutoPilot" },
      { property: "og:description", content: "Set up a pilot with clear stakeholders, success criteria and mutual commitments." },
    ],
  }),
  component: Wizard,
});

const STEPS = ["Company", "Stakeholders", "Success criteria", "Commitments", "Next step"];
const PRESETS: Omit<Criterion, "id" | "actual">[] = [
  { label: "Queries answered per user / week", target: 5, unit: "" },
  { label: "Hours saved on weekly scheduling", target: 3, unit: "h" },
  { label: "Answer accuracy rating", target: 85, unit: "%" },
];

function Wizard() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [teamSize, setTeamSize] = useState(10);
  const [duration, setDuration] = useState(21);
  const [champ, setChamp] = useState({ name: "", email: "", title: "Owner" });
  const [team, setTeam] = useState([{ name: "", email: "", title: "", useCase: "" }]);
  const [hypothesis, setHypothesis] = useState("");
  const [criteria, setCriteria] = useState<Omit<Criterion, "id" | "actual">[]>([PRESETS[0]!]);
  const [startup, setStartup] = useState(DEFAULT_STARTUP_COMMITS.join("\n"));
  const [partner, setPartner] = useState(DEFAULT_PARTNER_COMMITS.join("\n"));
  const [nextStep, setNextStep] = useState("Convert to $249/mo Founding Partner plan");

  const valid = [
    company.trim() && industry.trim(),
    champ.name.trim() && champ.email.includes("@") && team.some((t) => t.name.trim()),
    hypothesis.trim() && criteria.length >= 1 && criteria.every((c) => c.label.trim()),
    true,
    nextStep.trim(),
  ][step];

  const launch = () => {
    const id = "p-" + uid();
    const stakeholders: Stakeholder[] = [
      { id: uid(), ...champ, role: "champion", lastActiveHoursAgo: null, stepsDone: 0 },
      ...team.filter((t) => t.name.trim()).map((t) => ({ id: uid(), ...t, role: "user" as const, lastActiveHoursAgo: null, stepsDone: 0 })),
    ];
    store.add({
      id, token: company.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20) + "-" + uid().slice(0, 4),
      company, industry, teamSize, durationDays: duration, dayNumber: 0, hypothesis,
      criteria: criteria.map((c) => ({ ...c, id: uid(), actual: 0 })),
      stakeholders,
      startupCommits: startup.split("\n").filter(Boolean),
      partnerCommits: partner.split("\n").filter(Boolean),
      nextStep, feedback: [],
    });
    nav({ to: "/pilots/$id", params: { id } });
  };

  const L = ({ children }: { children: string }) => <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{children}</label>;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Pilot Charter</h1>
        <p className="mt-1 text-sm text-muted-foreground">Agree on who, what success looks like, and what happens next — before day one.</p>
        <ol className="mt-8 flex gap-1">
          {STEPS.map((s, i) => (
            <li key={s} className="flex-1">
              <div className={cn("h-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />
              <div className={cn("mt-2 text-xs", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>{s}</div>
            </li>
          ))}
        </ol>

        <Card className="mt-6 space-y-5 p-6">
          {step === 0 && (
            <>
              <div><L>Company name</L><input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Bluebird Movers" /></div>
              <div><L>Industry</L><input className={inputCls} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="Moving & Relocation" /></div>
              <div><L>Team size</L><input type="number" min={1} className={inputCls} value={teamSize} onChange={(e) => setTeamSize(+e.target.value)} /></div>
              <div>
                <L>Pilot duration</L>
                <div className="flex gap-2">
                  {[14, 21, 30].map((d) => (
                    <button key={d} onClick={() => setDuration(d)} className={cn(btn("secondary"), "flex-1", duration === d && "border-primary bg-accent text-accent-foreground")}>{d} days</button>
                  ))}
                </div>
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <div>
                <div className="mb-2 flex items-center gap-2"><RoleBadge role="champion" /><span className="text-xs text-muted-foreground">Approves conversion, steps in if the pilot stalls</span></div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <input className={inputCls} placeholder="Name" value={champ.name} onChange={(e) => setChamp({ ...champ, name: e.target.value })} />
                  <input className={inputCls} placeholder="Email" value={champ.email} onChange={(e) => setChamp({ ...champ, email: e.target.value })} />
                  <input className={inputCls} placeholder="Title" value={champ.title} onChange={(e) => setChamp({ ...champ, title: e.target.value })} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2"><RoleBadge role="user" /><span className="text-xs text-muted-foreground">Front-line testers with a specific use case</span></div>
                <div className="space-y-3">
                  {team.map((t, i) => (
                    <div key={i} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
                      {(["name", "email", "title", "useCase"] as const).map((k) => (
                        <input key={k} className={inputCls} placeholder={{ name: "Name", email: "Email", title: "Role (e.g. Dispatcher)", useCase: "Assigned use case" }[k]} value={t[k]} onChange={(e) => setTeam(team.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))} />
                      ))}
                      {team.length > 1 && <button className={btn("ghost") + " sm:col-span-2 justify-self-end"} onClick={() => setTeam(team.filter((_, j) => j !== i))}><Trash2 className="size-3.5" /> Remove</button>}
                    </div>
                  ))}
                  <button className={btn("secondary")} onClick={() => setTeam([...team, { name: "", email: "", title: "", useCase: "" }])}><Plus className="size-3.5" /> Add daily user</button>
                </div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div><L>Core hypothesis</L><textarea className={inputCls} rows={2} value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="Dispatchers resolve scheduling conflicts faster…" /></div>
              <div>
                <L>Success criteria (1–3)</L>
                <div className="space-y-2">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inputCls} value={c.label} onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                      <input type="number" className={inputCls + " w-24"} value={c.target} onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, target: +e.target.value } : x)))} />
                      <input className={inputCls + " w-16"} value={c.unit} placeholder="unit" onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, unit: e.target.value } : x)))} />
                      <button className={btn("ghost")} onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} disabled={criteria.length === 1}><Trash2 className="size-3.5" /></button>
                    </div>
                  ))}
                </div>
                {criteria.length < 3 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PRESETS.filter((p) => !criteria.some((c) => c.label === p.label)).map((p) => (
                      <button key={p.label} className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-secondary" onClick={() => setCriteria([...criteria, p])}>+ {p.label}</button>
                    ))}
                    <button className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs hover:bg-secondary" onClick={() => setCriteria([...criteria, { label: "", target: 1, unit: "" }])}>+ Custom</button>
                  </div>
                )}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div><L>We commit (one per line)</L><textarea className={inputCls} rows={3} value={startup} onChange={(e) => setStartup(e.target.value)} /></div>
              <div><L>Partner commits (one per line)</L><textarea className={inputCls} rows={3} value={partner} onChange={(e) => setPartner(e.target.value)} /></div>
            </>
          )}
          {step === 4 && (
            <div><L>When criteria are met…</L><input className={inputCls} value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
              <p className="mt-2 text-xs text-muted-foreground">e.g. a Founding Partner plan, or a signed public case study.</p></div>
          )}
        </Card>

        <div className="mt-6 flex justify-between">
          <button className={btn("ghost")} disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
          {step < 4 ? (
            <button className={btn()} disabled={!valid} onClick={() => setStep(step + 1)}>Continue</button>
          ) : (
            <button className={btn()} disabled={!valid} onClick={launch}>Launch pilot</button>
          )}
        </div>
      </main>
    </div>
  );
}
