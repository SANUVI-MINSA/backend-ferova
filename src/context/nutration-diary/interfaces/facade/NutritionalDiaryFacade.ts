import {NutritionalDiaryCommandService} from "../../model/services/NutritionalDiaryCommandService";
import {NutritionalDiaryQueryService} from "../../model/services/NutritionalDiaryQueryService";
import {RegisterFoodEntryCommand} from "../../model/domain/commands/RegisterFoodEntryCommand";
import {GetTodayNutritionalDiaryQuery} from "../../model/domain/queries/GetTodayNutritionalDiaryQuery";
import {GetFoodItemsByCategoryQuery} from "../../model/domain/queries/GetFoodItemsByCategoryQuery";
import {SearchFoodItemsQuery} from "../../model/domain/queries/SearchFoodItemsQuery";
import {GetFoodItemDetailsQuery} from "../../model/domain/queries/GetFoodItemDetailsQuery";
import {GetNutritionalHistoryQuery} from "../../model/domain/queries/GetNutritionalHistoryQuery";

export class NutritionalDiaryFacade {

    constructor(
        private commandService:
        NutritionalDiaryCommandService,

        private queryService:
        NutritionalDiaryQueryService
    ) {}

    /**
     * Register food consumed by mother
     */
    async registerFoodEntry(
        command:
        RegisterFoodEntryCommand
    ): Promise<any> {

        return await this
            .commandService
            .registerFoodEntry(
                command
            );
    }

    /**
     * Get today's nutritional diary
     */
    async getTodayNutritionalDiary(
        query:
        GetTodayNutritionalDiaryQuery
    ): Promise<any> {

        return await this
            .queryService
            .getTodayNutritionalDiary(
                query
            );
    }

    /**
     * Get food items by category
     */
    async getFoodItemsByCategory(
        query:
        GetFoodItemsByCategoryQuery
    ): Promise<any> {

        return await this
            .queryService
            .getFoodItemsByCategory(
                query
            );
    }

    /**
     * Search food items
     */
    async searchFoodItems(
        query:
        SearchFoodItemsQuery
    ): Promise<any> {

        return await this
            .queryService
            .searchFoodItems(
                query
            );
    }

    /**
     * Get food item details
     */
    async getFoodItemDetails(
        query:
        GetFoodItemDetailsQuery
    ): Promise<any> {

        return await this
            .queryService
            .getFoodItemDetails(
                query
            );
    }

    /**
     * Get nutritional history
     */
    async getNutritionalHistory(
        query:
        GetNutritionalHistoryQuery
    ): Promise<any> {

        return await this
            .queryService
            .getNutritionalHistory(
                query
            );
    }
}