import { AppointmentStatus } from "../enum/AppointmentStatus";

export class Appointment {

    constructor(
        private readonly id: string,
        private readonly facilityId: string,
        private readonly patientId: string,
        private readonly motherId: string,
        private nurseId: string | null,
        private readonly date: Date,
        private status: AppointmentStatus
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.facilityId?.trim()) {
            throw new Error(
                "Facility id is required"
            );
        }

        if (!this.patientId?.trim()) {
            throw new Error(
                "Patient id is required"
            );
        }

        if (!this.motherId?.trim()) {
            throw new Error(
                "Mother id is required"
            );
        }

        if (!(this.date instanceof Date)) {
            throw new Error(
                "Valid appointment date is required"
            );
        }
    }

    public assignNurse(
        nurseId: string
    ): void {

        if (!nurseId?.trim()) {
            throw new Error(
                "Nurse id is required"
            );
        }

        this.nurseId = nurseId;
    }

    public cancelAppointment(): void {

        if (
            this.status ===
            AppointmentStatus.CANCELLED
        ) {
            throw new Error(
                "Appointment already cancelled"
            );
        }

        this.status =
            AppointmentStatus.CANCELLED;
    }

    public confirmAppointment(): void {
        this.status =
            AppointmentStatus.CONFIRMED;
    }

    public getId(): string {
        return this.id;
    }

    public getPatientId(): string {
        return this.patientId;
    }

    public getMotherId(): string {
        return this.motherId;
    }

    public getFacilityId(): string {
        return this.facilityId;
    }

    public getNurseId(): string | null {
        return this.nurseId;
    }

    public getDate(): Date {
        return this.date;
    }

    public getStatus(): AppointmentStatus {
        return this.status;
    }

    public toPrimitives() {
        return {
            id: this.id,
            facilityId: this.facilityId,
            patientId: this.patientId,
            motherId: this.motherId,
            nurseId: this.nurseId,
            date: this.date,
            status: this.status
        };
    }
}