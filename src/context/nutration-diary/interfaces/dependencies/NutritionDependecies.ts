
// -------------------------------------
// Repositories
// -------------------------------------
import {
    MongoNutritionalDiaryRepository
} from "../../infrastructure/persistence/mongodb/repositories/MongoNutritionalDiaryRepository";
import {MongoFoodEntryRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoFoodEntryRepository";
import {MongoFoodItemRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoFoodItemRepository";
import {
    MongoPatientRepository
} from "../../../patient-management/infrastructure/persistence/mongodb/repositories/MongoPatientRepository";
import {MongoUserRepository} from "../../../iam/infrastructure/persistence/mongodb/repositories/MongoUserRepository";
import {IronCalculatorServiceImpl} from "../../application/services/IronCalculatorServiceImpl";
import {NutritionalDiaryCommandServiceImpl} from "../../application/services/NutritionalDiaryCommandServiceImpl";
import {NutritionalDiaryQueryServiceImpl} from "../../application/services/NutritionalDiaryQueryServiceImpl";
import {NutritionalDiaryFacade} from "../facade/NutritionalDiaryFacade";
import {NutritionalDiaryController} from "../NutritionalDiaryController";

const nutritionalDiaryRepository =
    new MongoNutritionalDiaryRepository();

const foodEntryRepository =
    new MongoFoodEntryRepository();

const foodItemRepository =
    new MongoFoodItemRepository();


// External repositories
const patientRepository =
    new MongoPatientRepository();

const userRepository =
    new MongoUserRepository();


// -------------------------------------
// Domain services
// -------------------------------------
const ironCalculatorService =
    new IronCalculatorServiceImpl();


// -------------------------------------
// Application services
// -------------------------------------
const nutritionalDiaryCommandService =
    new NutritionalDiaryCommandServiceImpl(
        nutritionalDiaryRepository,
        foodEntryRepository,
        foodItemRepository,
        ironCalculatorService,
        patientRepository,
        userRepository
    );

const nutritionalDiaryQueryService =
    new NutritionalDiaryQueryServiceImpl(
        nutritionalDiaryRepository,
        foodEntryRepository,
        foodItemRepository
    );


// -------------------------------------
// Facade
// -------------------------------------
const nutritionalDiaryFacade =
    new NutritionalDiaryFacade(
        nutritionalDiaryCommandService,
        nutritionalDiaryQueryService
    );


// -------------------------------------
// Controller
// -------------------------------------
export const nutritionalDiaryController =
    new NutritionalDiaryController(
        nutritionalDiaryFacade
    );