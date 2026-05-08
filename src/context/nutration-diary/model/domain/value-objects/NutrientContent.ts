export class NutrientContent {

    constructor(
        private ironMg: number,
        private ironType: string
    ) {
        this.validate();
    }

    /**
     * Validar entrada de parametros a dicha clase
     * @private
     */
    private validate(): void {

        if (this.ironMg < 0) {
            throw new Error(
                "Iron mg cannot be negative"
            );
        }

        const validTypes = [
            "hemo",
            "no-hemo"
        ];

        if (
            !validTypes.includes(
                this.ironType
            )
        ) {
            throw new Error(
                "Invalid iron type"
            );
        }
    }

    /**
     * Getter
     */
    getIronMg(): number {
        return this.ironMg;
    }


    /**
     * Getter
     */
    getIronType(): string {
        return this.ironType;
    }

    /**
     * Retorna los valores de dicha clase
     */
    toPrimitives() {
        return {
            ironMg: this.ironMg,
            ironType: this.ironType
        };
    }
}