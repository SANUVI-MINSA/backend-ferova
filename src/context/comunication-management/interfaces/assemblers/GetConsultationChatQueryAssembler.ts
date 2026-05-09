import {GetConsultationChatQuery} from "../../domain/model/queries/GetConsultationChatQuery";

export class GetConsultationChatQueryAssembler {

    static toQuery(
        consultationId: string,
        requesterId: string
    ): GetConsultationChatQuery {

        return {
            consultationId,
            requesterId
        };
    }
}