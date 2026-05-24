import {MongoTreatmentRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoTreatmentRepository";
import {MongoDailyDoseRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoDailyDoseRepository";
import {
    MongoPatientRepository
} from "../../../patient-management/infrastructure/persistence/mongodb/repositories/MongoPatientRepository";
import {TreatmentCommandServiceImpl} from "../../application/services/TreatmentCommandServiceImpl";
import {TreatmentQueryServiceImpl} from "../../application/services/TreatmentQueryServiceImpl";
import {TreatmentFacade} from "../facade/TreatmentFacade";
import {TreatmentController} from "../TreatmentController";
import {
    MongoAchievementRepository
} from "../../../achievements-rewards/infrastructure/persistence/mongodb/repositories/MongoAchievementRepository";
import {
    MongoBadgeRepository
} from "../../../achievements-rewards/infrastructure/persistence/mongodb/repositories/MongoBadgeRepository";

const treatmentRepository =
    new MongoTreatmentRepository();

const dailyDoseRepository =
    new MongoDailyDoseRepository();

const patientRepository =
    new MongoPatientRepository();

const achievementRepository =
    new MongoAchievementRepository();

const badgeRepository =
    new MongoBadgeRepository();

const treatmentCommandService =
    new TreatmentCommandServiceImpl(
        treatmentRepository,
        dailyDoseRepository,
        patientRepository,
        achievementRepository,
        badgeRepository
    );

const treatmentQueryService =
    new TreatmentQueryServiceImpl(
        treatmentRepository,
        dailyDoseRepository,
        patientRepository
    );

const treatmentFacade =
    new TreatmentFacade(
        treatmentCommandService,
        treatmentQueryService,
        patientRepository
    );

export const treatmentController =
    new TreatmentController(
        treatmentFacade
    );