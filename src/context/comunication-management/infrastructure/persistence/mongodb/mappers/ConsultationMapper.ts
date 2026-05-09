import {Consultation} from "../../../../domain/model/aggregate/Consultation";
import {Message} from "../../../../domain/model/entities/Message";


export class ConsultationMapper {

    static toDomain(
        document: any
    ): Consultation {

        const messages =
            document.messages.map(
                (message: any) =>
                    new Message(
                        message.id,
                        message.senderId,
                        message.senderRole,
                        message.content,
                        message.sentAt
                    )
            );

        return new Consultation(
            document.id,
            document.patientId,
            document.motherId,
            document.nurseId,
            messages,
            document.createdAt,
            document.closedAt
        );
    }

    static toPersistence(
        consultation: Consultation
    ) {
        return consultation
            .toPrimitives();
    }
}