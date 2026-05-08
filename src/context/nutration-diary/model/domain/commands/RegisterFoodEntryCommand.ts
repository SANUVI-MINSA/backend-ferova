export type RegisterFoodEntryCommand =
    Readonly<{
        patientId: string;
        motherId: string;
        foodItemId: string;
        quantity: number;
    }>;