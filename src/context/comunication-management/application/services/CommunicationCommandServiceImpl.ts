import {CommunicationCommandService} from "../../domain/services/CommunicationCommandService";
import {AddMessageCommand} from "../../domain/model/commands/AddMessageCommand";
import {CloseConsultationCommand} from "../../domain/model/commands/CloseConsultationCommand";
import {StartConsultationCommand} from "../../domain/model/commands/StartConsultationCommand";
import {ConsultationRepository} from "../../domain/repositories/ConsultationRepository";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";
import {UserRepository} from "../../../iam/domain/repositories/UserRepository";
import {Message} from "../../domain/model/entities/Message";
import {MessageSender} from "../../domain/model/enum/MessageSender";
import {randomUUID} from "node:crypto";
import {Consultation} from "../../domain/model/aggregate/Consultation";

export class CommunicationCommandServiceImpl
    implements CommunicationCommandService {

    constructor(
        private consultationRepository:
        ConsultationRepository,

        private patientRepository:
        PatientRepository,

        private userRepository:
        UserRepository
    ) {}


    async addMessage(
        command: AddMessageCommand
    ): Promise<any> {

        const consultation =
            await this
                .consultationRepository
                .findById(
                    command.consultationId
                );

        if (!consultation) {
            throw new Error(
                "Consultation not found"
            );
        }

        const message =
            new Message(
                randomUUID,
                command.senderId,
                command.senderRole,
                command.content,
                new Date()
            );

        consultation.sendMessage(
            message
        );

        await this
            .consultationRepository
            .update(
                consultation
            );

        return {
            message:
                "Message sent successfully"
        };
    }

    async startConsultation(
        command: StartConsultationCommand
    ): Promise<any> {

        const patient =
            await this
                .patientRepository
                .findById(
                    command.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        const patientData =
            patient.toPrimitives();


        if (
            patientData.motherId !==
            command.motherId
        ) {
            throw new Error(
                "Patient does not belong to this mother"
            );
        }

        if (
            !patientData.nurseId
        ) {
            throw new Error(
                "Patient has no assigned nurse"
            );
        }


        const existingConsultation =
            await this
                .consultationRepository
                .findOpenByPatientId(
                    command.patientId
                );

        if (
            existingConsultation
        ) {
            throw new Error(
                "There is already an active consultation for this patient"
            );
        }


        const firstMessage =
            new Message(
                randomUUID,
                command.motherId,
                MessageSender.MOTHER,
                command.firstMessageContent,
                new Date()
            );


        const consultation =
            new Consultation(
                randomUUID,
                command.patientId,
                command.motherId,
                patientData.nurseId,
                [firstMessage],
                new Date(),
                null
            );

        await this
            .consultationRepository
            .save(
                consultation
            );

        return {
            consultationId:
                consultation.getId(),
            message:
                "Consultation created successfully"
        };
    }

    async closeConsultation(
        command: CloseConsultationCommand
    ): Promise<any> {

        const consultation =
            await this
                .consultationRepository
                .findById(
                    command.consultationId
                );

        if (!consultation) {
            throw new Error(
                "Consultation not found"
            );
        }

        const data =
            consultation.toPrimitives();

        if (
            data.nurseId !==
            command.nurseId
        ) {
            throw new Error(
                "Only assigned nurse can close consultation"
            );
        }

        const nurseMessages =
            data.messages.filter(
                message =>
                    message.senderRole ===
                    MessageSender.NURSE
            );

        if (
            nurseMessages.length === 0
        ) {
            throw new Error(
                "Consultation must contain at least one nurse response before closing"
            );
        }

        await this
            .consultationRepository
            .delete(
                command.consultationId
            );

        return {
            message:
                "Consultation closed successfully"
        };
    }
}