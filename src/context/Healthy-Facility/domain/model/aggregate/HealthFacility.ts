import {Coordinates} from "../value-object/Coordinates";
import {OperatingSchedule} from "../value-object/OperatingSchedule";
import {FacilityStatus} from "../value-object/FacilityStatus";
import {NurseAssignment} from "../entities/NurseAssignment";

export class HealthFacility {

    constructor(
        private readonly id: string,
        private name: string,
        private address: string,
        private districtId: string,
        private districtName: string,
        private coordinates: Coordinates,
        private phoneNumber: string,
        private services: string[],
        private operatingSchedule: OperatingSchedule,
        private scheduleOfOperation: string,
        private status: FacilityStatus,
        private nurseAssignments: NurseAssignment[]
    ) {
        this.validate();
    }

    private validate(): void {
        if (!this.name?.trim()) {
            throw new Error(
                "Health facility name is required"
            );
        }

        if (!this.address?.trim()) {
            throw new Error(
                "Address is required"
            );
        }

        if (!this.districtId?.trim()) {
            throw new Error(
                "District id is required"
            );
        }

        if (!this.phoneNumber?.trim()) {
            throw new Error(
                "Phone number is required"
            );
        }
    }

    public activate(): void {
        this.status = FacilityStatus.ACTIVE;
    }

    public deactivate(): void {
        this.status = FacilityStatus.INACTIVE;
    }

    public updateServices(
        services: string[]
    ): void {
        this.services = services;
    }

    assignNurse(
        assignment: NurseAssignment
    ): void {

        const alreadyAssigned =
            this.nurseAssignments.some(
                nurse =>
                    nurse.getNurseId() ===
                    assignment.getNurseId()
            );

        if (alreadyAssigned) {
            throw new Error(
                "Nurse already assigned"
            );
        }

        this.nurseAssignments.push(
            assignment
        );
    }

    public toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            address: this.address,
            districtId: this.districtId,
            districtName: this.districtName,
            coordinates: {
                lat: this.coordinates.getLat(),
                lng: this.coordinates.getLng()
            },
            phoneNumber: this.phoneNumber,
            services: this.services,
            operatingSchedule:
                this.operatingSchedule.toPrimitives(),
            scheduleOfOperation:
            this.scheduleOfOperation,
            status: this.status
        };
    }
}