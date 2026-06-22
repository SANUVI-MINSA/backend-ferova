export type GetMyTopAppointmentsQuery = Readonly<{
    nurseId: string;
    limit?: number; // Opcional, por defecto 4
}>;