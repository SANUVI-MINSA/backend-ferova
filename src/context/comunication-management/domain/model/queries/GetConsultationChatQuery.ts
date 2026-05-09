export type GetConsultationChatQuery =
    Readonly<{
        consultationId: string;
        requesterId: string;
    }>;

/**
 * Agregué requesterId por seguridad:
 *
 * validar que sea:
 *
 * madre de la consulta
 * o
 * enfermera de la consulta
 */