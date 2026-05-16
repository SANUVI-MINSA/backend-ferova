export type CompleteTreatmentCommand =
    Readonly<{
        treatmentId: string;
        nurseId: string;
        observation?: string;
    }>;