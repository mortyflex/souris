import { describe, expect, it } from "vitest";

import type { TimelinePhase } from "./appointment.types";
import { getFreeRanges } from "./getFreeRanges";

describe("getFreeRanges", () => {
  it("returns only phases that do not require staff", () => {
    const timeline: TimelinePhase[] = [
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "application",
        label: "Application",
        startAt: new Date("2026-08-16T09:00:00.000Z"),
        endAt: new Date("2026-08-16T09:15:00.000Z"),
        durationMinutes: 15,
        requiresStaff: true,
      },
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "root-processing",
        label: "Root color processing",
        startAt: new Date("2026-08-16T09:15:00.000Z"),
        endAt: new Date("2026-08-16T09:50:00.000Z"),
        durationMinutes: 35,
        requiresStaff: false,
      },
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-2",
        phaseId: "gloss",
        label: "Gloss",
        startAt: new Date("2026-08-16T09:50:00.000Z"),
        endAt: new Date("2026-08-16T10:00:00.000Z"),
        durationMinutes: 10,
        requiresStaff: true,
      },
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-2",
        phaseId: "gloss-processing",
        label: "Gloss processing",
        startAt: new Date("2026-08-16T10:00:00.000Z"),
        endAt: new Date("2026-08-16T10:10:00.000Z"),
        durationMinutes: 10,
        requiresStaff: false,
      },
    ];

    const ranges = getFreeRanges(timeline);

    expect(ranges).toHaveLength(2);

    expect(ranges.map((range) => range.phaseId)).toEqual([
      "root-processing",
      "gloss-processing",
    ]);
  });

  it("preserves the available duration and appointment context", () => {
    const timeline: TimelinePhase[] = [
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "processing",
        label: "Root color processing",
        startAt: new Date("2026-08-16T09:15:00.000Z"),
        endAt: new Date("2026-08-16T09:50:00.000Z"),
        durationMinutes: 35,
        requiresStaff: false,
      },
    ];

    const [range] = getFreeRanges(timeline);

    expect(range).toMatchObject({
      appointmentId: "appointment-1",
      appointmentItemId: "item-1",
      phaseId: "processing",
      label: "Root color processing",
      durationMinutes: 35,
    });

    expect(range?.startAt.toISOString()).toBe("2026-08-16T09:15:00.000Z");
    expect(range?.endAt.toISOString()).toBe("2026-08-16T09:50:00.000Z");
  });

  it("returns an empty array for a simple fully occupied service", () => {
    const timeline: TimelinePhase[] = [
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "blow-dry",
        label: "Blow-dry",
        startAt: new Date("2026-08-16T09:00:00.000Z"),
        endAt: new Date("2026-08-16T09:30:00.000Z"),
        durationMinutes: 30,
        requiresStaff: true,
      },
    ];

    expect(getFreeRanges(timeline)).toEqual([]);
  });

  it("does not mutate timeline phases", () => {
    const startAt = new Date("2026-08-16T09:15:00.000Z");

    const timeline: TimelinePhase[] = [
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "processing",
        label: "Processing",
        startAt,
        endAt: new Date("2026-08-16T09:50:00.000Z"),
        durationMinutes: 35,
        requiresStaff: false,
      },
    ];

    const [range] = getFreeRanges(timeline);

    expect(range?.startAt).not.toBe(startAt);
    expect(timeline[0]?.startAt.toISOString()).toBe("2026-08-16T09:15:00.000Z");
  });
});
