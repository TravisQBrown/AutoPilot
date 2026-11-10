import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { Card, Logo, btn } from "@/components/app/ui";
import { usePilots, criteriaMet, champion, users, criterionProgress } from "@/lib/pilots";

export const Route = createFileRoute("/pilots/$id_/closeout")({
  head: () => ({
    meta: [
      { title: "Conversion summary — AutoPilot" },
      { name: "description", content: "One-page pilot results and conversion proposal for the owner." },
      { property: "og:title", content: "Conversion summary — AutoPilot" },
      { property: "og:description", content: "One-page pilot results and conversion proposal for the owner." },
    ],
  }),
  component: Closeout,
});

function Closeout() {
  const { id } = Route.useParams();
  const p = usePilots().find((x) => x.id === id);
  if (!p) throw notFound();
  const met = criteriaMet(p);
  const u = users(p);
  const activated = u.filter((x) => x.stepsDone > 0).length;
  const completedAll = u.filter((x) => x.stepsDone === 3).length;
  const hours = p.criteria.find((c) => c.unit === "h");
  const ready = met === p.criteria.length;
  return (
    <div className="min-h-screen bg-muted py-10">
      <div className="mx-auto mb-4 flex max-w-3xl justify-between px-6 print:hidden">
        <Link to="/pilots/$id" params={{ id: p.id }} className={btn("ghost")}>← Back to pilot</Link>
        <button className={btn("secondary")} onClick={() => window.print()}><Printer className="size-3.5" /> Print / PDF</button>
      </div>
      <Card className="mx-auto max-w-3xl p-10">
        <div className="flex items-center justify-between"><Logo /><span className="text-xs text-muted-foreground">Pilot summary · Day {p.dayNumber} of {p.durationDays}</span></div>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight">{p.company} pilot results</h1>
        <p className="mt-2 text-muted-foreground">Prepared for {champion(p)?.name ?? "the owner"}</p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <Stat label="Criteria met" value={`${met}/${p.criteria.length}`} />
          <Stat label="Time saved / week" value={hours ? `${hours.actual}h` : "—"} />
          <Stat label="Team adoption" value={`${activated}/${u.length}`} />
        </div>

        <h2 className="mt-10 text-sm font-semibold">Hypothesis</h2>
        <p className="mt-1 text-sm">{p.hypothesis}</p>

        <h2 className="mt-8 text-sm font-semibold">Success criteria</h2>
        <table className="mt-2 w-full text-sm">
          <tbody className="divide-y divide-border">
            {p.criteria.map((c) => (
              <tr key={c.id}>
                <td className="py-2">{c.label}</td>
                <td className="py-2 text-right font-mono tabular-nums text-muted-foreground">target {c.target}{c.unit}</td>
                <td className={"py-2 text-right font-mono tabular-nums " + (criterionProgress(c) >= 1 ? "text-success" : "text-danger")}>{c.actual}{c.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="mt-8 text-sm font-semibold">Adoption evidence</h2>
        <p className="mt-1 text-sm">{activated} of {u.length} daily users activated; {completedAll} completed all three milestones. {p.feedback.length} pieces of feedback logged and addressed.</p>

        <div className={"mt-10 rounded-lg border p-5 " + (ready ? "border-success/30 bg-success-soft" : "border-warning/30 bg-warning-soft")}>
          <div className="text-xs font-medium text-muted-foreground">{ready ? "All criteria met — pre-agreed next step" : "Criteria partially met — proposed next step"}</div>
          <div className="mt-1 text-lg font-semibold">{p.nextStep}</div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-10 text-xs text-muted-foreground">
          <div className="border-t border-foreground/30 pt-2">{champion(p)?.name}, {p.company}</div>
          <div className="border-t border-foreground/30 pt-2">Founder, AutoPilot</div>
        </div>
      </Card>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
