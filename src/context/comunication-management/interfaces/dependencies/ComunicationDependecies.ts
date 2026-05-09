// -----------------------------------
// Repositories
// -----------------------------------
import {
    MongoConsultationRepository
} from "../../infrastructure/persistence/mongodb/repositories/MongoConsultationRepository";
import {
    MongoPatientRepository
} from "../../../patient-management/infrastructure/persistence/mongodb/repositories/MongoPatientRepository";
import {MongoUserRepository} from "../../../iam/infrastructure/persistence/mongodb/repositories/MongoUserRepository";
import {CommunicationCommandServiceImpl} from "../../application/services/CommunicationCommandServiceImpl";
import {CommunicationQueryServiceImpl} from "../../application/services/CommunicationQueryServiceImpl";
import {CommunicationFacade} from "../facade/CommunicationFacade";
import {CommunicationController} from "../CommunicationController";

const consultationRepository =
    new MongoConsultationRepository();

const patientRepository =
    new MongoPatientRepository();

const userRepository =
    new MongoUserRepository();


// -----------------------------------
// Services
// -----------------------------------
const communicationCommandService =
    new CommunicationCommandServiceImpl(
        consultationRepository,
        patientRepository,
        userRepository
    );

const communicationQueryService =
    new CommunicationQueryServiceImpl(
        consultationRepository,
        patientRepository,
        userRepository
    );


// -----------------------------------
// Facade
// -----------------------------------
const communicationFacade =
    new CommunicationFacade(
        communicationCommandService,
        communicationQueryService
    );


// -----------------------------------
// Controller
// -----------------------------------
export const communicationController =
    new CommunicationController(
        communicationFacade
    );