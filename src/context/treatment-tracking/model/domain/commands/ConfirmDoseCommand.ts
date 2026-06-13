export type ConfirmDoseCommand =
    Readonly<{
        treatmentId: string;
        patientId: string;
        motherId: string;
        dailyDoseId: string;
    }>;