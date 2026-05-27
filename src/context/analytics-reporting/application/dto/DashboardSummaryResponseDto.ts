export class DashboardSummaryResponseDto {
    constructor(
        public readonly totalActiveFacilities: number,   // Ej: 4
        public readonly totalCriticalFacilities: number, // Ej: 2 (riesgo HIGH)
        public readonly globalAdherenceRate: number      // Ej: 54.25
    ) {}
}