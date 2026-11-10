import { describe, expect, it } from "vitest";
import { pilotHealth, stallBreakers, type Pilot } from "@/lib/pilots";

const base = (o: Partial<Pilot>): Pilot => ({
  id: "x", token: "t", company: "Co", industry: "", teamSize: 5, durationDays: 21, dayNumber: 1, hypothesis: "",
  criteria: [], startupCommits: [], partnerCommits: [], nextStep: "", feedback: [],
  stakeholders: [
    { id: "o", name: "Owner", email: "", role: "champion", title: "", lastActiveHoursAgo: 1, stepsDone: 0 },
    { id: "u", name: "User", email: "", role: "user", title: "", lastActiveHoursAgo: 1, stepsDone: 0 },
  ], ...o,
});

describe("stall breakers", () => {
  it("suggests quick-start when a daily user hasn't activated by Day 3", () => {
    expect(stallBreakers(base({ dayNumber: 3 })).map((p) => p.id)).toContain("quickstart");
    expect(stallBreakers(base({ dayNumber: 2 })).map((p) => p.id)).not.toContain("quickstart");
  });
  it("escalates to the owner when nobody is active by Day 5", () => {
    const p = base({ dayNumber: 5 });
    p.stakeholders.forEach((s) => (s.lastActiveHoursAgo = 100));
    expect(stallBreakers(p).map((x) => x.id)).toContain("escalate");
    expect(pilotHealth(p)).toBe("stalled");
  });
});
