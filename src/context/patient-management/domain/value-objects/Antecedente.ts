export class Antecedente {

    constructor(
        private type: string,
        private description: string
    ) {
        this.ensureValid();
    }

    private ensureValid(): void {

        if (
            !this.type ||
            this.type.trim() === ""
        ) {
            throw new Error(
                "Antecedent type is required"
            );
        }

        if (
            !this.description ||
            this.description.trim() === ""
        ) {
            throw new Error(
                "Antecedent description is required"
            );
        }
    }

    getType(): string {
        return this.type;
    }

    getDescription(): string {
        return this.description;
    }

    toPrimitives() {
        return {
            type: this.type,
            description:
            this.description
        };
    }
}