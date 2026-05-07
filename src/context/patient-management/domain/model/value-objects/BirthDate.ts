export class BirthDate {

    constructor(
        private value: Date
    ) {
        this.ensureIsValid();
    }

    private ensureIsValid() {
        // retorna la fecha actual
        const today = new Date();

        if (this.value > today) {
            throw new Error(
                "Birth date cannot be in the future."
            );
        }
    }

    getValue(): Date {
        return this.value;
    }
}