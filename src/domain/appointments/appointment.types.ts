export type ServiceType = "SERVICE" | "TECHNIQUE";

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type ServicePhase = {
  id: string;
  name: string;
  durationMinutes: number;
  requiresStaff: boolean;
};

export type Service = {
  id: string;
  businessId: string;
  name: string;
  type: ServiceType;
  price: number;
  phases: ServicePhase[];
  active: boolean;
};

export type AppointmentPhase = {
  id: string;
  name: string;
  durationMinutes: number;
  requiresStaff: boolean;
};

export type AppointmentItem = {
  id: string;
  serviceId: string;
  serviceOptionId?: string;
  order: number;
  serviceName: string;
  serviceType: ServiceType;
  price: number;
  phases: AppointmentPhase[];
};

export type Appointment = {
  id: string;
  businessId: string;
  clientId: string;
  staffMemberId: string;
  startAt: Date;
  status: AppointmentStatus;
  items: AppointmentItem[];
  notes?: string;
};

export type TimelinePhase = {
  appointmentId: string;
  appointmentItemId: string;
  phaseId: string;
  label: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  requiresStaff: boolean;
};
