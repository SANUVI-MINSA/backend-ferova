import {AnemiaStatus} from "../enum/AnemiStatus";
import {HemoglobinLevel} from "../value-objects/HemoglobinLevel";

export class Control {

    private anemiaStatus: AnemiaStatus;

    constructor(
        private id: string,
        private date: Date,
        private hemoglobinLevel:
        HemoglobinLevel
    ) {
        this.ensureDateIsValid();
        this.anemiaStatus = this.calculateAnemiaStatus();
    }

    private ensureDateIsValid(): void {
        const today = new Date();
        if (this.date > today) {
            throw new Error("Control date cannot be in the future");
        }
    }

    private calculateAnemiaStatus(): AnemiaStatus {
        const value = this.hemoglobinLevel.getValue();

        // ✅ Solución: Verificar si value es null
        if (value === null) {
            return AnemiaStatus.CONTROLLED; // o el valor por defecto que prefieras
        }

        if (value < 7) {
            return AnemiaStatus.SEVERE;
        }

        if (value >= 7 && value < 9) {
            return AnemiaStatus.MODERATE;
        }

        if (value >= 9 && value < 11) {
            return AnemiaStatus.MILD;
        }

        return AnemiaStatus.CONTROLLED;
    }

    getHemoglobinLevel(): HemoglobinLevel {
        return this.hemoglobinLevel;
    }

    toPrimitives() {
        return {
            id: this.id,
            date: this.date,
            hemoglobinLevel: this.hemoglobinLevel.getValue(),
            anemiaStatus: this.anemiaStatus
        };
    }
}