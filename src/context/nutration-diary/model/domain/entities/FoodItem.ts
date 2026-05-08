/**
 * Representa los alimentos del Cataglogo
 */

import {NutrientContent} from "../value-objects/NutrientContent";
import {FoodCategory} from "../enum/FoodCategory";

export class FoodItem {
    constructor(
        private id: string,
        private name: string,
        private nutrientContent: NutrientContent,
        private isInhibitor: boolean,
        private category: FoodCategory
    ) {
        this.validate()
    }

    /**
     * Valida los parametros introducidos al FoodItem
     * @private
     */
    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Food item id is required"
            );
        }

        if (!this.name) {
            throw new Error(
                "Food name is required"
            );
        }
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
    getName(): string {
        return this.name;
    }


    /**
     * Getter
     */
    getNutrientContent():
        NutrientContent {
        return this.nutrientContent;
    }

    /**
     * Getter
     */
    isFoodInhibitor(): boolean {
        return this.isInhibitor;
    }


    /**
     * Getter
     */
    getCategory():
        FoodCategory {
        return this.category;
    }

    /**
     * Retorna los valores
     */
    toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            nutrientContent: this.nutrientContent.toPrimitives(),
            isInhibitor:
            this.isInhibitor,
            category:
            this.category
        };
    }
}