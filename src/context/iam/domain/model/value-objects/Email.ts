export class Email {

    private readonly value: string;

    constructor(value: string) {
        if (!value) {
            throw new Error("Email is required");
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(value)) {
            throw new Error("Invalid email format");
        }

        this.value = value.toLowerCase();
    }

    public getValue(): string {
        return this.value;
    }
}