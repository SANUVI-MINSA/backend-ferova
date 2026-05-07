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

const patientRepository =
    new MongoPatientRepository();

const medicalRecordRepository =
    new MongoMedicalRecordRepository();

const nurseAssignmentRepository = new MongoNurseAssignmentRepository

const patientCommandService =
    new PatientCommandServiceImpl(
        patientRepository,
        medicalRecordRepository,
        nurseAssignmentRepository
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