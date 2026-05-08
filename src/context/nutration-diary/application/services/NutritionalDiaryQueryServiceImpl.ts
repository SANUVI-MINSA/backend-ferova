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
import {FoodEntry} from "../../model/domain/entities/FoodEntry";

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

    // NutritionalDiaryQueryServiceImpl.ts
    async getNutritionalHistory(
        query: GetNutritionalHistoryQuery
    ): Promise<any> {
        const endDate = query.endDate || new Date();
        const startDate = query.startDate || new Date(
            endDate.getTime() - (30 * 24 * 60 * 60 * 1000)
        );

        const diaries = await this.diaryRepository.findByPatientAndDateRange(
            query.patientId,
            startDate,
            endDate
        );

        const sortedDiaries = diaries.sort(
            (a, b) => b.getDate().getTime() - a.getDate().getTime()
        );

        const days: any[] = [];

        for (const diary of sortedDiaries) {
            const diaryData = diary.toPrimitives();

            // 🔹 DECLARAR CON TIPO EXPLÍCITO
            let entries: FoodEntry[] = [];

            try {
                entries = await this.foodEntryRepository.findByDiaryId(diaryData.id);
            } catch (error) {
                console.error("Error obteniendo entries:", error);
                entries = [];
            }

            let inhibitorCount = 0;

            // Procesar cada entry de manera segura
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                try {
                    if (entry && typeof entry.getFoodItemId === 'function') {
                        const foodItemId = entry.getFoodItemId();
                        const foodItem = await this.foodItemRepository.findById(foodItemId);

                        if (foodItem && foodItem.toPrimitives().isInhibitor) {
                            inhibitorCount++;
                        }
                    }
                } catch (error) {
                    console.error(`Error procesando entry ${i}:`, error);
                }
            }

            days.push({
                date: diaryData.date,
                displayDate: diaryData.date.toLocaleDateString("es-PE", {
                    day: "numeric",
                    month: "long"
                }),
                totalIronAbsorbed: Number(diaryData.totalIronAbsorbed.toFixed(1)),
                hasInhibitor: diaryData.hasInhibitor,
                inhibitorCount,
                totalFoodEntries: entries.length
            });
        }

        return {
            patientId: query.patientId,
            period: { startDate, endDate },
            days
        };
    }

    async getTodayNutritionalDiary(query: GetTodayNutritionalDiaryQuery): Promise<any> {
        const diary = await this.diaryRepository.findTodayByPatientId(query.patientId);

        if (!diary) {
            return {
                diaryId: null,
                date: new Date(),
                totalIronAbsorbed: 0,
                foodEntries: []
            };
        }

        const diaryData =
            diary.
            toPrimitives();

        const entries =
            await this
                .foodEntryRepository
                .findByDiaryId(
                    diaryData.id
                );

        if (!entries || entries.length === 0) {
            return {
                diaryId: diaryData.id,
                date: diaryData.date,
                totalIronAbsorbed: Number(diaryData.totalIronAbsorbed.toFixed(2)),
                foodEntries: []
            };
        }

        const enrichedEntries = [];

        for (const entry of entries) {
            try {

                const foodItem = await this.foodItemRepository.findById(entry.getFoodItemId());
                const foodData = foodItem?.toPrimitives();

                enrichedEntries.push({
                    entryId: entry.getId(),
                    foodName: foodData?.name || "Desconocido",
                    quantity: entry.getQuantity(),
                    unit: entry.getUnit(),
                    ironAbsorbed: entry.getIronContributed(),
                    isInhibitor: foodData?.isInhibitor || false
                });

            } catch (error) {
                enrichedEntries.push({
                    entryId: "error",
                    foodName: "Error al procesar",
                    quantity: 0,
                    unit: "",
                    ironAbsorbed: 0,
                    isInhibitor: false
                });
            }
        }

        return {
            diaryId: diaryData.id,
            date: diaryData.date,
            totalIronAbsorbed: Number(diaryData.totalIronAbsorbed.toFixed(2)),
            foodEntries: enrichedEntries
        };
    }

}