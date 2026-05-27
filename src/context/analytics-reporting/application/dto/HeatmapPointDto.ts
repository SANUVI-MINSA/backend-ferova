export class HeatmapPointDto {
    constructor(
        public readonly facilityId: string,
        public readonly facilityName: string,
        public readonly lat: number,
        public readonly lng: number,
        public readonly riskLevel: "LOW" | "MEDIUM" | "HIGH",
        public readonly adherenceRate: number
    ) {}
}

export class HeatmapDataResponseDto {
    constructor(
        public readonly points: HeatmapPointDto[]
    ) {}
}