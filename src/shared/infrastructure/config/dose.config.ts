export const DOSE_CONFIG = {
    // Propiedad estática (para compatibilidad)
    OMISSION_THRESHOLD_HOURS: (() => {
        const env = process.env.NODE_ENV || 'production';
        if (env === 'development' || env === 'test') {
            const devThreshold = process.env.DEV_OMISSION_MINUTES;
            if (devThreshold) {
                return Number(devThreshold) / 60;
            }
            return 24;
        }
        return 24;
    })(),

    // Método para obtener el umbral (recomendado)
    getOmissionThresholdHours(): number {
        const env = process.env.NODE_ENV || 'production';

        if (env === 'development' || env === 'test') {
            const devThreshold = process.env.DEV_OMISSION_MINUTES;
            if (devThreshold) {
                return Number(devThreshold) / 60;
            }
            return 24;
        }

        return 24;
    },

};