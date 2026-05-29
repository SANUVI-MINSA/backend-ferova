import {TreatmentRepository} from "../../../../../treatment-tracking/model/repositories/TreatmentRepository";
import {NurseAssignmentRepository} from "../../../../../Healthy-Facility/domain/repositories/NurseAssignmentRepository";
import {HealthyFacilityRepository} from "../../../../../Healthy-Facility/domain/repositories/HealthFacilityRepository";
import {DashboardSummaryResponseDto} from "../../../../application/dto/DashboardSummaryResponseDto";
import {FacilitiesAnalyticsResponseDto, FacilityAnalyticsItemDto} from "../../../../application/dto/FacilityAnalyticsItemDto";
import {HeatmapDataResponseDto, HeatmapPointDto} from "../../../../application/dto/HeatmapPointDto";
import {TopFacilitiesResponseDto} from "../../../../application/dto/TopFacilitiesResponseDto";

export class MongoAnalyticsRepository {

    constructor(
        private treatmentRepository: TreatmentRepository,
        private nurseAssignmentRepository: NurseAssignmentRepository,
        private healthFacilityRepository: HealthyFacilityRepository
    ) {}

    async getDashboardSummary(): Promise<DashboardSummaryResponseDto> {
        const facilitiesAnalytics = await this.computeFacilitiesAnalytics();

        const totalActiveFacilities = facilitiesAnalytics.length;
        const totalCriticalFacilities = facilitiesAnalytics.filter(
            f => f.riskLevel === "HIGH"
        ).length;

        const globalAdherenceRate = facilitiesAnalytics.length > 0
            ? facilitiesAnalytics.reduce((sum, f) => sum + f.adherenceRate, 0) / facilitiesAnalytics.length
            : 0;

        return new DashboardSummaryResponseDto(
            totalActiveFacilities,
            totalCriticalFacilities,
            Math.round(globalAdherenceRate * 100) / 100
        );
    }

    async getFacilitiesAnalytics(
        riskLevelFilter?: "LOW" | "MEDIUM" | "HIGH"
    ): Promise<FacilitiesAnalyticsResponseDto> {
        let facilities = await this.computeFacilitiesAnalytics();

        if (riskLevelFilter) {
            facilities = facilities.filter(f => f.riskLevel === riskLevelFilter);
        }

        const items = facilities.map(f =>
            new FacilityAnalyticsItemDto(
                f.facilityId,
                f.facilityName,
                f.districtName,
                f.adherenceRate,
                f.riskLevel,
                f.totalPatients,
                f.totalConfirmed,
                f.totalOmitted
            )
        );

        return new FacilitiesAnalyticsResponseDto(items);
    }

    async getFacilityHeatmapData(
        riskLevelFilter?: "LOW" | "MEDIUM" | "HIGH"
    ): Promise<HeatmapDataResponseDto> {
        let facilities = await this.computeFacilitiesAnalytics();

        if (riskLevelFilter) {
            facilities = facilities.filter(f => f.riskLevel === riskLevelFilter);
        }

        const points = facilities.map(f =>
            new HeatmapPointDto(
                f.facilityId,
                f.facilityName,
                f.lat,
                f.lng,
                f.riskLevel,
                f.adherenceRate
            )
        );

        return new HeatmapDataResponseDto(points);
    }

    private async computeFacilitiesAnalytics(): Promise<any[]> {
        const activeTreatments = await this.treatmentRepository.findAllActive();

        // Agrupar tratamientos por facilityId (a través de nurseId)
        const facilityMap = new Map<string, {
            facilityId: string;
            facilityName: string;
            districtName: string;
            lat: number;
            lng: number;
            totalConfirmed: number;
            totalOmitted: number;
            totalPatients: number;
            riskLevels: string[];
        }>();

        for (const treatment of activeTreatments) {
            const nurseId = treatment.getNurseId();
            const assignment = await this.nurseAssignmentRepository.findActiveByNurseId(nurseId);

            if (!assignment) continue;

            const facilityId = assignment.getFacilityId();
            const facility = await this.healthFacilityRepository.findById(facilityId);

            if (!facility) continue;

            if (!facilityMap.has(facilityId)) {
                const facilityData = facility.toPrimitives();
                facilityMap.set(facilityId, {
                    facilityId: facilityId,
                    facilityName: facilityData.name,
                    districtName: facilityData.districtName,
                    lat: facilityData.coordinates.lat,
                    lng: facilityData.coordinates.lng,
                    totalConfirmed: 0,
                    totalOmitted: 0,
                    totalPatients: 0,
                    riskLevels: []
                });
            }

            const entry = facilityMap.get(facilityId)!;
            entry.totalConfirmed += treatment.toPrimitives().totalConfirmed;
            entry.totalOmitted += treatment.toPrimitives().totalOmitted;
            entry.totalPatients++;
            entry.riskLevels.push(treatment.getRiskScore().getRiskLevel());
        }

        // Calcular métricas finales para cada facility
        const result = [];
        for (const [_, data] of facilityMap) {
            const totalDoses = data.totalConfirmed + data.totalOmitted;
            const adherenceRate = totalDoses === 0 ? 100 : (data.totalConfirmed / totalDoses) * 100;

            const riskLevel = data.riskLevels.includes("HIGH") ? "HIGH" :
                data.riskLevels.includes("MEDIUM") ? "MEDIUM" : "LOW";

            result.push({
                facilityId: data.facilityId,
                facilityName: data.facilityName,
                districtName: data.districtName,
                lat: data.lat,
                lng: data.lng,
                adherenceRate: Math.round(adherenceRate),
                riskLevel: riskLevel,
                totalPatients: data.totalPatients,
                totalConfirmed: data.totalConfirmed,
                totalOmitted: data.totalOmitted
            });
        }

        return result.sort((a, b) => b.adherenceRate - a.adherenceRate);
    }

    async getTopFacilities(limit: number = 4): Promise<TopFacilitiesResponseDto> {
        const facilities = await this.computeFacilitiesAnalytics();
        const topFacilities = facilities
            .sort((a, b) => b.adherenceRate - a.adherenceRate)
            .slice(0, limit);

        const items = topFacilities.map(f =>
            new FacilityAnalyticsItemDto(
                f.facilityId,
                f.facilityName,
                f.districtName,
                f.adherenceRate,
                f.riskLevel,
                f.totalPatients,
                f.totalConfirmed,
                f.totalOmitted
            )
        );

        return new TopFacilitiesResponseDto(items);
    }
}
