export class MotivoConsulta {

    constructor(
        private value: string
    ) {
        this.ensureValid();
    }

    private ensureValid(): void {

        if (
            !this.value ||
            this.value.trim().length < 5
        ) {
            throw new Error(
                "Consultation reason must contain at least 5 characters"
            );
        }
    }

    getValue(): string {
        return this.value.trim();
    }
}