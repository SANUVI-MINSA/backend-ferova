export class FacilityAnalyticsItemDto {
    constructor(
        public readonly facilityId: string,
        public readonly facilityName: string,
        public readonly districtName: string,
        public readonly adherenceRate: number,    // 0-100
        public readonly riskLevel: "LOW" | "MEDIUM" | "HIGH",
        public readonly totalPatients: number,
        public readonly totalConfirmed: number,
        public readonly totalOmitted: number
    ) {}
}

export class FacilitiesAnalyticsResponseDto {
    constructor(
        public readonly facilities: FacilityAnalyticsItemDto[]
    ) {}
}