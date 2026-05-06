export type BookAppointmentCommand = Readonly<{
    facilityId: string;
    patientId: string;
    motherId: string;
    appointmentDate: string;
    appointmentTime: string;
}>