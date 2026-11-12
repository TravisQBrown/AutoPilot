import { describe, it, expect } from "vitest";
import { store, stallBreakers, draftNudge } from "@/lib/pilots";

describe("follow-up drafts", () => {
  it("quick-start email goes to inactive daily users and names the pilot problem", () => {
    const p = store.get().find((x) => x.id === "p-polar")!;
    const play = stallBreakers(p).find((x) => x.id === "quickstart")!;
    const d = draftNudge(p, play);
    expect(d.to).toBe("tom@polarpeakhvac.com");
    expect(d.body).toContain("same-day service calls");
  });
});
