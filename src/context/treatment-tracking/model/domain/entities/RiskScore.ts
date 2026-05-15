import {RiskLevel} from "../value-objects/enum/RiskLevel";

export class RiskScore {

    constructor(
        private id: string,
        private score: number,
        private riskLevel: RiskLevel,
        private calculatedAt: Date
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Risk score id is required"
            );
        }

        if (
            this.score < 0 ||
            this.score > 100
        ) {
            throw new Error(
                "Risk score must be between 0 and 100"
            );
        }

        if (!this.riskLevel) {
            throw new Error(
                "Risk level is required"
            );
        }

        if (!this.calculatedAt) {
            throw new Error(
                "Calculated date is required"
            );
        }
    }

    updateScore(
        newScore: number
    ): void {

        if (
            newScore < 0 ||
            newScore > 100
        ) {
            throw new Error(
                "Invalid risk score"
            );
        }

        this.score =
            newScore;

        this.riskLevel =
            this.calculateRiskLevel(
                newScore
            );

        this.calculatedAt =
            new Date();
    }


    private calculateRiskLevel(
        score: number
    ): RiskLevel {

        if (score > 70) {
            return RiskLevel.HIGH;
        }

        if (
            score >= 30 &&
            score <= 70
        ) {
            return RiskLevel.MEDIUM;
        }

        return RiskLevel.LOW;
    }

    getScore(): number {
        return this.score;
    }

    getRiskLevel(): RiskLevel {
        return this.riskLevel;
    }

    getCalculatedAt(): Date {
        return this.calculatedAt;
    }

    toPrimitives() {
        return {
            id: this.id,
            score: this.score,
            riskLevel:
            this.riskLevel,
            calculatedAt:
            this.calculatedAt
        };
    }
}