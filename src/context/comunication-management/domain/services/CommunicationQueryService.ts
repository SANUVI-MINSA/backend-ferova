import {GetConsultationChatQuery} from "../model/queries/GetConsultationChatQuery";
import {GetNurseInfoForConsultationQuery} from "../model/queries/GetNurseInfoForConsultationQuery";
import {GetOpenConsultationsByMotherQuery} from "../model/queries/GetOpenConsultationsByMotherQuery";
import {GetOpenConsultationsByNurseQuery} from "../model/queries/GetOpenConsultationsByNurseQuery";
import {GetMessagesAfterQuery} from "../model/queries/GetMessagesAfterQuery";
import {GetPatientsWithNurseAssignmentQuery} from "../model/queries/GetPatientsWithNurseAssignmentQuery";

export interface CommunicationQueryService {

    getPatientsWithNurseAssignment(
        query: GetPatientsWithNurseAssignmentQuery
    ): Promise<any>;

    getNurseInfoForConsultation(
        query: GetNurseInfoForConsultationQuery
    ): Promise<any>;

    getConsultationChat(
        query: GetConsultationChatQuery
    ): Promise<any>;

    getOpenConsultationsByMother(
        query: GetOpenConsultationsByMotherQuery
    ): Promise<any>;

    getOpenConsultationsByNurse(
        query: GetOpenConsultationsByNurseQuery
    ): Promise<any>;

    getMessagesAfter(
        query: GetMessagesAfterQuery
    ): Promise<any>;
}