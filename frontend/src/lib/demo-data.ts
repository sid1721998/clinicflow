export const DEMO_DASHBOARD = {
  totalPatients: 142,
  totalDoctors: 8,
  todayAppts: 14,
  monthAppts: 187,
  monthRevenue: 24850.0,
  totalRevenue: 312400.0,
  statusStats: {
    scheduled: 12,
    confirmed: 34,
    in_progress: 3,
    completed: 118,
    cancelled: 14,
    no_show: 6,
  },
  todayDetails: [
    { id: 1, patient: { first_name: "Marko", last_name: "Horvat" }, doctor: { first_name: "Ana", last_name: "Kovačević" }, scheduled_at: ts(8, 0), status: "completed" },
    { id: 2, patient: { first_name: "Ivana", last_name: "Babić" }, doctor: { first_name: "Ivan", last_name: "Perić" }, scheduled_at: ts(9, 30), status: "completed" },
    { id: 3, patient: { first_name: "Tomislav", last_name: "Jurić" }, doctor: { first_name: "Ana", last_name: "Kovačević" }, scheduled_at: ts(11, 0), status: "confirmed" },
    { id: 4, patient: { first_name: "Petra", last_name: "Novak" }, doctor: { first_name: "Maja", last_name: "Šimić" }, scheduled_at: ts(13, 0), status: "scheduled" },
    { id: 5, patient: { first_name: "Josip", last_name: "Blažević" }, doctor: { first_name: "Ivan", last_name: "Perić" }, scheduled_at: ts(15, 30), status: "scheduled" },
  ],
};

function ts(h: number, m: number, daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const DEMO_PATIENTS = {
  data: [
    { id: 1, first_name: "Marko", last_name: "Horvat", oib: "12345678901", date_of_birth: "1985-03-15", gender: "M", phone: "+385 91 234 5678", email: "marko.horvat@gmail.com", blood_type: "A+", is_active: true },
    { id: 2, first_name: "Ivana", last_name: "Babić", oib: "23456789012", date_of_birth: "1990-07-22", gender: "F", phone: "+385 98 345 6789", email: "ivana.babic@gmail.com", blood_type: "O+", is_active: true },
    { id: 3, first_name: "Tomislav", last_name: "Jurić", oib: "34567890123", date_of_birth: "1978-11-08", gender: "M", phone: "+385 95 456 7890", email: "tomislav.juric@gmail.com", blood_type: "B+", is_active: true },
    { id: 4, first_name: "Petra", last_name: "Novak", oib: "45678901234", date_of_birth: "1995-02-14", gender: "F", phone: "+385 92 567 8901", email: "petra.novak@gmail.com", blood_type: "AB-", is_active: true },
    { id: 5, first_name: "Josip", last_name: "Blažević", oib: "56789012345", date_of_birth: "1962-09-30", gender: "M", phone: "+385 99 678 9012", email: "josip.blazevic@gmail.com", blood_type: "A-", is_active: true },
    { id: 6, first_name: "Maja", last_name: "Knežević", oib: "67890123456", date_of_birth: "1988-05-19", gender: "F", phone: "+385 91 789 0123", email: "maja.knezevic@gmail.com", blood_type: "O-", is_active: true },
    { id: 7, first_name: "Ante", last_name: "Marković", oib: "78901234567", date_of_birth: "1972-12-03", gender: "M", phone: "+385 98 890 1234", email: "ante.markovic@gmail.com", blood_type: "B-", is_active: true },
    { id: 8, first_name: "Lucija", last_name: "Filipović", oib: "89012345678", date_of_birth: "1993-04-27", gender: "F", phone: "+385 95 901 2345", email: "lucija.filipovic@gmail.com", blood_type: "A+", is_active: true },
    { id: 9, first_name: "Nikola", last_name: "Vuković", oib: "90123456789", date_of_birth: "1981-08-11", gender: "M", phone: "+385 92 012 3456", email: "nikola.vukovic@gmail.com", blood_type: "O+", is_active: false },
    { id: 10, first_name: "Katarina", last_name: "Božić", oib: "01234567890", date_of_birth: "1999-01-05", gender: "F", phone: "+385 99 123 4567", email: "katarina.bozic@gmail.com", blood_type: "AB+", is_active: true },
    { id: 11, first_name: "Stjepan", last_name: "Ilić", oib: "11234567890", date_of_birth: "1955-06-18", gender: "M", phone: "+385 91 234 5670", email: "stjepan.ilic@gmail.com", blood_type: "A+", is_active: true },
    { id: 12, first_name: "Elena", last_name: "Mihalić", oib: "22345678901", date_of_birth: "2001-10-22", gender: "F", phone: "+385 98 345 6780", email: "elena.mihalic@gmail.com", blood_type: "B+", is_active: true },
  ],
  meta: { total: 142, current_page: 1, last_page: 12, per_page: 12 },
};

export const DEMO_APPOINTMENTS = {
  data: [
    { id: 1, patient: { first_name: "Marko", last_name: "Horvat" }, doctor: { first_name: "Ana", last_name: "Kovačević" }, scheduled_at: ts(8, 0), duration_minutes: 30, status: "completed", type: "Internistički pregled", price: 150 },
    { id: 2, patient: { first_name: "Ivana", last_name: "Babić" }, doctor: { first_name: "Ivan", last_name: "Perić" }, scheduled_at: ts(9, 30), duration_minutes: 45, status: "completed", type: "EKG", price: 80 },
    { id: 3, patient: { first_name: "Tomislav", last_name: "Jurić" }, doctor: { first_name: "Ana", last_name: "Kovačević" }, scheduled_at: ts(11, 0), duration_minutes: 30, status: "confirmed", type: "Kontrolni pregled", price: 100 },
    { id: 4, patient: { first_name: "Petra", last_name: "Novak" }, doctor: { first_name: "Maja", last_name: "Šimić" }, scheduled_at: ts(13, 0), duration_minutes: 60, status: "scheduled", type: "Ginekološki pregled", price: 200 },
    { id: 5, patient: { first_name: "Josip", last_name: "Blažević" }, doctor: { first_name: "Ivan", last_name: "Perić" }, scheduled_at: ts(15, 30), duration_minutes: 30, status: "scheduled", type: "Internistički pregled", price: 150 },
    { id: 6, patient: { first_name: "Maja", last_name: "Knežević" }, doctor: { first_name: "Luka", last_name: "Matić" }, scheduled_at: ts(10, 0, -1), duration_minutes: 30, status: "completed", type: "Dermatološki pregled", price: 180 },
    { id: 7, patient: { first_name: "Ante", last_name: "Marković" }, doctor: { first_name: "Ana", last_name: "Kovačević" }, scheduled_at: ts(14, 0, -1), duration_minutes: 45, status: "no_show", type: "Internistički pregled", price: 150 },
    { id: 8, patient: { first_name: "Lucija", last_name: "Filipović" }, doctor: { first_name: "Maja", last_name: "Šimić" }, scheduled_at: ts(9, 0, 1), duration_minutes: 30, status: "confirmed", type: "Ginekološki pregled", price: 200 },
    { id: 9, patient: { first_name: "Nikola", last_name: "Vuković" }, doctor: { first_name: "Ivan", last_name: "Perić" }, scheduled_at: ts(11, 30, 1), duration_minutes: 30, status: "scheduled", type: "EKG", price: 80 },
    { id: 10, patient: { first_name: "Katarina", last_name: "Božić" }, doctor: { first_name: "Luka", last_name: "Matić" }, scheduled_at: ts(16, 0, -1), duration_minutes: 60, status: "cancelled", type: "Dermatološki pregled", price: 180 },
  ],
};

export const DEMO_TODAY_APPOINTMENTS = DEMO_APPOINTMENTS.data.filter((a) => {
  const d = new Date(a.scheduled_at);
  return d.toDateString() === new Date().toDateString();
});

export const DEMO_INVOICES = {
  data: [
    { id: 1, patient: { first_name: "Marko", last_name: "Horvat" }, total_amount: 230, paid_amount: 230, status: "paid", invoice_date: ts(8, 30) },
    { id: 2, patient: { first_name: "Ivana", last_name: "Babić" }, total_amount: 80, paid_amount: 80, status: "paid", invoice_date: ts(10, 0) },
    { id: 3, patient: { first_name: "Maja", last_name: "Knežević" }, total_amount: 180, paid_amount: 0, status: "unpaid", invoice_date: ts(10, 30, -1) },
    { id: 4, patient: { first_name: "Ante", last_name: "Marković" }, total_amount: 150, paid_amount: 75, status: "partially_paid", invoice_date: ts(14, 30, -1) },
    { id: 5, patient: { first_name: "Lucija", last_name: "Filipović" }, total_amount: 200, paid_amount: 0, status: "unpaid", invoice_date: ts(11, 0, -1) },
    { id: 6, patient: { first_name: "Tomislav", last_name: "Jurić" }, total_amount: 310, paid_amount: 310, status: "paid", invoice_date: ts(15, 0, -1) },
    { id: 7, patient: { first_name: "Nikola", last_name: "Vuković" }, total_amount: 450, paid_amount: 450, status: "paid", invoice_date: ts(9, 0, -2) },
    { id: 8, patient: { first_name: "Stjepan", last_name: "Ilić" }, total_amount: 120, paid_amount: 0, status: "unpaid", invoice_date: ts(7, 0) },
  ],
};

export const DEMO_INVOICES_SUMMARY = {
  total_amount: 312400,
  paid_amount: 287550,
  unpaid_amount: 24850,
  total_count: 1240,
};

export const DEMO_REPORTS = {
  total_revenue: 24850,
  paid_revenue: 22300,
  invoice_count: 187,
  daily: Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const amount = 500 + Math.floor(Math.sin(i * 0.8) * 400 + 400);
    return { date: d.toISOString().split("T")[0], amount };
  }),
};

export const DEMO_USER = {
  id: 1,
  first_name: "Admin",
  last_name: "Demo",
  email: "admin@demo-klinika.hr",
  role: "admin",
  clinic: {
    name: "Demo Poliklinika Zagreb",
    address: "Ilica 10, Zagreb",
    phone: "+385 1 234 5678",
    email: "info@demo-klinika.hr",
    plan: "enterprise",
  },
};
