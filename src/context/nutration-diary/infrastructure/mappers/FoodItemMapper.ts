import {FoodItem} from "../../model/domain/entities/FoodItem";
import {NutrientContent} from "../../model/domain/value-objects/NutrientContent";

export class FoodItemMapper {

    static toDomain(
        document: any
    ): FoodItem {

        return new FoodItem(
            document.id,
            document.name,
            new NutrientContent(
                document.nutrientContent.ironMg,
                document.nutrientContent.ironType
            ),
            document.isInhibitor,
            document.category
        );
    }

    static toPersistence(
        foodItem: FoodItem
    ) {
        return foodItem.toPrimitives();
    }
}