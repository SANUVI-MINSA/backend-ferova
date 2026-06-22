import { PatientRepository } from
        "../../../patient-management/domain/repositories/PatientRepository";

import { UserRepository } from
        "../../../iam/domain/repositories/UserRepository";
import { NutritionalDiaryCommandService } from "../../model/services/NutritionalDiaryCommandService";
import { NutritionalDiaryRepository } from "../../model/repositories/NutritionalDiaryRepository";
import { FoodEntryRepository } from "../../model/repositories/FoodEntryRepository";
import { FoodItemRepository } from "../../model/repositories/FoodItemRepository";
import { IronCalculatorService } from "../../model/services/IronCalculatorService";
import { RegisterFoodEntryCommand } from "../../model/domain/commands/RegisterFoodEntryCommand";
import { FoodEntry } from "../../model/domain/entities/FoodEntry";
import { randomUUID } from "node:crypto";
import { NutritionalDiary } from "../../model/domain/aggregate/NutritionalDiary";


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
    ) { }

    async registerFoodEntry(
        command: RegisterFoodEntryCommand
    ): Promise<any> {

        console.log(`[NutritionalDiaryCommandService] registerFoodEntry - INICIO`);
        console.log(`[NutritionalDiaryCommandService] patientId: ${command.patientId}`);
        console.log(`[NutritionalDiaryCommandService] motherId: ${command.motherId}`);
        console.log(`[NutritionalDiaryCommandService] foodItemId: ${command.foodItemId}`);
        console.log(`[NutritionalDiaryCommandService] quantity: ${command.quantity}`);

        /**
         * 1 Validate mother exists
         */
        const mother =
            await this.userRepository
                .findMotherById(
                    command.motherId
                );

        if (!mother) {
            console.error(`[NutritionalDiaryCommandService] Mother not found: ${command.motherId}`);
            throw new Error(
                "Mother not found"
            );
        }

        console.log(`[NutritionalDiaryCommandService] Mother found: ${mother.getId()}`);

        /**
         * 2 Validate patient exists
         */
        const patient =
            await this.patientRepository
                .findById(
                    command.patientId
                );

        if (!patient) {
            console.error(`[NutritionalDiaryCommandService] Patient not found: ${command.patientId}`);
            throw new Error(
                "Patient not found"
            );
        }

        const patientData =
            patient.toPrimitives();

        console.log(`[NutritionalDiaryCommandService] Patient found: ${patientData.name}`);

        /**
         * 3 Validate patient belongs to mother
         */
        if (
            patientData.motherId !==
            command.motherId
        ) {
            console.error(`[NutritionalDiaryCommandService] Patient does not belong to mother`);
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
            console.error(`[NutritionalDiaryCommandService] Food item not found: ${command.foodItemId}`);
            throw new Error(
                "Food item not found"
            );
        }

        const foodData =
            foodItem.toPrimitives();

        console.log(`[NutritionalDiaryCommandService] Food item found: ${foodData.name}`);

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
         * ✅ MODIFICADO: Crear diario con fecha UTC consistente
         */
        let diary =
            await this
                .diaryRepository
                .findTodayByPatientId(
                    command.patientId
                );

        if (!diary) {
            console.log(`[NutritionalDiaryCommandService] No se encontró diario, creando uno nuevo...`);

            // ✅ Crear con fecha UTC (consistente con findTodayByPatientId)
            const today = new Date();
            // Normalizar a inicio del día UTC
            const startOfDayUTC = new Date(Date.UTC(
                today.getUTCFullYear(),
                today.getUTCMonth(),
                today.getUTCDate(),
                0, 0, 0, 0
            ));

            console.log(`[NutritionalDiaryCommandService] Creando diario con fecha UTC: ${startOfDayUTC.toISOString()}`);

            diary =
                new NutritionalDiary(
                    randomUUID(),
                    command.patientId,
                    command.motherId,
                    startOfDayUTC,  // ✅ Fecha UTC normalizada
                    0,
                    false
                );

            await this
                .diaryRepository
                .save(
                    diary
                );

            console.log(`[NutritionalDiaryCommandService] Diario creado: ${diary.getId()}`);
        } else {
            console.log(`[NutritionalDiaryCommandService] Diario encontrado: ${diary.getId()}`);
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

        console.log(`[NutritionalDiaryCommandService] Iron absorbed: ${ironAbsorbed}`);

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

        console.log(`[NutritionalDiaryCommandService] Food entry creado: ${foodEntry.getId()}`);

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

        console.log(`[NutritionalDiaryCommandService] Diario actualizado - newTotal: ${newTotal}`);

        /**
         * 10 Response
         */
        const response = {
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

        console.log(`[NutritionalDiaryCommandService] registerFoodEntry - ÉXITO`);
        console.log(`[NutritionalDiaryCommandService] Response: ${JSON.stringify(response)}`);

        return response;
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

    async validatePatientBelongsToMother(patientId: string, motherId: string): Promise<void> {
        console.log(`[NutritionalDiaryCommandService] validatePatientBelongsToMother - patientId: ${patientId}, motherId: ${motherId}`);
        const patient = await this.patientRepository.findById(patientId);

        if (!patient) {
            console.error(`[NutritionalDiaryCommandService] Paciente no encontrado: ${patientId}`);
            throw new Error("Paciente no encontrado");
        }

        const patientData = patient.toPrimitives();

        if (patientData.motherId !== motherId) {
            console.error(`[NutritionalDiaryCommandService] Paciente no pertenece a la madre`);
            throw new Error("Este paciente no pertenece a esta madre");
        }

        console.log(`[NutritionalDiaryCommandService] Validación exitosa`);
    }
}