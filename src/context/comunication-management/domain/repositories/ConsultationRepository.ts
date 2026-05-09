import {Consultation} from "../model/aggregate/Consultation";

/**
 * Repositorio para el aggregate root Consultation.
 *
 * Contexto: Bounded Context "Communication"
 *
 * Notas importantes:
 * - Las consultas cerradas se ELIMINAN físicamente (no hay soft delete)
 * - Los mensajes van embebidos dentro de Consultation (no hay MessageRepository)
 * - Solo se manejan consultas ACTIVAS (OPEN), las cerradas no existen en la BD
 */
export interface ConsultationRepository {

    /**
     * Crea una nueva consulta en la base de datos.
     *
     * ¿Cuándo se usa?
     * - StartConsultationCommand: cuando la madre envía el primer mensaje
     *
     * @param consultation - Aggregate root Consultation completo (con su primer mensaje embebido)
     */
    save(
        consultation: Consultation
    ): Promise<void>;

    /**
     * Actualiza una consulta existente.
     *
     * ¿Cuándo se usa?
     * - AddMessageCommand: cuando se agrega un nuevo mensaje (madre o enfermera)
     *
     * @param consultation - Aggregate root Consultation con los nuevos mensajes agregados
     */
    update(
        consultation: Consultation
    ): Promise<void>;

    /**
     * Busca una consulta por su ID.
     *
     * ¿Cuándo se usa?
     * - GetConsultationChatQuery: para mostrar el chat completo
     * - AddMessageCommand: para verificar que la consulta existe y está activa
     * - GetMessagesAfterQuery: para sincronización offline con Room
     * - CloseConsultationCommand: para verificar que la consulta existe antes de eliminar
     *
     * @param consultationId - ID único de la consulta
     * @returns La consulta si existe, null si no
     */
    findById(
        consultationId: string
    ): Promise<Consultation | null>;

    /**
     * Obtiene todas las consultas activas de una madre.
     *
     * ¿Cuándo se usa?
     * - GetOpenConsultationsByMotherQuery: para mostrar "Mis Consultas" en Ferova Family
     *
     * Nota: Solo devuelve consultas que existen (todas están activas por definición)
     *
     * @param motherId - ID de la madre (usuario en Ferova Family)
     * @returns Lista de consultas activas de la madre (puede ser vacía)
     */
    findOpenByMotherId(
        motherId: string
    ): Promise<Consultation[]>;

    /**
     * Obtiene todas las consultas activas asignadas a una enfermera.
     *
     * ¿Cuándo se usa?
     * - GetOpenConsultationsByNurseQuery: para mostrar "Bandeja de Consultas" en Ferova Clinic
     *
     * Nota:
     * - Solo devuelve consultas que existen (todas están activas por definición)
     * - El filtro por searchTerm (nombre de madre o paciente) se puede hacer en aplicación o MongoDB
     *
     * @param nurseId - ID de la enfermera (usuario en Ferova Clinic)
     * @returns Lista de consultas activas asignadas a la enfermera (puede ser vacía)
     */
    findOpenByNurseId(
        nurseId: string
    ): Promise<Consultation[]>;

    /**
     * Busca si existe una consulta activa para un paciente específico.
     *
     * ¿Cuándo se usa?
     * - StartConsultationCommand (validación): evita que la madre cree DOS consultas activas para el MISMO paciente
     *
     * Flujo típico:
     * 1. Madre intenta iniciar consulta para paciente "Mateo"
     * 2. Se llama a findOpenByPatientId(patientId)
     * 3. Si existe consulta activa → redirigir al chat existente (NO crear nueva)
     * 4. Si no existe → crear nueva consulta con save()
     *
     * ¿Por qué es importante?
     * - Un paciente solo puede tener UNA consulta activa a la vez
     * - Evita duplicados y confusión para la enfermera
     *
     * @param patientId - ID del paciente (registrado en Patient Management)
     * @returns La consulta activa si existe, null si no
     */
    findOpenByPatientId(
        patientId: string
    ): Promise<Consultation | null>;

    /**
     * Elimina físicamente una consulta de la base de datos.
     *
     * ¿Cuándo se usa?
     * - CloseConsultationCommand: cuando la enfermera cierra una consulta
     *
     * Comportamiento:
     * - Eliminación TOTAL del documento en MongoDB
     * - NO hay soft delete (no se guarda historial)
     * - NO hay campo "status" (las consultas cerradas NO existen)
     *
     * Consecuencias:
     * - Después de eliminar, la consulta desaparece de:
     *   - GetOpenConsultationsByMother
     *   - GetOpenConsultationsByNurse
     *   - GetConsultationChat (devuelve 404)
     *
     * @param consultationId - ID de la consulta a eliminar
     */
    delete(
        consultationId: string
    ): Promise<void>;
}