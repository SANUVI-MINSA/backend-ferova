export class Dni {

    constructor(
        private readonly value: string
    ) {
        if (!value) {
            throw new Error("DNI is required");
        }

        const regex = /^\d{8}$/;

        if (!regex.test(value)) {
            throw new Error(
                "DNI must contain exactly 8 numeric digits"
            );
        }
    }

    public getValue(): string {
        return this.value;
    }
}