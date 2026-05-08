import { Request, Response } from "express";
import {NutritionalDiaryFacade} from "./facade/NutritionalDiaryFacade";
import {
    RegisterFoodEntryCommandFromResourceAssembler
} from "./assemblers/RegisterFoodEntryCommandFromResourceAssembler";
import {GetTodayNutritionalDiaryQueryAssembler} from "./assemblers/GetTodayNutritionalDiaryQueryAssembler";
import {GetFoodItemsByCategoryQueryAssembler} from "./assemblers/GetFoodItemsByCategoryQueryAssembler";
import {SearchFoodItemsQueryAssembler} from "./assemblers/SearchFoodItemsQueryAssembler";
import {GetFoodItemDetailsQueryAssembler} from "./assemblers/GetFoodItemDetailsQueryAssembler";
import {GetNutritionalHistoryQueryAssembler} from "./assemblers/GetNutritionalHistoryQueryAssembler";

export class NutritionalDiaryController {

    constructor(
        private facade:
        NutritionalDiaryFacade
    ) {
    }

    registerFoodEntry = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command =
                RegisterFoodEntryCommandFromResourceAssembler
                    .toCommand(
                        req.body
                    );

            const result =
                await this
                    .facade
                    .registerFoodEntry(
                        command
                    );

            res.status(201)
                .json(result);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getTodayDiary = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetTodayNutritionalDiaryQueryAssembler
                    .toQuery(
                        req.params.patientId as string
                    );

            const result =
                await this.facade
                    .getTodayNutritionalDiary(
                        query
                    );

            res.status(200)
                .json(result);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getFoodsByCategory = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetFoodItemsByCategoryQueryAssembler
                    .toQuery(
                        req.params.category as string
                    );

            const result =
                await this.facade
                    .getFoodItemsByCategory(
                        query
                    );

            res.status(200)
                .json(result);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    searchFoods = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                SearchFoodItemsQueryAssembler
                    .toQuery(
                        req.query.text as string
                    );

            const result =
                await this.facade
                    .searchFoodItems(
                        query
                    );

            res.status(200)
                .json(result);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getFoodDetails = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetFoodItemDetailsQueryAssembler
                    .toQuery(
                        req.params.foodItemId as string
                    );

            const result =
                await this.facade
                    .getFoodItemDetails(
                        query
                    );

            res.status(200)
                .json(result);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getNutritionalHistory = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetNutritionalHistoryQueryAssembler
                    .toQuery(
                        req.params.patientId as string
                    );

            const result =
                await this.facade
                    .getNutritionalHistory(
                        query
                    );

            res.status(200)
                .json(result);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };
}
