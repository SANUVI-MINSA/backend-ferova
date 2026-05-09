export type CloseConsultationCommand =
    Readonly<{
        consultationId: string;
        nurseId: string;
    }>;