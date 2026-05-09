export type GetOpenConsultationsByNurseQuery =
    Readonly<{
        nurseId: string;
        searchTerm?: string;
    }>;
/**
 * SearchTerm: para buscar un consulta abierta
 * en basea l nombre del paciente o la madre
 */