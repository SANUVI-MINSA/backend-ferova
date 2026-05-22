export type ConfirmDoseCommand =
    Readonly<{
        patientId: string
        motherId: string;
    }>;