export class HealthFacilityAdminItemDto {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly address: string,
        public readonly assignedNurseName: string | null,
        public readonly hasNurseAssigned: boolean,
        public readonly displayMessage?: string
    ) {}
}

export class HealthFacilityAdminListResponseDto {
    constructor(
        public readonly total: number,
        public readonly healthFacilities: HealthFacilityAdminItemDto[]
    ) {}
}