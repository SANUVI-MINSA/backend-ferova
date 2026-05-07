export class Observaciones {

    constructor(
        private value: string
    ) {
        this.ensureValid();
    }

    private ensureValid(): void {

        if (
            this.value !== undefined &&
            this.value.trim() === ""
        ) {
            throw new Error(
                "Observations cannot be empty"
            );
        }
    }

    isEmpty(): boolean {
        return !this.value;
    }

    getValue(): string | undefined {
        return this.value;
    }
}