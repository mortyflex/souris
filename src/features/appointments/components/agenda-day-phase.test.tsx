// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TimelinePhase } from "@/domain/appointments/appointment.types";

import { AgendaDayPhase } from "./agenda-day-phase";

function createActivePhase(): TimelinePhase {
  return {
    appointmentId: "appointment-1",
    appointmentItemId: "item-1",
    phaseId: "application",
    label: "Application",
    startAt: new Date(2026, 7, 17, 9, 15),
    endAt: new Date(2026, 7, 17, 9, 30),
    durationMinutes: 15,
    requiresStaff: true,
  };
}

function createProcessingPhase(): TimelinePhase {
  return {
    appointmentId: "appointment-1",
    appointmentItemId: "item-1",
    phaseId: "processing",
    label: "Pose",
    startAt: new Date(2026, 7, 17, 9, 30),
    endAt: new Date(2026, 7, 17, 9, 50),
    durationMinutes: 20,
    requiresStaff: false,
  };
}

describe("AgendaDayPhase", () => {
  it("shows the client and service for an active phase", () => {
    render(
      <AgendaDayPhase
        clientName="Lynda"
        color="rose"
        isFirstPhase
        isLastPhase={false}
        isResume={false}
        phase={createActivePhase()}
        serviceName="Couleur"
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Lynda",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Couleur")).toBeInTheDocument();
  });

  it("does not expose implementation phase names when the service already explains the appointment", () => {
    render(
      <AgendaDayPhase
        clientName="Lynda"
        color="rose"
        isFirstPhase
        isLastPhase={false}
        isResume={false}
        phase={createActivePhase()}
        serviceName="Couleur"
      />,
    );

    expect(screen.queryByText("Application")).not.toBeInTheDocument();
  });

  it("clearly identifies a resumed service", () => {
    const phase = createActivePhase();

    phase.phaseId = "gloss";
    phase.label = "Gloss";
    phase.startAt = new Date(2026, 7, 17, 9, 50);
    phase.endAt = new Date(2026, 7, 17, 10, 5);

    render(
      <AgendaDayPhase
        clientName="Lynda"
        color="rose"
        isFirstPhase={false}
        isLastPhase
        isResume
        phase={phase}
        serviceName="Gloss"
      />,
    );

    expect(screen.getByText("Reprise · Gloss")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Lynda",
      }),
    ).toBeInTheDocument();
  });

  it("can represent processing as secondary information outside the day grid", () => {
    const { container } = render(
      <AgendaDayPhase
        clientName="Lynda"
        color="rose"
        isFirstPhase={false}
        isLastPhase={false}
        isResume={false}
        phase={createProcessingPhase()}
        serviceName="Couleur"
      />,
    );

    expect(screen.getByText("Lynda · Pose")).toBeInTheDocument();

    expect(screen.getByText("Reprise 09:50")).toBeInTheDocument();

    expect(
      container.querySelector('[data-phase-kind="processing"]'),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", {
        name: "Lynda",
      }),
    ).not.toBeInTheDocument();
  });

  it("exposes whether an active phase is a resume", () => {
    const phase = createActivePhase();

    phase.phaseId = "finish";

    const { container } = render(
      <AgendaDayPhase
        clientName="Amel"
        color="peach"
        isFirstPhase={false}
        isLastPhase
        isResume
        phase={phase}
        serviceName="Patine & finition"
      />,
    );

    expect(container.querySelector('[data-phase-id="finish"]')).toHaveAttribute(
      "data-resume",
      "true",
    );
  });
});
