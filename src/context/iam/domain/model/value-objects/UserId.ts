export class UserId {

    constructor(
        private readonly value: string
    ) {
        if (!value || value.trim().length === 0) {
            throw new Error("User id is required");
        }
    }

    public getValue(): string {
        return this.value;
    }
}