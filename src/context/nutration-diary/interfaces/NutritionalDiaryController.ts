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
import {AuthRequest} from "../../../middlewares/auth.middleware";

export class NutritionalDiaryController {

    constructor(
        private facade:
        NutritionalDiaryFacade
    ) {
    }

    registerFoodEntry = async (req: AuthRequest, res: Response) => {
        try {
            const motherIdFromToken = req.user?.motherId;

            if (!motherIdFromToken) {
                return res.status(400).json({
                    error: "Mother ID no encontrado en el token"
                });
            }

            // Tomar los datos del body sin motherId
            const { patientId, foodItemId, quantity } = req.body;

            // Validar que todos los campos necesarios estén presentes
            if (!patientId || !foodItemId || !quantity) {
                return res.status(400).json({
                    error: "Faltan campos requeridos: patientId, foodItemId, quantity"
                });
            }

            // Construir el command con el motherId del token
            const command = {
                patientId,
                motherId: motherIdFromToken,
                foodItemId,
                quantity
            };

            const result = await this.facade.registerFoodEntry(command);
            res.status(201).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };


    getTodayDiary = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;


            if (!motherId) {
                return res.status(400).json({
                    error: "Mother ID no encontrado en el token"
                });
            }

            const patientId = req.params.patientId as string;

            if (!patientId) {
                return res.status(400).json({
                    error: "Patient ID es requerido"
                });
            }

            await this.facade.validatePatientBelongsToMother(patientId, motherId);

            const query = GetTodayNutritionalDiaryQueryAssembler.toQuery(patientId);

            const result = await this.facade.getTodayNutritionalDiary(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
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
        req: AuthRequest,
        res: Response
    ) => {
        try {

            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({
                    error: "Mother ID no encontrado en el token"
                });
            }


            const query =
                GetNutritionalHistoryQueryAssembler
                    .toQuery(
                        req.params.patientId as string
                    );

            const result = await this.facade.getNutritionalHistoryWithValidation(query, motherId);

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
