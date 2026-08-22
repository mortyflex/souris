import type { CreateAppointmentClient } from "../components/create-appointment-panel";

/*
 * Clientes du prototype.
 *
 * Les quatre premières correspondent aux rendez-vous de démonstration
 * de l'agenda (mêmes ids et mêmes couleurs que agenda-day-demo-data).
 */
export const agendaDemoClients: CreateAppointmentClient[] = [
  {
    id: "client-lynda",
    fullName: "Lynda Haddad",
    phone: "06 12 34 56 78",
    color: "rose",
  },
  {
    id: "client-sofia",
    fullName: "Sofia Benali",
    phone: "06 23 45 67 89",
    color: "lavender",
  },
  {
    id: "client-nora",
    fullName: "Nora Lemaire",
    phone: "06 34 56 78 91",
    color: "sky",
  },
  {
    id: "client-amel",
    fullName: "Amel Bouzid",
    phone: "06 45 67 89 12",
    color: "peach",
  },
  {
    id: "client-emma",
    fullName: "Emma Rousseau",
    phone: "06 56 78 91 23",
    color: "mint",
  },
  {
    id: "client-yasmine",
    fullName: "Yasmine Kaci",
    color: "sand",
  },
];
