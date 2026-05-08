import {FoodItemRepository} from "../../../../model/repositories/FoodItemRepository";
import {FoodItem} from "../../../../model/domain/entities/FoodItem";
import {Promise} from "mongoose";
import {FoodItemModel} from "../models/FoodItemSchema";
import {FoodItemMapper} from "../../../mappers/FoodItemMapper";

export class MongoFoodItemRepository
    implements FoodItemRepository {

    async findById(
        foodItemId: string
    ): Promise<FoodItem | null> {

        const food =
            await FoodItemModel
                .findOne({
                    id: foodItemId
                });

        if (!food) {
            return null;
        }

        return FoodItemMapper
            .toDomain(food);
    }

    async findByCategory(
        category: string
    ): Promise<FoodItem[]> {

        const foods =
            await FoodItemModel
                .find({
                    category
                });

        return foods.map(
            food =>
                FoodItemMapper
                    .toDomain(food)
        );
    }

    async searchByName(
        searchText: string
    ): Promise<FoodItem[]> {

        const foods =
            await FoodItemModel
                .find({
                    name: {
                        $regex:
                        searchText,
                        $options: "i"
                    }
                });

        return foods.map(
            food =>
                FoodItemMapper
                    .toDomain(food)
        );
    }
}