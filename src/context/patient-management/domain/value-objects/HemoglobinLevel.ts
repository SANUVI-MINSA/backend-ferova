export class HemoglobinLevel {

    constructor(
        private value: number
    ) {
        this.ensureValidRange();
    }

    private ensureValidRange(): void {

        if (this.value <= 0) {
            throw new Error(
                "Hemoglobin level must be greater than zero"
            );
        }

        if (
            this.value < 5 ||
            this.value > 20
        ) {
            throw new Error(
                "Hemoglobin level is outside clinical range"
            );
        }
    }

    getValue(): number {
        return this.value;
    }
}