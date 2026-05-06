export class Phone {

    private readonly value: string;

    constructor(value: string) {
        if (!value) {
            throw new Error("Phone is required");
        }

        const regex = /^\+51\s\d{9}$/;

        if (!regex.test(value)) {
            throw new Error(
                "Phone must follow format: +51 987654321"
            );
        }

        this.value = this.normalize(value);
    }

    private normalize(phone: string): string {
        return phone.replace(/\D/g, "");
    }

    public static fromPersistence(
        phone: string
    ): Phone {
        const instance =
            Object.create(Phone.prototype);

        instance.value = phone;

        return instance;
    }

    public getValue(): string {
        return this.value;
    }
}