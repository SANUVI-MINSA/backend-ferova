export type GetTodayNutritionalDiaryQuery =
    Readonly<{
        patientId: string;
        date?: string;  // ✅ Opcional: fecha en formato yyyy-MM-dd
    }>;