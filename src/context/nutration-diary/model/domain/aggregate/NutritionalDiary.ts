export class NutritionalDiary {

    constructor(
        private id: string,
        private patientId: string,
        private motherId: string,
        private date: Date,
        private totalIronAbsorbed: number,
        private hasInhibitor: boolean
    ) {
        this.validate();
    }

    /**
     * Metodo para validar los parametros del constructor
     * @private
     */
    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Diary id is required"
            );
        }

        if (!this.patientId) {
            throw new Error(
                "Patient id is required"
            );
        }

        if (!this.motherId) {
            throw new Error(
                "Mother id is required"
            );
        }

        if (!this.date) {
            throw new Error(
                "Diary date is required"
            );
        }

        if (this.totalIronAbsorbed < 0) {
            throw new Error(
                "Total iron absorbed cannot be negative"
            );
        }
    }

    /**
     * Metodo para actualzar las metricas totalIronAbsorbed y hasInhibitor
     * @param totalIronAbsorbed
     * @param hasInhibitor
     */
    updateMetrics(
        totalIronAbsorbed: number,
        hasInhibitor: boolean
    ): void {

        if (totalIronAbsorbed < 0) {
            throw new Error(
                "Total iron absorbed cannot be negative"
            );
        }

        this.totalIronAbsorbed =
            totalIronAbsorbed;

        this.hasInhibitor =
            hasInhibitor;
    }

    /**
     * Metodo para marcar el hasInhibitor a true cuando se detecta un Inhibitor
     */
    markInhibitorDetected(): void {
        this.hasInhibitor = true;
    }

    /**
     * Metodo para reseter el totalIronAbsorbed y hasInhibitor
     */
    resetDailyIron(): void {
        this.totalIronAbsorbed = 0;
        this.hasInhibitor = false;
    }

    /**
     * Getter
     */
    getId(): string {
        return this.id;
    }

    /**
     * Getter
     */
    getPatientId(): string {
        return this.patientId;
    }

    /**
     * Getter
     */
    getMotherId(): string {
        return this.motherId;
    }

    /**
     * Getter
     */
    getDate(): Date {
        return this.date;
    }

    /**
     * Getter
     */
    getTotalIronAbsorbed(): number {
        return this.totalIronAbsorbed;
    }

    /**
     * Getter para saber si si tiene detectado un inhibitor
     */
    hasDetectedInhibitor(): boolean {
        return this.hasInhibitor;
    }

    /**
     * Metodo para retornar los atributos
     */
    toPrimitives() {
        return {
            id: this.id,
            patientId: this.patientId,
            motherId: this.motherId,
            date: this.date,
            totalIronAbsorbed:
            this.totalIronAbsorbed,
            hasInhibitor:
            this.hasInhibitor
        };
    }
}