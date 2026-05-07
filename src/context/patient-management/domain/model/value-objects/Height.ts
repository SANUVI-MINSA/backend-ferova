export class Height {
    constructor(
        private value: number
    ) {
        if (value <= 0) {
            throw new Error(
                "Height must be greater than zero."
            );
        }
    }

    getValue(): number {
        return this.value;
    }
}