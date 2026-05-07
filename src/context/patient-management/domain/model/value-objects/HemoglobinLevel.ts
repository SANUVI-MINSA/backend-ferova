// HemoglobinLevel.ts
export class HemoglobinLevel {
    constructor(private value: number | null) {
        if (value !== null) {
            this.ensureValid();
        }
    }

    private ensureValid(): void {
        if (this.value !== null && (this.value < 0 || this.value > 30)) {
            throw new Error("Hemoglobin level must be between 0 and 30");
        }
    }

    getValue(): number | null {
        return this.value;
    }
}