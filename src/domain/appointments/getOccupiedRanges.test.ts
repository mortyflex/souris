import { describe, expect, it } from "vitest";

import type { TimelinePhase } from "./appointment.types";
import { getOccupiedRanges } from "./getOccupiedRanges";

describe("getOccupiedRanges", () => {
  it("returns only phases that require staff", () => {
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
        phaseId: "processing",
        label: "Processing",
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
    ];

    const ranges = getOccupiedRanges(timeline);

    expect(ranges).toHaveLength(2);

    expect(ranges.map((range) => range.phaseId)).toEqual([
      "application",
      "gloss",
    ]);
  });

  it("preserves phase timing and metadata", () => {
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
    ];

    const [range] = getOccupiedRanges(timeline);

    expect(range).toMatchObject({
      appointmentId: "appointment-1",
      appointmentItemId: "item-1",
      phaseId: "application",
      label: "Application",
      durationMinutes: 15,
    });

    expect(range?.startAt.toISOString()).toBe("2026-08-16T09:00:00.000Z");
    expect(range?.endAt.toISOString()).toBe("2026-08-16T09:15:00.000Z");
  });

  it("returns an empty array when no phase requires staff", () => {
    const timeline: TimelinePhase[] = [
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "processing",
        label: "Processing",
        startAt: new Date("2026-08-16T09:15:00.000Z"),
        endAt: new Date("2026-08-16T09:50:00.000Z"),
        durationMinutes: 35,
        requiresStaff: false,
      },
    ];

    expect(getOccupiedRanges(timeline)).toEqual([]);
  });

  it("does not expose the original Date instances", () => {
    const startAt = new Date("2026-08-16T09:00:00.000Z");
    const endAt = new Date("2026-08-16T09:15:00.000Z");

    const timeline: TimelinePhase[] = [
      {
        appointmentId: "appointment-1",
        appointmentItemId: "item-1",
        phaseId: "application",
        label: "Application",
        startAt,
        endAt,
        durationMinutes: 15,
        requiresStaff: true,
      },
    ];

    const [range] = getOccupiedRanges(timeline);

    expect(range?.startAt).not.toBe(startAt);
    expect(range?.endAt).not.toBe(endAt);
  });
});
