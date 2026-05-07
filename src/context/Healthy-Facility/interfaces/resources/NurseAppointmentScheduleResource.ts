export type NurseAppointmentScheduleResource = {
    appointmentId: string;
    patientId: string; // Por ahora es un id patient, cuando construyamos el bounded context de paciente, lo cabiaremos a patientname
    appointmentDate: string;
    appointmentTime: string;
    status: string;
};