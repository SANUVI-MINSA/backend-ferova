import {DoseStatus} from "../value-objects/enum/DoseStatus";

export class DailyDose {

    constructor(
        private id: string,
        private treatmentId: string,
        private scheduledDate: Date,
        private confirmedAt: Date | null,
        private status: DoseStatus
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Daily dose id is required"
            );
        }

        if (!this.treatmentId) {
            throw new Error(
                "Treatment id is required"
            );
        }

        if (!this.scheduledDate) {
            throw new Error(
                "Scheduled date is required"
            );
        }

        if (!this.status) {
            throw new Error(
                "Dose status is required"
            );
        }
    }

    confirm(): void {

        if (
            this.status ===
            DoseStatus.CONFIRMED
        ) {
            throw new Error(
                "Dose already confirmed"
            );
        }

        if (
            this.status ===
            DoseStatus.OMITTED
        ) {
            throw new Error(
                "Cannot confirm an omitted dose"
            );
        }

        this.status =
            DoseStatus.CONFIRMED;

        this.confirmedAt =
            new Date();
    }

    markAsOmitted(): void {

        if (
            this.status ===
            DoseStatus.CONFIRMED
        ) {
            throw new Error(
                "Confirmed dose cannot be omitted"
            );
        }

        if (
            this.status ===
            DoseStatus.OMITTED
        ) {
            return;
        }

        this.status =
            DoseStatus.OMITTED;
    }

    calculateHoursWithoutConfirmation(): number {
        if (this.status === DoseStatus.CONFIRMED) {
            return 0;
        }

        const now = new Date();
        const differenceMs = now.getTime() - this.scheduledDate.getTime();
        const hours = Math.floor(differenceMs / (1000 * 60 * 60));

        console.log(`[calculateHoursWithoutConfirmation] Dosis ${this.id}`);
        console.log(`  - scheduledDate: ${this.scheduledDate.toISOString()}`);
        console.log(`  - now: ${now.toISOString()}`);
        console.log(`  - differenceMs: ${differenceMs}`);
        console.log(`  - hours: ${hours}`);

        return hours;
    }

    getId(): string {
        return this.id;
    }

    getTreatmentId(): string {
        return this.treatmentId;
    }

    getStatus(): DoseStatus {
        return this.status;
    }

    getScheduledDate(): Date {
        return this.scheduledDate;
    }


    toPrimitives() {
        return {
            id: this.id,
            treatmentId:
            this.treatmentId,
            scheduledDate:
            this.scheduledDate,
            confirmedAt:
            this.confirmedAt,
            status:
            this.status
        };
    }
}
