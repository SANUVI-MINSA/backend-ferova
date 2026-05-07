export type RegisterHemoglobinControlCommand =
    Readonly<{
        patientId: string;
        hemoglobinLevel: number;
    }>;