import {GetMessagesAfterQuery} from "../../domain/model/queries/GetMessagesAfterQuery";

export class GetMessagesAfterQueryAssembler {

    static toQuery(
        consultationId: string,
        requesterId: string,
        afterTimestamp: number,
        limit?: number
    ): GetMessagesAfterQuery {

        return {
            consultationId,
            requesterId,
            afterTimestamp,
            limit
        };
    }
}