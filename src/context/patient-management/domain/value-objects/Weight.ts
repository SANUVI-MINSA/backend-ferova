export class Weight {
    constructor(
        private value: number
    ) {
        if (
            value <= 0
        ) {
            throw new Error(
                "Weight must be greater than zero."
            );
        }
    }

    getValue(): number {
        return this.value;
    }
}