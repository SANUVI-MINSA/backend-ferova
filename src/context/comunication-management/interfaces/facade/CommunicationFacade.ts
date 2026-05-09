import {CommunicationCommandService} from "../../domain/services/CommunicationCommandService";
import {CommunicationQueryService} from "../../domain/services/CommunicationQueryService";
import {StartConsultationCommand} from "../../domain/model/commands/StartConsultationCommand";
import {AddMessageCommand} from "../../domain/model/commands/AddMessageCommand";
import {CloseConsultationCommand} from "../../domain/model/commands/CloseConsultationCommand";
import {GetPatientsWithNurseAssignmentQuery} from "../../domain/model/queries/GetPatientsWithNurseAssignmentQuery";
import {GetNurseInfoForConsultationQuery} from "../../domain/model/queries/GetNurseInfoForConsultationQuery";
import {GetConsultationChatQuery} from "../../domain/model/queries/GetConsultationChatQuery";
import {GetOpenConsultationsByMotherQuery} from "../../domain/model/queries/GetOpenConsultationsByMotherQuery";
import {GetOpenConsultationsByNurseQuery} from "../../domain/model/queries/GetOpenConsultationsByNurseQuery";
import {GetMessagesAfterQuery} from "../../domain/model/queries/GetMessagesAfterQuery";

export class CommunicationFacade {

    constructor(
        private commandService:
        CommunicationCommandService,

        private queryService:
        CommunicationQueryService
    ) {}

    async startConsultation(
        command: StartConsultationCommand
    ): Promise<any> {

        return await this
            .commandService
            .startConsultation(
                command
            );
    }

    async addMessage(
        command: AddMessageCommand
    ): Promise<any> {

        return await this
            .commandService
            .addMessage(
                command
            );
    }

    async closeConsultation(
        command: CloseConsultationCommand
    ): Promise<any> {

        return await this
            .commandService
            .closeConsultation(
                command
            );
    }

    async getPatientsWithNurseAssignment(
        query: GetPatientsWithNurseAssignmentQuery
    ): Promise<any> {

        return await this
            .queryService
            .getPatientsWithNurseAssignment(
                query
            );
    }

    async getNurseInfoForConsultation(
        query: GetNurseInfoForConsultationQuery
    ): Promise<any> {

        return await this
            .queryService
            .getNurseInfoForConsultation(
                query
            );
    }

    async getConsultationChat(
        query: GetConsultationChatQuery
    ): Promise<any> {

        return await this
            .queryService
            .getConsultationChat(
                query
            );
    }

    async getOpenConsultationsByMother(
        query: GetOpenConsultationsByMotherQuery
    ): Promise<any> {

        return await this
            .queryService
            .getOpenConsultationsByMother(
                query
            );
    }

    async getOpenConsultationsByNurse(
        query: GetOpenConsultationsByNurseQuery
    ): Promise<any> {

        return await this
            .queryService
            .getOpenConsultationsByNurse(
                query
            );
    }

    async getMessagesAfter(
        query: GetMessagesAfterQuery
    ): Promise<any> {

        return await this
            .queryService
            .getMessagesAfter(
                query
            );
    }
}