import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { btn, inputCls } from "@/components/app/ui";
import { store, type Pilot } from "@/lib/pilots";

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export function EditPilotDialog({ pilot }: { pilot: Pilot }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(() => init(pilot));
  const set = (k: keyof ReturnType<typeof init>) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  function save() {
    if (!f.company.trim()) return toast.error("Business name is required");
    if (!pilot.draft && !f.problem.trim()) return toast.error("A launched pilot needs a problem defined");
    store.update(pilot.id, (p) => ({
      ...p,
      company: f.company.trim(),
      industry: f.industry.trim(),
      teamSize: Math.max(1, Number(f.teamSize) || p.teamSize),
      durationDays: Math.max(1, Number(f.durationDays) || p.durationDays),
      problem: f.problem.trim() || undefined,
      hypothesis: f.hypothesis.trim() || p.hypothesis,
      nextStep: f.nextStep.trim(),
      startupCommits: lines(f.startupCommits),
      partnerCommits: lines(f.partnerCommits),
      criteria: p.criteria.map((c, i) => i === 0 ? { ...c, label: f.winLabel.trim() || c.label, target: Number(f.winTarget) || c.target, unit: f.winUnit } : c),
      stakeholders: p.stakeholders.map((s) => s.role === "champion" && s.id === f.champId ? { ...s, name: f.champName.trim() || s.name, email: f.champEmail.trim(), title: f.champTitle.trim() } : s),
    }));
    toast.success("Pilot details updated");
    setOpen(false);
  }

  const field = (label: string, el: React.ReactNode) => (<label className="block space-y-1"><span className="text-xs text-muted-foreground">{label}</span>{el}</label>);

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setF(init(pilot)); }}>
      <DialogTrigger asChild><button className={btn("secondary")}><Pencil className="size-3.5" /> Edit details</button></DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader><DialogTitle>Edit pilot details</DialogTitle></DialogHeader>
        <div className="space-y-5">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Business</h3>
            {field("Business name", <input className={inputCls} value={f.company} onChange={set("company")} />)}
            <div className="grid grid-cols-3 gap-3">
              {field("Industry", <input className={inputCls} value={f.industry} onChange={set("industry")} />)}
              {field("Team size", <input type="number" min={1} className={inputCls} value={f.teamSize} onChange={set("teamSize")} />)}
              {field("Pilot length (days)", <input type="number" min={1} className={inputCls} value={f.durationDays} onChange={set("durationDays")} />)}
            </div>
            {field("The one problem we're solving", <textarea rows={2} className={inputCls} value={f.problem} onChange={set("problem")} />)}
            {field("Hypothesis", <textarea rows={2} className={inputCls} value={f.hypothesis} onChange={set("hypothesis")} />)}
          </section>
          {f.champId && <section className="space-y-3">
            <h3 className="text-sm font-semibold">Champion</h3>
            <div className="grid grid-cols-2 gap-3">
              {field("Name", <input className={inputCls} value={f.champName} onChange={set("champName")} />)}
              {field("Email", <input className={inputCls} value={f.champEmail} onChange={set("champEmail")} />)}
            </div>
            {field("Title", <input className={inputCls} value={f.champTitle} onChange={set("champTitle")} />)}
          </section>}
          {pilot.criteria[0] && <section className="space-y-3">
            <h3 className="text-sm font-semibold">The win</h3>
            {field("What we measure", <input className={inputCls} value={f.winLabel} onChange={set("winLabel")} />)}
            <div className="grid grid-cols-2 gap-3">
              {field("Target", <input type="number" className={inputCls} value={f.winTarget} onChange={set("winTarget")} />)}
              {field("Unit", <input className={inputCls} value={f.winUnit} onChange={set("winUnit")} />)}
            </div>
          </section>}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Ground rules</h3>
            {field("We commit to (one per line)", <textarea rows={3} className={inputCls} value={f.startupCommits} onChange={set("startupCommits")} />)}
            {field("They commit to (one per line)", <textarea rows={3} className={inputCls} value={f.partnerCommits} onChange={set("partnerCommits")} />)}
            {field("If we hit the win, next step", <textarea rows={2} className={inputCls} value={f.nextStep} onChange={set("nextStep")} />)}
          </section>
        </div>
        <DialogFooter>
          <button className={btn("ghost")} onClick={() => setOpen(false)}>Cancel</button>
          <button className={btn()} onClick={save}>Save changes</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function init(p: Pilot) {
  const ch = p.stakeholders.find((s) => s.role === "champion");
  const c = p.criteria[0];
  return {
    company: p.company, industry: p.industry, teamSize: String(p.teamSize), durationDays: String(p.durationDays),
    problem: p.problem ?? "", hypothesis: p.hypothesis, nextStep: p.nextStep,
    startupCommits: p.startupCommits.join("\n"), partnerCommits: p.partnerCommits.join("\n"),
    winLabel: c?.label ?? "", winTarget: String(c?.target ?? ""), winUnit: c?.unit ?? "",
    champId: ch?.id ?? "", champName: ch?.name ?? "", champEmail: ch?.email ?? "", champTitle: ch?.title ?? "",
  };
}
