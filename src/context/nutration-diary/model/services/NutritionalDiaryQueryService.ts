import {GetTodayNutritionalDiaryQuery} from "../domain/queries/GetTodayNutritionalDiaryQuery";
import {GetFoodItemsByCategoryQuery} from "../domain/queries/GetFoodItemsByCategoryQuery";
import {SearchFoodItemsQuery} from "../domain/queries/SearchFoodItemsQuery";
import {GetFoodItemDetailsQuery} from "../domain/queries/GetFoodItemDetailsQuery";
import {GetNutritionalHistoryQuery} from "../domain/queries/GetNutritionalHistoryQuery";

export interface NutritionalDiaryQueryService {

    getTodayNutritionalDiary(
        query: GetTodayNutritionalDiaryQuery
    ): Promise<any>;

    getFoodItemsByCategory(
        query: GetFoodItemsByCategoryQuery
    ): Promise<any>;

    searchFoodItems(
        query: SearchFoodItemsQuery
    ): Promise<any>;

    getFoodItemDetails(
        query: GetFoodItemDetailsQuery
    ): Promise<any>;

    getNutritionalHistory(
        query: GetNutritionalHistoryQuery
    ): Promise<any>;
}