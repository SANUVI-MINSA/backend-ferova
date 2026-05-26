// repositories
import {
    MongoHealthFacilityRepository
} from "../../infrastructure/persistence/mongodb/repositories/MongoHealthFacilityRepository";
import {
    MongoAppointmentRepository
} from "../../infrastructure/persistence/mongodb/repositories/MongoAppointmentRepository";
import {
    MongoNurseAssignmentRepository
} from "../../infrastructure/persistence/mongodb/repositories/MongoNurseAssignmentRepository";
import {
    DistrictRepository
} from "../../../../shared/catalogs/district/DistrictRepository";

import {
    HealthFacilityCommandServiceImpl
} from "../../application/internal/commandService/HealthFacilityCommandServiceImpl";
import {HealthFacilityQueryServiceImpl} from "../../application/internal/queryServices/HealthFacilityQueryServiceImpl";
import {HealthFacilityFacade} from "../acl/facade/HealthyFacilityFacade";
import {HealthFacilityController} from "../HealthFacilityController";
import {MongoUserRepository} from "../../../iam/infrastructure/persistence/mongodb/repositories/MongoUserRepository";
import {
    MongoPatientRepository
} from "../../../patient-management/infrastructure/persistence/mongodb/repositories/MongoPatientRepository";


const healthFacilityRepository =
    new MongoHealthFacilityRepository();

const appointmentRepository =
    new MongoAppointmentRepository();

const nurseAssignmentRepository =
    new MongoNurseAssignmentRepository();

const districtRepository =
    new DistrictRepository();

const userRepository = new MongoUserRepository

const patientRepository = new MongoPatientRepository();

// command service
const healthFacilityCommandService =
    new HealthFacilityCommandServiceImpl(
        healthFacilityRepository,
        appointmentRepository,
        nurseAssignmentRepository,
        districtRepository,
        userRepository,
        patientRepository
    );


// query service
const healthFacilityQueryService =
    new HealthFacilityQueryServiceImpl(
        healthFacilityRepository,
        appointmentRepository,
        patientRepository,
        userRepository,
        nurseAssignmentRepository
    );


// facade
const healthFacilityFacade =
    new HealthFacilityFacade(
        healthFacilityCommandService,
        healthFacilityQueryService
    );


// controller
export const healthFacilityController =
    new HealthFacilityController(
        healthFacilityFacade,
        districtRepository
    );