// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { AppointmentPhase } from "@/domain/appointments/appointment.types";

import { AppointmentPhaseTimeline } from "./appointment-phase-timeline";

function createPhases(): AppointmentPhase[] {
  return [
    {
      id: "application",
      name: "Application",
      durationMinutes: 15,
      requiresStaff: true,
    },
    {
      id: "processing",
      name: "Pose",
      durationMinutes: 35,
      requiresStaff: false,
    },
    {
      id: "finish",
      name: "Brushing",
      durationMinutes: 20,
      requiresStaff: true,
    },
  ];
}

describe("AppointmentPhaseTimeline", () => {
  it("renders every appointment phase", () => {
    render(<AppointmentPhaseTimeline color="rose" phases={createPhases()} />);

    expect(screen.getByText("Application")).toBeInTheDocument();

    expect(screen.getByText("Pose")).toBeInTheDocument();

    expect(screen.getByText("Brushing")).toBeInTheDocument();
  });

  it("displays phase durations", () => {
    render(<AppointmentPhaseTimeline color="rose" phases={createPhases()} />);

    expect(screen.getByText("15 min")).toBeInTheDocument();

    expect(screen.getByText("35 min")).toBeInTheDocument();

    expect(screen.getByText("20 min")).toBeInTheDocument();
  });

  it("distinguishes active and processing phases", () => {
    const { container } = render(
      <AppointmentPhaseTimeline color="rose" phases={createPhases()} />,
    );

    expect(
      container.querySelector(
        '[data-phase-id="application"][data-requires-staff="true"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-phase-id="processing"][data-requires-staff="false"]',
      ),
    ).toBeInTheDocument();

    expect(
      container.querySelector(
        '[data-phase-id="finish"][data-requires-staff="true"]',
      ),
    ).toBeInTheDocument();
  });

  it("uses phase durations as proportional flex values", () => {
    const { container } = render(
      <AppointmentPhaseTimeline color="rose" phases={createPhases()} />,
    );

    expect(
      container.querySelector('[data-phase-id="application"]'),
    ).toHaveStyle({
      flexGrow: "15",
    });

    expect(container.querySelector('[data-phase-id="processing"]')).toHaveStyle(
      {
        flexGrow: "35",
      },
    );

    expect(container.querySelector('[data-phase-id="finish"]')).toHaveStyle({
      flexGrow: "20",
    });
  });

  it("provides accessible descriptions for phase availability", () => {
    render(<AppointmentPhaseTimeline color="rose" phases={createPhases()} />);

    expect(
      screen.getByRole("img", {
        name: "Application, 15 min, professionnel occupé",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Pose, 35 min, temps de pose",
      }),
    ).toBeInTheDocument();
  });

  it("can hide labels for compact agenda events", () => {
    render(
      <AppointmentPhaseTimeline
        color="rose"
        phases={createPhases()}
        showLabels={false}
      />,
    );

    expect(screen.queryByText("Application")).not.toBeInTheDocument();

    expect(screen.queryByText("Pose")).not.toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: "Pose, 35 min, temps de pose",
      }),
    ).toBeInTheDocument();
  });

  it("ignores phases with invalid durations", () => {
    const phases: AppointmentPhase[] = [
      ...createPhases(),
      {
        id: "invalid",
        name: "Invalid",
        durationMinutes: 0,
        requiresStaff: true,
      },
    ];

    const { container } = render(
      <AppointmentPhaseTimeline color="rose" phases={phases} />,
    );

    expect(
      container.querySelector('[data-phase-id="invalid"]'),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when no valid phase exists", () => {
    const { container } = render(
      <AppointmentPhaseTimeline
        color="rose"
        phases={[
          {
            id: "invalid",
            name: "Invalid",
            durationMinutes: 0,
            requiresStaff: true,
          },
        ]}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
