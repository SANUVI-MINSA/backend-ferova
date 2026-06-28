import {MongoPatientRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoPatientRepository";
import {
    MongoMedicalRecordRepository
} from "../../infrastructure/persistence/mongodb/repositories/MongoMedicalRecordRepository";
import {PatientCommandServiceImpl} from "../../application/internal/PatientCommandServiceImpl";
import {PatientQueryServiceImpl} from "../../application/internal/PatientQueryServiceImpl";
import {PatientManagementFacade} from "../facade/PatientManagementFacade";
import {PatientManagementController} from "../PatientManagementController";
import {MongoUserRepository} from "../../../iam/infrastructure/persistence/mongodb/repositories/MongoUserRepository";
import {
    MongoNurseAssignmentRepository
} from "../../../Healthy-Facility/infrastructure/persistence/mongodb/repositories/MongoNurseAssignmentRepository";
import {
    MongoTreatmentRepository
} from "../../../treatment-tracking/infrastructure/persistence/mongodb/repositories/MongoTreatmentRepository";
import {
    MongoDailyDoseRepository
} from "../../../treatment-tracking/infrastructure/persistence/mongodb/repositories/MongoDailyDoseRepository";
import {
    MongoAchievementRepository
} from "../../../achievements-rewards/infrastructure/persistence/mongodb/repositories/MongoAchievementRepository";
import {
    MongoBadgeRepository
} from "../../../achievements-rewards/infrastructure/persistence/mongodb/repositories/MongoBadgeRepository";
import {
    MongoConsultationRepository
} from "../../../comunication-management/infrastructure/persistence/mongodb/repositories/MongoConsultationRepository";

const patientRepository =
    new MongoPatientRepository();

const medicalRecordRepository =
    new MongoMedicalRecordRepository();

const nurseAssignmentRepository = new MongoNurseAssignmentRepository

const treatmentRepository = new MongoTreatmentRepository();
const dailyDoseRepository = new MongoDailyDoseRepository();

const achievementRepository = new MongoAchievementRepository();
const badgeRepository = new MongoBadgeRepository();

const consultationRepository = new MongoConsultationRepository();

const patientCommandService =
    new PatientCommandServiceImpl(
        patientRepository,
        medicalRecordRepository,
        nurseAssignmentRepository,
        treatmentRepository,
        dailyDoseRepository,
        achievementRepository,
        badgeRepository,
        consultationRepository
    );

const userRepository =
    new MongoUserRepository

const patientQueryService =
    new PatientQueryServiceImpl(
        patientRepository,
        medicalRecordRepository,
        userRepository
    );

const patientManagementFacade =
    new PatientManagementFacade(
        patientCommandService,
        patientQueryService
    );

export const
    patientManagementController =
        new PatientManagementController(
            patientManagementFacade
        );