import {FoodItem} from "../domain/entities/FoodItem";

export interface FoodItemRepository {

    findById(
        foodItemId: string
    ): Promise<FoodItem | null>;

    findByCategory(
        category: string
    ): Promise<FoodItem[]>;

    searchByName(
        searchText: string
    ): Promise<FoodItem[]>;
}