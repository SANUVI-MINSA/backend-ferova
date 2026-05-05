import bcrypt from "bcrypt";

export class Password {

    private readonly value: string;

    constructor(
        password: string,
        isHashed: boolean = false
    ) {
        if (!password) {
            throw new Error("Password is required");
        }

        if (isHashed) {
            this.value = password;
        } else {
            this.validate(password);
            this.value = this.hash(password);
        }
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

    private hash(password: string): string {
        return bcrypt.hashSync(password, 10);
    }

    public matches(
        plainPassword: string
    ): boolean {
        return bcrypt.compareSync(
            plainPassword,
            this.value
        );
    }

    public getValue(): string {
        return this.value;
    }
}