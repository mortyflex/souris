import type { Appointment } from "@/domain/appointments/appointment.types";

import type { AgendaDayAppointment } from "../components/agenda-day-view";

export const agendaDemoDayStartAt = new Date(2026, 7, 17, 8, 0);

export const agendaDemoDayEndAt = new Date(2026, 7, 17, 18, 0);

const lyndaAppointment: Appointment = {
  id: "appointment-lynda",
  businessId: "business-demo",
  clientId: "client-lynda",
  staffMemberId: "staff-demo",
  startAt: new Date(2026, 7, 17, 9, 15),
  status: "CONFIRMED",
  items: [
    {
      id: "item-lynda-color",
      serviceId: "service-color",
      order: 0,
      serviceName: "Couleur",
      serviceType: "TECHNIQUE",
      price: 55,
      phases: [
        {
          id: "phase-lynda-application",
          name: "Application",
          durationMinutes: 15,
          requiresStaff: true,
        },
        {
          id: "phase-lynda-processing",
          name: "Pose",
          durationMinutes: 20,
          requiresStaff: false,
        },
      ],
    },
    {
      id: "item-lynda-gloss",
      serviceId: "service-gloss",
      order: 1,
      serviceName: "Gloss",
      serviceType: "SERVICE",
      price: 25,
      phases: [
        {
          id: "phase-lynda-gloss",
          name: "Gloss",
          durationMinutes: 15,
          requiresStaff: true,
        },
      ],
    },
  ],
};

const sofiaAppointment: Appointment = {
  id: "appointment-sofia",
  businessId: "business-demo",
  clientId: "client-sofia",
  staffMemberId: "staff-demo",
  startAt: new Date(2026, 7, 17, 9, 30),
  status: "CONFIRMED",
  items: [
    {
      id: "item-sofia-cut",
      serviceId: "service-cut",
      order: 0,
      serviceName: "Coupe",
      serviceType: "SERVICE",
      price: 35,
      phases: [
        {
          id: "phase-sofia-cut",
          name: "Coupe",
          durationMinutes: 20,
          requiresStaff: true,
        },
      ],
    },
  ],
};

const noraAppointment: Appointment = {
  id: "appointment-nora",
  businessId: "business-demo",
  clientId: "client-nora",
  staffMemberId: "staff-demo",
  startAt: new Date(2026, 7, 17, 10, 30),
  status: "CONFIRMED",
  items: [
    {
      id: "item-nora-brushing",
      serviceId: "service-brushing",
      order: 0,
      serviceName: "Brushing",
      serviceType: "SERVICE",
      price: 40,
      phases: [
        {
          id: "phase-nora-brushing",
          name: "Brushing",
          durationMinutes: 45,
          requiresStaff: true,
        },
      ],
    },
  ],
};

const amelAppointment: Appointment = {
  id: "appointment-amel",
  businessId: "business-demo",
  clientId: "client-amel",
  staffMemberId: "staff-demo",
  startAt: new Date(2026, 7, 17, 11, 0),
  status: "CONFIRMED",
  items: [
    {
      id: "item-amel-highlights",
      serviceId: "service-highlights",
      order: 0,
      serviceName: "Mèches",
      serviceType: "TECHNIQUE",
      price: 95,
      phases: [
        {
          id: "phase-amel-application",
          name: "Application",
          durationMinutes: 30,
          requiresStaff: true,
        },
        {
          id: "phase-amel-processing",
          name: "Pose",
          durationMinutes: 35,
          requiresStaff: false,
        },
      ],
    },
    {
      id: "item-amel-finish",
      serviceId: "service-finish",
      order: 1,
      serviceName: "Patine & finition",
      serviceType: "SERVICE",
      price: 30,
      phases: [
        {
          id: "phase-amel-finish",
          name: "Finition",
          durationMinutes: 25,
          requiresStaff: true,
        },
      ],
    },
  ],
};

export const agendaDemoAppointments: AgendaDayAppointment[] = [
  {
    appointment: lyndaAppointment,
    clientName: "Lynda",
    color: "rose",
  },
  {
    appointment: sofiaAppointment,
    clientName: "Sofia",
    color: "lavender",
  },
  {
    appointment: noraAppointment,
    clientName: "Nora",
    color: "sky",
  },
  {
    appointment: amelAppointment,
    clientName: "Amel",
    color: "peach",
  },
];
