import { useSyncExternalStore } from "react";

export type Role = "champion" | "user";
export type Health = "healthy" | "attention" | "stalled" | "completed";

export interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  useCase?: string;
  lastActiveHoursAgo: number | null; // null = never
  stepsDone: number; // 0-3
}

export interface Criterion {
  id: string;
  label: string;
  target: number;
  actual: number;
  unit: string;
}

export interface Feedback {
  id: string;
  author: string;
  text: string;
  hoursAgo: number;
}

export interface Nudge {
  playId: string;
  to: string;
  subject: string;
  body: string;
  sentAt: number;
}

export interface Pilot {
  id: string;
  token: string;
  company: string;
  industry: string;
  teamSize: number;
  durationDays: number;
  dayNumber: number;
  hypothesis: string;
  problem?: string | undefined; // the one problem this pilot solves
  nudges?: Nudge[];
  criteria: Criterion[];
  stakeholders: Stakeholder[];
  startupCommits: string[];
  partnerCommits: string[];
  nextStep: string;
  feedback: Feedback[];
  completed?: boolean;
  draft?: boolean | undefined; // saved but not launched; launch requires a problem
}

export const USER_STEPS = [
  "Run your first search",
  "Test 1 real issue from your day",
  "Rate the answer you got",
];

export const DEFAULT_STARTUP_COMMITS = [
  "Dedicated 30-min onboarding session",
  "Support replies within 4 business hours",
  "Ship up to 2 agreed feature requests",
];
export const DEFAULT_PARTNER_COMMITS = [
  "Actively test 1 core workflow by Day 5",
  "Weekly 10-minute pulse check",
  "Attend final decision meeting",
];

export const SAMPLE: Pilot[] = [
  {
    id: "p-bluebird",
    token: "bluebird-7k2m",
    problem: "Reduce time dispatchers spend reshuffling crews after last-minute cancellations.",
    company: "Bluebird Movers",
    industry: "Moving & Relocation",
    teamSize: 25,
    durationDays: 30,
    dayNumber: 14,
    hypothesis: "Dispatchers resolve scheduling conflicts faster with an AI copilot.",
    criteria: [
      { id: "c1", label: "Queries answered per dispatcher / week", target: 5, actual: 6.4, unit: "" },
      { id: "c2", label: "Hours saved on weekly scheduling", target: 3, actual: 2.6, unit: "h" },
      { id: "c3", label: "Answer accuracy rating", target: 85, actual: 89, unit: "%" },
    ],
    stakeholders: [
      { id: "s1", name: "Dana Whitfield", email: "dana@bluebirdmovers.com", role: "champion", title: "Owner", lastActiveHoursAgo: 26, stepsDone: 0 },
      { id: "s2", name: "Sarah Okafor", email: "sarah@bluebirdmovers.com", role: "user", title: "Lead Dispatcher", useCase: "Rescheduling crews after cancellations", lastActiveHoursAgo: 2, stepsDone: 3 },
      { id: "s3", name: "Marcus Lee", email: "marcus@bluebirdmovers.com", role: "user", title: "Dispatcher", useCase: "Truck allocation for long-distance jobs", lastActiveHoursAgo: 9, stepsDone: 2 },
      { id: "s4", name: "Priya Shah", email: "priya@bluebirdmovers.com", role: "user", title: "Office Manager", useCase: "Customer quote follow-ups", lastActiveHoursAgo: 30, stepsDone: 1 },
    ],
    startupCommits: DEFAULT_STARTUP_COMMITS,
    partnerCommits: DEFAULT_PARTNER_COMMITS,
    nextStep: "Convert to $249/mo Founding Partner plan (locked for 12 months)",
    feedback: [
      { id: "f1", author: "Sarah Okafor", text: "Search doesn't recognize our truck nicknames (e.g. 'Big Bertha').", hoursAgo: 5 },
      { id: "f2", author: "Marcus Lee", text: "Loved the reroute suggestion on the Denver job.", hoursAgo: 20 },
    ],
  },
  {
    id: "p-polar",
    token: "polar-3x9q",
    problem: "Stop losing same-day service calls because coordinators can't see tech availability.",
    company: "Polar Peak HVAC",
    industry: "HVAC Services",
    teamSize: 18,
    durationDays: 21,
    dayNumber: 6,
    hypothesis: "Coordinators book more same-day service calls with instant tech availability answers.",
    criteria: [
      { id: "c1", label: "Same-day bookings per week", target: 10, actual: 2, unit: "" },
      { id: "c2", label: "Hours saved on call routing", target: 4, actual: 0.5, unit: "h" },
    ],
    stakeholders: [
      { id: "s1", name: "Rick Alvarez", email: "rick@polarpeakhvac.com", role: "champion", title: "Owner / GM", lastActiveHoursAgo: 120, stepsDone: 0 },
      { id: "s2", name: "Jen Park", email: "jen@polarpeakhvac.com", role: "user", title: "Service Coordinator", useCase: "Matching techs to emergency calls", lastActiveHoursAgo: 96, stepsDone: 1 },
      { id: "s3", name: "Tom Becker", email: "tom@polarpeakhvac.com", role: "user", title: "Dispatcher", useCase: "Parts availability lookups", lastActiveHoursAgo: null, stepsDone: 0 },
    ],
    startupCommits: DEFAULT_STARTUP_COMMITS,
    partnerCommits: DEFAULT_PARTNER_COMMITS,
    nextStep: "Signed public case study + $199/mo plan",
    feedback: [{ id: "f1", author: "Jen Park", text: "Couldn't find where to connect our ServiceTitan calendar.", hoursAgo: 100 }],
  },
  {
    id: "p-ironclad",
    token: "ironclad-5p1r",
    problem: "Cut repetitive subcontractor schedule calls to the office.",
    company: "Ironclad Builders",
    industry: "Construction",
    teamSize: 40,
    durationDays: 14,
    dayNumber: 2,
    hypothesis: "Site coordinators answer subcontractor schedule questions without calling the office.",
    criteria: [{ id: "c1", label: "Calls to office avoided / week", target: 15, actual: 3, unit: "" }],
    stakeholders: [
      { id: "s1", name: "Gloria Mendez", email: "gloria@ironcladbuild.com", role: "champion", title: "COO", lastActiveHoursAgo: 8, stepsDone: 0 },
      { id: "s2", name: "Dev Patel", email: "dev@ironcladbuild.com", role: "user", title: "Site Coordinator", useCase: "Subcontractor schedules", lastActiveHoursAgo: 4, stepsDone: 1 },
    ],
    startupCommits: DEFAULT_STARTUP_COMMITS,
    partnerCommits: DEFAULT_PARTNER_COMMITS,
    nextStep: "Convert to $399/mo team plan",
    feedback: [],
  },
  {
    id: "p-crest",
    token: "crest-8h4n",
    problem: "Reduce time spent building weekly crew schedules.",
    company: "Crestline Cleaning Co.",
    industry: "Commercial Services",
    teamSize: 12,
    durationDays: 21,
    dayNumber: 21,
    completed: true,
    hypothesis: "Office managers cut crew scheduling time in half.",
    criteria: [
      { id: "c1", label: "Hours saved per week", target: 3, actual: 4.2, unit: "h" },
      { id: "c2", label: "Accuracy rating", target: 85, actual: 91, unit: "%" },
    ],
    stakeholders: [
      { id: "s1", name: "Ana Torres", email: "ana@crestline.co", role: "champion", title: "Owner", lastActiveHoursAgo: 30, stepsDone: 0 },
      { id: "s2", name: "Ben Ruiz", email: "ben@crestline.co", role: "user", title: "Office Manager", useCase: "Crew scheduling", lastActiveHoursAgo: 12, stepsDone: 3 },
    ],
    startupCommits: DEFAULT_STARTUP_COMMITS,
    partnerCommits: DEFAULT_PARTNER_COMMITS,
    nextStep: "Converted to $149/mo Founding Partner plan",
    feedback: [],
  },
];

// ---------- rules ----------
export function criterionProgress(c: Criterion) {
  return c.target === 0 ? 1 : c.actual / c.target;
}
export function criteriaMet(p: Pilot) {
  return p.criteria.filter((c) => c.actual >= c.target).length;
}
export function users(p: Pilot) {
  return p.stakeholders.filter((s) => s.role === "user");
}
export function champion(p: Pilot) {
  return p.stakeholders.find((s) => s.role === "champion");
}
export function activeWithin(s: Stakeholder, hours: number) {
  return s.lastActiveHoursAgo !== null && s.lastActiveHoursAgo <= hours;
}

/** Stalled: whole company inactive 48h+ from Day 5. Attention: users not activated by Day 3, or champion dark 72h+. */
export function pilotHealth(p: Pilot): Health {
  if (p.completed) return "completed";
  const anyRecent = p.stakeholders.some((s) => activeWithin(s, 48));
  if (p.dayNumber >= 5 && !anyRecent) return "stalled";
  const inactiveUsers = users(p).filter((u) => u.stepsDone === 0);
  const ch = champion(p);
  if (p.dayNumber >= 3 && inactiveUsers.length > 0) return "attention";
  if (ch && !activeWithin(ch, 72)) return "attention";
  return "healthy";
}

export interface Play {
  id: string;
  title: string;
  detail: string;
  action: string;
  to: "users" | "champion";
}
export function stallBreakers(p: Pilot): Play[] {
  if (p.completed) return [];
  const plays: Play[] = [];
  const inactive = users(p).filter((u) => u.stepsDone === 0);
  if (p.dayNumber >= 3 && inactive.length) {
    plays.push({
      id: "quickstart",
      title: `${inactive.length} daily user${inactive.length > 1 ? "s" : ""} not activated by Day 3`,
      detail: `Send the 3-step quick-start checklist to ${inactive.map((u) => u.name.split(" ")[0]).join(", ")}.`,
      action: "Send quick-start checklist",
      to: "users",
    });
  }
  const anyRecent = p.stakeholders.some((s) => activeWithin(s, 48));
  if (p.dayNumber >= 5 && !anyRecent) {
    plays.push({
      id: "escalate",
      title: "No company-wide activity by Day 5",
      detail: `Escalate to ${champion(p)?.name ?? "the owner"}: "Should we pause the clock or do a 5-min guided setup?"`,
      action: "Escalate to owner",
      to: "champion",
    });
  }
  return plays;
}

export function relTime(h: number | null) {
  if (h === null) return "never";
  if (h < 1) return "just now";
  if (h < 24) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// ---------- store ----------
const KEY = "autopilot.pilots.v2"; // v2: starts empty, no sample pilots
let state: Pilot[] = [];
let loaded = false;
const EMPTY: Pilot[] = [];
const subs = new Set<() => void>();
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw);
  } catch {}
}
function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  subs.forEach((f) => f());
}
export const store = {
  subscribe(f: () => void) {
    load();
    subs.add(f);
    f();
    return () => subs.delete(f);
  },
  get: () => state,
  add(p: Pilot) {
    state = [p, ...state];
    emit();
  },
  update(id: string, fn: (p: Pilot) => Pilot) {
    state = state.map((p) => (p.id === id ? fn(p) : p));
    emit();
  },
  reset() {
    state = [];
    emit();
  },
};
export function usePilots() {
  return useSyncExternalStore(store.subscribe, store.get, () => EMPTY);
}
export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/** Draft a friendly follow-up email for a stall-breaker play. */
export function draftNudge(p: Pilot, play: Play) {
  const ch = champion(p);
  const problem = p.problem ?? p.hypothesis;
  if (play.to === "champion") {
    const first = ch?.name.split(" ")[0] ?? "there";
    return {
      to: ch?.email ?? "",
      subject: `Quick check-in on the ${p.company} pilot`,
      body: `Hi ${first},\n\nWe're on Day ${p.dayNumber} of the pilot and haven't seen much activity from the team yet — totally understandable, things get busy.\n\nAs a reminder, we set out to: ${problem}\n\nWould it help if we paused the clock, or hopped on a 5-minute guided setup with your team this week? Happy to do whatever makes this easiest.\n\nThanks,\nThe AutoPilot team`,
    };
  }
  const inactive = users(p).filter((u) => u.stepsDone === 0);
  const names = inactive.map((u) => u.name.split(" ")[0]).join(" and ");
  return {
    to: inactive.map((u) => u.email).join(", "),
    subject: `3 quick steps to get started with ${p.company}'s pilot`,
    body: `Hi ${names || "team"},\n\nWe're helping ${p.company} ${problem.charAt(0).toLowerCase() + problem.slice(1)}\n\nGetting started takes about 10 minutes:\n${USER_STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nIf anything is confusing, just reply here and we'll help right away.\n\nThanks,\nThe AutoPilot team`,
  };
}

/** A pilot needs its problem defined before it can launch. */
export function needsDefinition(p: Pilot) {
  return !p.problem?.trim();
}
export function canLaunch(p: Pilot) {
  return !needsDefinition(p);
}

// ---------- activity (simulated, derived from stakeholder progress) ----------
export const ACTIVITY_GROUPS = [
  "Completed Starter Brain onboarding",
  "Asked first company-specific question",
  "Added knowledge",
  "Completed a pilot milestone",
  "Reported a blocker",
] as const;
export type ActivityGroup = (typeof ACTIVITY_GROUPS)[number];
export interface ActivityItem { group: ActivityGroup; pilot: Pilot; who: string; hoursAgo: number | null }

export function activityItems(p: Pilot): ActivityItem[] {
  const out: ActivityItem[] = [];
  for (const s of p.stakeholders) {
    const h = s.lastActiveHoursAgo;
    if (s.role === "champion") {
      if (h !== null) out.push({ group: "Added knowledge", pilot: p, who: s.name, hoursAgo: h });
      continue;
    }
    if (s.stepsDone >= 1) out.push({ group: "Completed Starter Brain onboarding", pilot: p, who: s.name, hoursAgo: h });
    if (s.stepsDone >= 2) out.push({ group: "Asked first company-specific question", pilot: p, who: s.name, hoursAgo: h });
    if (s.stepsDone >= 3) out.push({ group: "Completed a pilot milestone", pilot: p, who: s.name, hoursAgo: h });
  }
  for (const f of p.feedback) out.push({ group: "Reported a blocker", pilot: p, who: f.author, hoursAgo: f.hoursAgo });
  return out;
}
