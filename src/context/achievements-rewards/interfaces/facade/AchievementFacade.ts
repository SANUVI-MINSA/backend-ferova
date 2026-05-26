import {AchievementQueryService} from "../../domain/services/AchievementQueryService";
import {GetPatientAchievementQuery} from "../../domain/model/queries/GetPatientAchievementQuery";
import {GetPatientBadgesQuery} from "../../domain/model/queries/GetPatientBadgesQuery";
import {AchievementCommandService} from "../../domain/services/AchievementCommandService";

export class AchievementFacade {
    constructor(
        private queryService: AchievementQueryService,
        private commandService: AchievementCommandService
    ) {}

    async getPatientAchievement(query: GetPatientAchievementQuery): Promise<any> {
        return this.queryService.getPatientAchievement(query);
    }

    async getPatientBadges(query: GetPatientBadgesQuery): Promise<any> {
        return this.queryService.getPatientBadges(query);
    }

    async forceEvaluateBadges(patientId: string): Promise<any> {
        return this.commandService.forceEvaluateBadges(patientId);
    }
}