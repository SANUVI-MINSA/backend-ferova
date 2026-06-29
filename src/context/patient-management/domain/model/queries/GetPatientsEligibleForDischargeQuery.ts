export type GetPatientsEligibleForDischargeQuery =
    Readonly<{
        nurseId: string;
        searchTerm?: string;
    }>;