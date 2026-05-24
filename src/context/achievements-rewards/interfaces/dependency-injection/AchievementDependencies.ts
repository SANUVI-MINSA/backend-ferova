import {MongoAchievementRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoAchievementRepository";

import {MongoBadgeRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoBadgeRepository";

import {MongoPatientRepository} from "../../../patient-management/infrastructure/persistence/mongodb/repositories/MongoPatientRepository";
import {AchievementQueryServiceImpl} from "../../application/services/AchievementQueryServiceImpl";
import {AchievementFacade} from "../facade/AchievementFacade";
import {AchievementController} from "../controllers/AchievementController";
import {TreatmentEventHandlers} from "../../application/event-handlers/TreatmentEventHandlers";
import {eventPublisher} from "../../../../shared/infrastructure/events/EventPublisher";

const achievementRepository  = new MongoAchievementRepository();
const badgeRepository = new MongoBadgeRepository();
const patientRepository = new MongoPatientRepository();

// Handlers
const treatmentHandlers = new TreatmentEventHandlers(achievementRepository, badgeRepository);

// ========== SUSCRIBIR EVENTOS ==========
eventPublisher.subscribe("TreatmentStarted", (event) =>
    treatmentHandlers.onTreatmentStarted(event)
);

eventPublisher.subscribe("DailyDoseConfirmed", (event) =>
    treatmentHandlers.onDailyDoseConfirmed(event)
);

eventPublisher.subscribe("DailyDoseOmitted", (event) =>
    treatmentHandlers.onDailyDoseOmitted(event)
);

eventPublisher.subscribe("TreatmentCompleted", (event) =>
    treatmentHandlers.onTreatmentCompleted(event)
);

eventPublisher.subscribe("TreatmentAbandoned", (event) =>
    treatmentHandlers.onTreatmentAbandoned(event)
);



const achievementQueryService = new AchievementQueryServiceImpl(
    achievementRepository,
    badgeRepository,
    patientRepository
);

const achievementFacade = new AchievementFacade(achievementQueryService);


export const achievementController = new
    AchievementController(
        achievementFacade
    );
