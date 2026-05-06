export class NurseAssignment {

    constructor(
        private readonly id: string,
        private readonly facilityId: string,
        private readonly nurseId: string
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.facilityId?.trim()) {
            throw new Error(
                "Facility id is required"
            );
        }

        if (!this.nurseId?.trim()) {
            throw new Error(
                "Nurse id is required"
            );
        }
    }

    public getId(): string {
        return this.id;
    }

    public getFacilityId(): string {
        return this.facilityId;
    }

    public getNurseId(): string {
        return this.nurseId;
    }

    public toPrimitives() {
        return {
            id: this.id,
            facilityId: this.facilityId,
            nurseId: this.nurseId
        };
    }
}