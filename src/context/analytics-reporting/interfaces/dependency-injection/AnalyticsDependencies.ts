// Repositories de otros BCs
import {
    MongoTreatmentRepository
} from "../../../treatment-tracking/infrastructure/persistence/mongodb/repositories/MongoTreatmentRepository";
import {
    MongoNurseAssignmentRepository
} from "../../../Healthy-Facility/infrastructure/persistence/mongodb/repositories/MongoNurseAssignmentRepository";
import {
    MongoHealthFacilityRepository
} from "../../../Healthy-Facility/infrastructure/persistence/mongodb/repositories/MongoHealthFacilityRepository";
import {MongoAnalyticsRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoAnalyticsRepository";
import {AnalyticsQueryServiceImpl} from "../../application/services/AnalyticsQueryServiceImpl";
import {AnalyticsController} from "../AnalyticsController";

const treatmentRepository = new MongoTreatmentRepository();
const nurseAssignmentRepository = new MongoNurseAssignmentRepository();
const healthFacilityRepository = new MongoHealthFacilityRepository();

const analyticsRepository = new MongoAnalyticsRepository(
    treatmentRepository,
    nurseAssignmentRepository,
    healthFacilityRepository
);

const analyticsQueryService = new AnalyticsQueryServiceImpl(analyticsRepository);

export const analyticsController = new AnalyticsController(analyticsQueryService);