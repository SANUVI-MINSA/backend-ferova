export class Password {

    constructor(
        private readonly value: string
    ) {
        this.validate(value);
    }

    private validate(password: string): void {
        const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!regex.test(password)) {
            throw new Error(
                "Password must contain uppercase, lowercase, number and symbol"
            );
        }
    }

    public getValue(): string {
        return this.value;
    }
}