

// BC integrations
import { PatientRepository } from
        "../../../patient-management/domain/repositories/PatientRepository";

import { UserRepository } from
        "../../../iam/domain/repositories/UserRepository";
import {NutritionalDiaryCommandService} from "../../model/services/NutritionalDiaryCommandService";
import {NutritionalDiaryRepository} from "../../model/repositories/NutritionalDiaryRepository";
import {FoodEntryRepository} from "../../model/repositories/FoodEntryRepository";
import {FoodItemRepository} from "../../model/repositories/FoodItemRepository";
import {IronCalculatorService} from "../../model/services/IronCalculatorService";
import {RegisterFoodEntryCommand} from "../../model/domain/commands/RegisterFoodEntryCommand";
import {FoodEntry} from "../../model/domain/entities/FoodEntry";
import {randomUUID} from "node:crypto";
import {NutritionalDiary} from "../../model/domain/aggregate/NutritionalDiary";


export class NutritionalDiaryCommandServiceImpl
    implements NutritionalDiaryCommandService {

    constructor(
        private diaryRepository:
        NutritionalDiaryRepository,

        private foodEntryRepository:
        FoodEntryRepository,

        private foodItemRepository:
        FoodItemRepository,

        private ironCalculator:
        IronCalculatorService,

        // external BCs
        private patientRepository:
        PatientRepository,

        private userRepository:
        UserRepository
    ) {}

    async registerFoodEntry(
        command: RegisterFoodEntryCommand
    ): Promise<any> {

        /**
         * 1 Validate mother exists
         */
        const mother =
            await this.userRepository
                .findMotherById(
                    command.motherId
                );

        if (!mother) {
            throw new Error(
                "Mother not found"
            );
        }


        /**
         * 2 Validate patient exists
         */
        const patient =
            await this.patientRepository
                .findById(
                    command.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        const patientData =
            patient.toPrimitives();


        /**
         * 3 Validate patient belongs to mother
         */
        if (
            patientData.motherId !==
            command.motherId
        ) {
            throw new Error(
                "This mother is not assigned to this patient"
            );
        }


        /**
         * 4 Find food item
         */
        const foodItem =
            await this.foodItemRepository
                .findById(
                    command.foodItemId
                );

        if (!foodItem) {
            throw new Error(
                "Food item not found"
            );
        }

        const foodData =
            foodItem.toPrimitives();


        /**
         * 5 Determine unit automatically
         */
        const unit =
            this.determineUnit(
                foodData.category,
                foodData.name
            );


        /**
         * 6 Find today's diary or create new one
         */
        let diary =
            await this
                .diaryRepository
                .findTodayByPatientId(
                    command.patientId
                );

        if (!diary) {

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            diary =
                new NutritionalDiary(
                    randomUUID(),
                    command.patientId,
                    command.motherId,
                    today,
                    0,
                    false
                );

            await this
                .diaryRepository
                .save(
                    diary
                );
        }


        /**
         * 7 Calculate absorbed iron
         */
        const ironAbsorbed =
            this.ironCalculator
                .calculateIronAbsorption(
                    foodData
                        .nutrientContent
                        .ironMg,

                    command.quantity,

                    foodData
                        .nutrientContent
                        .ironType
                );


        /**
         * 8 Create food entry
         */
        const foodEntry =
            new FoodEntry(
                randomUUID(),
                diary.getId(),
                command.foodItemId,
                command.quantity,
                unit,
                ironAbsorbed,
                new Date()
            );

        await this
            .foodEntryRepository
            .save(
                foodEntry
            );


        /**
         * 9 Update diary totals
         */
        const newTotal =
            Number(
                (
                    diary
                        .getTotalIronAbsorbed()
                    + ironAbsorbed
                ).toFixed(2)
            );

        let warningMessage =
            null;

        if (
            foodData.isInhibitor
        ) {
            diary
                .markInhibitorDetected();

            warningMessage =
                `¡Advertencia! ${foodData.name} puede reducir la absorción del suplemento de hierro.`;
        }

        diary.updateMetrics(
            newTotal,
            diary.hasDetectedInhibitor()
        );

        await this
            .diaryRepository
            .update(
                diary
            );


        /**
         * 10 Response
         */
        return {
            success: true,
            message:
                "Alimento registrado exitosamente",

            foodEntry: {
                id:
                    foodEntry.getId(),

                foodName:
                foodData.name,

                quantity:
                command.quantity,

                unit,

                ironAbsorbed,

                isInhibitor:
                foodData.isInhibitor
            },

            newTotalIronAbsorbed:
            newTotal,

            warningMessage
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
}