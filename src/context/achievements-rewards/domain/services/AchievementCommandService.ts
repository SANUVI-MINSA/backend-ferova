export interface AchievementCommandService {
    forceEvaluateBadges(patientId: string): Promise<any>;
}