export class FoodEntry {
    constructor(
        private id: string,
        private diaryId: string,
        private foodItemId: string,
        private quantity: number,
        private unit: string,
        private ironContributed: number,
        private registeredAt: Date
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Food entry id is required"
            );
        }

        if (!this.diaryId) {
            throw new Error(
                "Diary id is required"
            );
        }

        if (!this.foodItemId) {
            throw new Error(
                "Food item id is required"
            );
        }

        if (this.quantity <= 0) {
            throw new Error(
                "Quantity must be greater than zero"
            );
        }

        if (!this.unit) {
            throw new Error(
                "Unit is required"
            );
        }

        if (this.ironContributed < 0) {
            throw new Error(
                "Iron contributed cannot be negative"
            );
        }

        if (!this.registeredAt) {
            throw new Error(
                "Registration date is required"
            );
        }
    }

    /**
     * Metodo para actualizar nuevo cantidad y nuevo hierro contribuido
     * @param newQuantity
     * @param newIronContributed
     */
    updateQuantity(
        newQuantity: number,
        newIronContributed: number
    ): void {

        if (newQuantity <= 0) {
            throw new Error(
                "Quantity must be greater than zero"
            );
        }

        this.quantity =
            newQuantity;

        this.ironContributed =
            newIronContributed;
    }

    /**
     * Getter
     */
    getId(): string {
        return this.id;
    }


    /**
     * Getter
     */
    getDiaryId(): string {
        return this.diaryId;
    }


    /**
     * Getter
     */
    getFoodItemId(): string {
        return this.foodItemId;
    }


    /**
     * Getter
     */
    getQuantity(): number {
        return this.quantity;
    }


    /**
     * Getter
     */
    getUnit(): string {
        return this.unit;
    }


    /**
     * Getter
     */
    getIronContributed(): number {
        return this.ironContributed;
    }


    /**
     * Getter
     */
    getRegisteredAt(): Date {
        return this.registeredAt;
    }

    /**
     * Metodo para retornar los atributos
     */
    toPrimitives() {
        return {
            id: this.id,
            diaryId: this.diaryId,
            foodItemId: this.foodItemId,
            quantity: this.quantity,
            unit: this.unit,
            ironContributed:
            this.ironContributed,
            registeredAt:
            this.registeredAt
        };
    }

}