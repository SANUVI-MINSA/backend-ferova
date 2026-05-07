import { AppointmentStatus } from "../enum/AppointmentStatus";

export class Appointment {

    constructor(
        private readonly id: string,
        private readonly facilityId: string,
        private readonly patientId: string,
        private readonly motherId: string,
        private nurseId: string | null,
        private readonly appointmentDate: string,
        private readonly appointmentTime: string,
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

        if (!this.appointmentDate?.trim()) {
            throw new Error(
                "Appointment date is required"
            );
        }

        if (!this.appointmentTime) {
            throw new Error(
                "Appointment time is required"
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

    public getAppointmentDate(): string {
        return this.appointmentDate;
    }

    public getAppointmentTime(): string {
        return this.appointmentTime;
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
            appointmentDate: this.appointmentDate,
            appointmentTime: this.appointmentTime,
            status: this.status
        };
    }
}