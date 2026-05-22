export interface StartTreatmentResource {
    patientId: string;
    nurseId: string;
    supplementName: string;
    quantity: string;
    dosingHours: string;
    durationDays: number;
}