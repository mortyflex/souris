// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TimelinePhase } from "@/domain/appointments/appointment.types";

import { AgendaDayEventPhases } from "./agenda-day-event-phases";

function createPhases(): TimelinePhase[] {
  return [
    {
      appointmentId: "appointment-1",
      appointmentItemId: "item-1",
      phaseId: "color",
      label: "Couleur",
      startAt: new Date(2026, 7, 16, 9, 15),
      endAt: new Date(2026, 7, 16, 9, 30),
      durationMinutes: 15,
      requiresStaff: true,
    },
    {
      appointmentId: "appointment-1",
      appointmentItemId: "item-1",
      phaseId: "processing",
      label: "Pose",
      startAt: new Date(2026, 7, 16, 9, 30),
      endAt: new Date(2026, 7, 16, 9, 50),
      durationMinutes: 20,
      requiresStaff: false,
    },
    {
      appointmentId: "appointment-1",
      appointmentItemId: "item-2",
      phaseId: "gloss",
      label: "Gloss",
      startAt: new Date(2026, 7, 16, 9, 50),
      endAt: new Date(2026, 7, 16, 10, 5),
      durationMinutes: 15,
      requiresStaff: true,
    },
  ];
}

describe("AgendaDayEventPhases", () => {
  it("renders every phase in chronological order", () => {
    render(<AgendaDayEventPhases color="rose" phases={createPhases()} />);

    expect(screen.getByText("Couleur")).toBeInTheDocument();

    expect(screen.getByText("Pose")).toBeInTheDocument();

    expect(screen.getByText("Gloss")).toBeInTheDocument();
  });

  it("shows processing availability", () => {
    render(<AgendaDayEventPhases color="rose" phases={createPhases()} />);

    expect(screen.getByText("Disponible")).toBeInTheDocument();
  });

  it("marks active and processing phases", () => {
    const { container } = render(
      <AgendaDayEventPhases color="rose" phases={createPhases()} />,
    );

    expect(
      container.querySelector(
        '[data-phase-id="color"][data-requires-staff="true"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-phase-id="processing"][data-requires-staff="false"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-phase-id="gloss"][data-requires-staff="true"]',
      ),
    ).toBeInTheDocument();
  });

  it("uses duration as the vertical proportion", () => {
    const { container } = render(
      <AgendaDayEventPhases color="rose" phases={createPhases()} />,
    );

    expect(container.querySelector('[data-phase-id="color"]')).toHaveStyle({
      flexGrow: "15",
    });

    expect(container.querySelector('[data-phase-id="processing"]')).toHaveStyle(
      {
        flexGrow: "20",
      },
    );

    expect(container.querySelector('[data-phase-id="gloss"]')).toHaveStyle({
      flexGrow: "15",
    });
  });

  it("renders nothing when no valid phase exists", () => {
    const { container } = render(
      <AgendaDayEventPhases color="rose" phases={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
