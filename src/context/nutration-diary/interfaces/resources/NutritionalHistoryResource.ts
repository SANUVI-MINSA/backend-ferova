export interface NutritionalHistoryResource {
    patientId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };
    days: any[];
}