export interface GetMessagesAfterResource {
    consultationId: string;
    requesterId: string;
    afterTimestamp: number;
    limit?: number;
}