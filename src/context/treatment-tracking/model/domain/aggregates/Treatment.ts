import {TreatmentStatus} from "../value-objects/enum/TreatementStatus";
import {RiskScore} from "../entities/RiskScore";

export class Treatment {

    constructor(
        private id: string,
        private patientId: string,
        private nurseId: string,
        private supplement: string,
        private quantity: string,
        private dosingHours: string,
        private durationDays: number,
        private startDate: Date,
        private endDate: Date,
        private status: TreatmentStatus,
        private adherenceScore: number,
        private currentStreak: number,
        private totalConfirmed: number,
        private totalOmitted: number,
        private completionObservation: string | null,
        private abandonmentObservation: string | null,
        private riskScore: RiskScore
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Treatment id is required"
            );
        }

        if (!this.patientId) {
            throw new Error(
                "Patient id is required"
            );
        }

        if (!this.nurseId) {
            throw new Error(
                "Nurse id is required"
            );
        }

        if (!this.supplement) {
            throw new Error(
                "Supplement is required"
            );
        }

        if (!this.quantity) {
            throw new Error(
                "Quantity is required"
            );
        }

        if (!this.dosingHours) {
            throw new Error(
                "Dosing hours is required"
            );
        }

        if (this.durationDays <= 0) {
            throw new Error(
                "Duration days must be greater than zero"
            );
        }

        if (!this.startDate) {
            throw new Error(
                "Start date is required"
            );
        }

        if (!this.endDate) {
            throw new Error(
                "End date is required"
            );
        }

        if (!this.status) {
            throw new Error(
                "Treatment status is required"
            );
        }
    }

    completeTreatment(
        nurseId: string,
        observation?: string
    ): void {

        if (
            this.nurseId !== nurseId
        ) {
            throw new Error(
                "Only assigned nurse can complete treatment"
            );
        }

        if (
            this.status !==
            TreatmentStatus.ACTIVE
        ) {
            throw new Error(
                "Only active treatments can be completed"
            );
        }

        this.status =
            TreatmentStatus.COMPLETED;

        this.completionObservation =
            observation || null;
    }

    abandonTreatment(
        nurseId: string,
        observation?: string
    ): void {

        if (
            this.nurseId !== nurseId
        ) {
            throw new Error(
                "Only assigned nurse can abandon treatment"
            );
        }

        if (
            this.status !==
            TreatmentStatus.ACTIVE
        ) {
            throw new Error(
                "Only active treatments can be abandoned"
            );
        }

        this.status =
            TreatmentStatus.ABANDONED;

        this.abandonmentObservation =
            observation || null;
    }

    updateAdherenceMetrics(
        confirmed: boolean
    ): void {

        if (confirmed) {
            this.totalConfirmed++;
            this.currentStreak++;
        } else {
            this.totalOmitted++;
            this.currentStreak = 0;
        }

        const total =
            this.totalConfirmed +
            this.totalOmitted;

        if (total === 0) {
            this.adherenceScore = 100;
            return;
        }

        this.adherenceScore =
            (this.totalConfirmed / total) * 100;
    }

    updateRiskScore(
        riskScore: RiskScore
    ): void {
        this.riskScore =
            riskScore;
    }

    getId(): string {
        return this.id;
    }

    getPatientId(): string {
        return this.patientId;
    }

    getNurseId(): string {
        return this.nurseId;
    }

    getStatus(): TreatmentStatus {
        return this.status;
    }

    getRiskScore(): RiskScore {
        return this.riskScore;
    }

    toPrimitives() {
        return {
            id: this.id,
            patientId: this.patientId,
            nurseId: this.nurseId,
            supplement: this.supplement,
            quantity: this.quantity,
            dosingHours: this.dosingHours,
            durationDays: this.durationDays,
            startDate: this.startDate,
            endDate: this.endDate,
            status: this.status,
            adherenceScore: this.adherenceScore,
            currentStreak: this.currentStreak,
            totalConfirmed: this.totalConfirmed,
            totalOmitted: this.totalOmitted,
            completionObservation:
            this.completionObservation,
            abandonmentObservation:
            this.abandonmentObservation,
            riskScore:
                this.riskScore.toPrimitives()
        };
    }
}