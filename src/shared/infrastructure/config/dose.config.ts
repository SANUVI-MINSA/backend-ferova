export const DOSE_CONFIG = {
    /**
     * Propiedad estática (para compatibilidad con código existente)
     * Este valor se calcula UNA SOLA VEZ al iniciar la aplicación
     */
    OMISSION_THRESHOLD_HOURS: (() => {
        // Obtener el entorno actual (development, test, production)
        const env = process.env.NODE_ENV || 'production';

        // ==============================================
        // ENTORNO DE DESARROLLO O PRUEBAS
        // ==============================================
        if (env === 'development' || env === 'test') {
            // Intentar leer la variable de entorno (viene en MINUTOS)
            const devThreshold = process.env.DEV_OMISSION_MINUTES;

            // ¿El usuario definió un valor personalizado?
            if (devThreshold) {
                // SÍ: Convertir minutos a horas (ej: 1 minuto ÷ 60 = 0.01667 horas)
                // Ejemplo: DEV_OMISSION_MINUTES=1  → 1/60 = 0.01667 horas (1 minuto)
                //          DEV_OMISSION_MINUTES=5  → 5/60 = 0.08333 horas (5 minutos)
                return Number(devThreshold) / 60;
            }

            // NO: Usar 1 minuto por defecto (1/60 = 0.01667 horas)
            // Esto permite probar rápido sin configurar nada
            return 1 / 60; // 1 minuto en desarrollo
        }

        // ==============================================
        // ENTORNO DE PRODUCCIÓN (servidor real)
        // ==============================================
        // Usar 24 horas para que los pacientes tengan tiempo real
        // de confirmar sus dosis antes de ser omitidas
        return 24; // 24 horas en producción
    })(),

    /**
     * Método dinámico para obtener el umbral (RECOMENDADO)
     * Este método se ejecuta CADA VEZ que se necesita el valor
     * Permite cambios en tiempo real si se modifica la variable de entorno
     */
    getOmissionThresholdHours(): number {
        // Obtener el entorno actual
        const env = process.env.NODE_ENV || 'production';

        // ==============================================
        // LÓGICA PARA DESARROLLO
        // ==============================================
        if (env === 'development' || env === 'test') {
            // Leer variable de entorno (en MINUTOS)
            const devThreshold = process.env.DEV_OMISSION_MINUTES;

            // Si el usuario configuró un valor personalizado
            if (devThreshold) {
                // Convertir minutos → horas (porque el sistema trabaja en horas)
                // Ejemplo: DEV_OMISSION_MINUTES=1440 → 1440/60 = 24 horas
                return Number(devThreshold) / 60;
            }

            // Si NO hay variable, usar 1 minuto por defecto
            // Esto permite pruebas rápidas sin configuración adicional
            return 1 / 60; // 1 minuto en desarrollo
        }

        // ==============================================
        // LÓGICA PARA PRODUCCIÓN
        // ==============================================
        // En producción usamos tiempo REAL
        // El paciente tiene 24 horas para confirmar su dosis
        // Si no confirma en 24 horas, el sistema la omite automáticamente
        return 24; // 24 horas en producción
    },
};


/**
 * // ¿Cómo funciona? - Diagrama de flujo
 *
 * /*
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    ¿En qué entorno estamos?                  │
 * └─────────────────────────────────────────────────────────────┘
 *                               │
 *               ┌───────────────┴───────────────┐
 *               │                               │
 *               ▼                               ▼
 *      ┌────────────────┐              ┌────────────────┐
 *      │  DEVELOPMENT   │              │  PRODUCTION    │
 *      │  o TEST        │              │                │
 *      └────────────────┘              └────────────────┘
 *               │                               │
 *               ▼                               ▼
 *      ¿Variable DEV_                     Siempre usa
 *      OMISSION_MINUTES?                   24 HORAS
 *               │                         (tiempo real)
 *       ┌───────┴───────┐
 *       │               │
 *       ▼               ▼
 *     ✅ SÍ           ❌ NO
 *       │               │
 *       ▼               ▼
 *   Usa el valor     Usa 1 MINUTO
 *   que puso el      por defecto
 *   programador      (pruebas rápidas)
 *   (ej: 5 minutos)
 *
 *  */
