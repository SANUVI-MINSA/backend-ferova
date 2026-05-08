export type GetNutritionalHistoryQuery =
    Readonly<{
        patientId: string;
        startDate?: Date;
        endDate?: Date;
    }>;