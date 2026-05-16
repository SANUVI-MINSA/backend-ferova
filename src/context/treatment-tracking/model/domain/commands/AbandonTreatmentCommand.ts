export type AbandonTreatmentCommand =
    Readonly<{
        treatmentId: string;
        nurseId: string;
        observation?: string;
    }>;