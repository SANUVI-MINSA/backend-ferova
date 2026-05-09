export type StartConsultationCommand =
    Readonly<{
        motherId: string;
        patientId: string;
        firstMessageContent: string;
    }>;