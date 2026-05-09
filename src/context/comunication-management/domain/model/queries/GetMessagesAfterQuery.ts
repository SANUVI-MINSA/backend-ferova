/**
 * Query para sincronización incremental de mensajes entre Room (SQLite) y MongoDB.
 *
 * ¿Por qué existe?
 * - Permite que la app móvil en Kotlin (con Room) solo descargue los mensajes NUEVOS,
 *   en lugar de descargar todos los mensajes de la consulta cada vez.
 *
 * ¿Cómo se usa en Kotlin + Room?
 * 1. Room guarda localmente todos los mensajes ya descargados.
 * 2. La app obtiene de Room el timestamp del último mensaje guardado.
 * 3. Llama a este query con afterTimestamp = ese valor.
 * 4. El backend devuelve SOLO mensajes posteriores a esa fecha.
 * 5. La app guarda esos mensajes nuevos en Room.
 *
 * Beneficio:
 * - Ahorro de datos móviles (solo se transfiere lo nuevo)
 * - Chat instantáneo (Room muestra datos locales mientras sincroniza)
 * - Sincronización offline-first
 *
 * @example
 * // En Kotlin (ViewModel)
 * val lastTimestamp = messageDao.getLastTimestamp(consultationId) ?: 0
 * val newMessages = api.getMessagesAfter(
 *   consultationId = consultationId,
 *   afterTimestamp = lastTimestamp,
 *   requesterId = currentUserId
 * )
 * messageDao.insertAll(newMessages)
 */
export type GetMessagesAfterQuery = Readonly<{
    /** ID de la consulta en la que se buscan mensajes */
    consultationId: string;

    /** ID del usuario que hace la petición (madre o enfermera) - se usa para validar permisos */
    requesterId: string;

    /**
     * Timestamp Unix en milisegundos.
     * Solo mensajes con sentAt > afterTimestamp serán devueltos.
     * Si se envía 0, devuelve todos los mensajes (primera sincronización).
     */
    afterTimestamp: number;

    /**
     * Opcional: máximo número de mensajes a devolver.
     * Útil para paginación si hay muchos mensajes nuevos.
     * Default sugerido: 100
     */
    limit?: number;
}>;