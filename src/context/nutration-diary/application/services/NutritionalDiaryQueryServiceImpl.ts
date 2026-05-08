import {NutritionalDiaryQueryService} from "../../model/services/NutritionalDiaryQueryService";
import {NutritionalDiaryRepository} from "../../model/repositories/NutritionalDiaryRepository";
import {FoodEntryRepository} from "../../model/repositories/FoodEntryRepository";
import {FoodItemRepository} from "../../model/repositories/FoodItemRepository";
import {GetFoodItemsByCategoryQuery} from "../../model/domain/queries/GetFoodItemsByCategoryQuery";
import {SearchFoodItemsQuery} from "../../model/domain/queries/SearchFoodItemsQuery";
import {GetFoodItemDetailsQuery} from "../../model/domain/queries/GetFoodItemDetailsQuery";
import {Error, Promise} from "mongoose";
import {GetNutritionalHistoryQuery} from "../../model/domain/queries/GetNutritionalHistoryQuery";
import {GetTodayNutritionalDiaryQuery} from "../../model/domain/queries/GetTodayNutritionalDiaryQuery";

export class NutritionalDiaryQueryServiceImpl
    implements NutritionalDiaryQueryService {

    constructor(
        private diaryRepository:
        NutritionalDiaryRepository,
        private foodEntryRepository:
        FoodEntryRepository,
        private foodItemRepository:
        FoodItemRepository
    ) {
    }

    async getFoodItemsByCategory(
        query: GetFoodItemsByCategoryQuery
    ): Promise<any> {

        const items =
            await this
                .foodItemRepository
                .findByCategory(
                    query.category
                );

        const sortedItems =
            items.sort(
                (a, b) =>
                    a.getName()
                        .localeCompare(
                            b.getName()
                        )
            );

        return {
            category:
            query.category,

            items:
                sortedItems.map(
                    item => {

                        const data =
                            item
                                .toPrimitives();

                        return {
                            foodItemId:
                            data.id,

                            name:
                            data.name,

                            ironType:
                            data
                                .nutrientContent
                                .ironType,

                            ironMgPer100g:
                            data
                                .nutrientContent
                                .ironMg,

                            isInhibitor:
                            data
                                .isInhibitor
                        };
                    }
                )
        };
    }

    async searchFoodItems(
        query: SearchFoodItemsQuery
    ): Promise<any> {

        if (
            query.searchText
                .trim()
                .length < 2
        ) {
            return {
                searchText:
                query.searchText,
                resultCount: 0,
                items: []
            };
        }

        const items =
            await this
                .foodItemRepository
                .searchByName(
                    query.searchText
                );

        return {
            searchText:
            query.searchText,

            resultCount:
            items.length,

            items:
                items.map(
                    item => {

                        const data =
                            item
                                .toPrimitives();

                        return {
                            foodItemId:
                            data.id,

                            name:
                            data.name,

                            ironType:
                            data
                                .nutrientContent
                                .ironType,

                            ironMgPer100g:
                            data
                                .nutrientContent
                                .ironMg,

                            isInhibitor:
                            data
                                .isInhibitor
                        };
                    }
                )
        };
    }

    async getFoodItemDetails(
        query: GetFoodItemDetailsQuery
    ): Promise<any> {

        const foodItem =
            await this
                .foodItemRepository
                .findById(
                    query.foodItemId
                );

        if (!foodItem) {
            throw new Error(
                "Food item not found"
            );
        }

        const data =
            foodItem.toPrimitives();

        let warningMessage =
            null;

        if (
            data.isInhibitor
        ) {
            warningMessage =
                `¡Advertencia! ${data.name} puede reducir la absorción del suplemento de hierro.`;
        }

        return {
            foodItemId:
            data.id,

            name:
            data.name,

            ironType:
            data
                .nutrientContent
                .ironType,

            ironMgPer100g:
            data
                .nutrientContent
                .ironMg,

            isInhibitor:
            data.isInhibitor,

            warningMessage,

            defaultUnit:
                this.determineUnit(
                    data.category,
                    data.name
                )
        };
    }

    private determineUnit(
        category: string,
        foodName: string
    ): string {

        const normalizedName =
            foodName.toLowerCase();

        if (
            category === "BEVERAGE"
        ) {
            return "mililitros";
        }

        if (
            category === "DAIRY" &&
            (
                normalizedName.includes(
                    "leche"
                ) ||
                normalizedName.includes(
                    "yogur"
                )
            )
        ) {
            return "mililitros";
        }

        return "gramos";
    }

    async getNutritionalHistory(
        query: GetNutritionalHistoryQuery
    ): Promise<any> {

        const endDate =
            query.endDate ||
            new Date();

        const startDate =
            query.startDate ||
            new Date(
                endDate.getTime() -
                (30 * 24 * 60 * 60 * 1000)
            );

        const diaries =
            await this
                .diaryRepository
                .findByPatientAndDateRange(
                    query.patientId,
                    startDate,
                    endDate
                );

        const sortedDiaries =
            diaries.sort(
                (a, b) =>
                    b.getDate().getTime() -
                    a.getDate().getTime()
            );

        const days =
            await Promise.all(
                sortedDiaries.map(
                    async (diary) => {

                        const diaryData =
                            diary
                                .toPrimitives();

                        const entries =
                            await this
                                .foodEntryRepository
                                .findByDiaryId(
                                    diaryData.id
                                );

                        let inhibitorCount = 0;

                        for (
                            const entry
                            of entries
                            ) {
                            const entryData =
                                entry
                                    .toPrimitives();

                            const foodItem =
                                await this
                                    .foodItemRepository
                                    .findById(
                                        entryData.foodItemId
                                    );

                            if (
                                foodItem
                                    ?.toPrimitives()
                                    .isInhibitor
                            ) {
                                inhibitorCount++;
                            }
                        }

                        return {
                            date:
                            diaryData.date,

                            displayDate:
                                diaryData.date
                                    .toLocaleDateString(
                                        "es-PE",
                                        {
                                            day: "numeric",
                                            month: "long"
                                        }
                                    ),

                            totalIronAbsorbed:
                                Number(
                                    diaryData
                                        .totalIronAbsorbed
                                        .toFixed(1)
                                ),

                            hasInhibitor:
                            diaryData
                                .hasInhibitor,

                            inhibitorCount,

                            totalFoodEntries:
                            entries.length
                        };
                    }
                )
            );

        return {
            patientId:
            query.patientId,

            period: {
                startDate,
                endDate
            },

            days
        };
    }

    async getTodayNutritionalDiary(query: GetTodayNutritionalDiaryQuery): Promise<any> {
        const diary =
            await this
                .diaryRepository
                .findTodayByPatientId(
                    query.patientId
                );

        if (!diary) {
            return {
                diaryId: null,
                date: new Date(),
                totalIronAbsorbed: 0,
                foodEntries: []
            };
        }

        const diaryData =
            diary.toPrimitives();

        const entries =
            await this
                .foodEntryRepository
                .findByDiaryId(
                    diaryData.id
                );

        const enrichedEntries =
            await Promise.all(
                entries.map(
                    async (entry) => {

                        const entryData =
                            entry
                                .toPrimitives();

                        const foodItem =
                            await this
                                .foodItemRepository
                                .findById(
                                    entryData.foodItemId
                                );

                        const foodData =
                            foodItem
                                ?.toPrimitives();

                        return {
                            entryId:
                            entryData.id,

                            foodName:
                            foodData?.name,

                            quantity:
                            entryData.quantity,

                            unit:
                            entryData.unit,

                            ironAbsorbed:
                            entryData
                                .ironContributed,

                            isInhibitor:
                            foodData
                                ?.isInhibitor
                        };
                    }
                )
            );

        return {
            diaryId:
            diaryData.id,

            date:
            diaryData.date,

            totalIronAbsorbed:
                Number(
                    diaryData
                        .totalIronAbsorbed
                        .toFixed(2)
                ),

            foodEntries:
            enrichedEntries
        };
    }


}