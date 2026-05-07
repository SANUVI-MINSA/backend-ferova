export type DischargePatientCommand =
    Readonly<{
        patientId: string;
        nurseId: string;
    }>;