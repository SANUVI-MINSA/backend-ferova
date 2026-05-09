import {ConsultationStatus} from "../enum/ConsultationStatus";
import {Message} from "../entities/Message";

export class Consultation {

    constructor(
        private id: string,
        private patientId: string,
        private motherId: string,
        private nurseId: string,
        private status: ConsultationStatus,
        private messages: Message[],
        private createdAt: Date,
        private closedAt: Date | null
    ) {
        this.validate();
    }

    private validate(): void {

        if (!this.id) {
            throw new Error(
                "Consultation id is required"
            );
        }

        if (!this.patientId) {
            throw new Error(
                "Patient id is required"
            );
        }

        if (!this.motherId) {
            throw new Error(
                "Mother id is required"
            );
        }

        if (!this.nurseId) {
            throw new Error(
                "Nurse id is required"
            );
        }

        if (!this.createdAt) {
            throw new Error(
                "Created date is required"
            );
        }
    }

    sendMessage(
        message: Message
    ): void {

        if (
            this.status ===
            ConsultationStatus.CLOSED
        ) {
            throw new Error(
                "Cannot send messages to a closed consultation"
            );
        }

        const senderId =
            message.getSenderId();

        if (
            senderId !== this.motherId &&
            senderId !== this.nurseId
        ) {
            throw new Error(
                "Sender is not part of this consultation"
            );
        }

        this.messages.push(
            message
        );
    }

    close(): void {

        if (
            this.status ===
            ConsultationStatus.CLOSED
        ) {
            throw new Error(
                "Consultation is already closed"
            );
        }

        this.status =
            ConsultationStatus.CLOSED;

        this.closedAt =
            new Date();
    }

    isOpen(): boolean {
        return (
            this.status ===
            ConsultationStatus.OPEN
        );
    }

    getId(): string {
        return this.id;
    }

    getPatientId(): string {
        return this.patientId;
    }

    getMotherId(): string {
        return this.motherId;
    }

    getNurseId(): string {
        return this.nurseId;
    }

    getMessages(): Message[] {
        return this.messages;
    }

    toPrimitives() {
        return {
            id: this.id,
            patientId: this.patientId,
            motherId: this.motherId,
            nurseId: this.nurseId,
            status: this.status,
            messages: this.messages.map(
                message =>
                    message.toPrimitives()
            ),
            createdAt: this.createdAt,
            closedAt: this.closedAt
        };
    }

}