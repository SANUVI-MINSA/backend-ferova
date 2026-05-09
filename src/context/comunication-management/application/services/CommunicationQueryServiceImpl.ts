import {CommunicationQueryService} from "../../domain/services/CommunicationQueryService";
import {ConsultationRepository} from "../../domain/repositories/ConsultationRepository";
import {PatientRepository} from "../../../patient-management/domain/repositories/PatientRepository";
import {UserRepository} from "../../../iam/domain/repositories/UserRepository";
import {GetPatientsWithNurseAssignmentQuery} from "../../domain/model/queries/GetPatientsWithNurseAssignmentQuery";
import {GetNurseInfoForConsultationQuery} from "../../domain/model/queries/GetNurseInfoForConsultationQuery";
import {GetConsultationChatQuery} from "../../domain/model/queries/GetConsultationChatQuery";
import {GetOpenConsultationsByMotherQuery} from "../../domain/model/queries/GetOpenConsultationsByMotherQuery";
import {GetOpenConsultationsByNurseQuery} from "../../domain/model/queries/GetOpenConsultationsByNurseQuery";
import {GetMessagesAfterQuery} from "../../domain/model/queries/GetMessagesAfterQuery";

export class CommunicationQueryServiceImpl
    implements CommunicationQueryService {

    constructor(
        private consultationRepository:
        ConsultationRepository,
        private patientRepository:
        PatientRepository,
        private userRepository:
        UserRepository
    ) {}

    async getPatientsWithNurseAssignment(
        query: GetPatientsWithNurseAssignmentQuery
    ): Promise<any> {

        const patients =
            await this
                .patientRepository
                .findByMotherId(
                    query.motherId
                );

        return await Promise.all(
            patients.map(
                async patient => {

                    const data =
                        patient.toPrimitives();

                    let nurseName =
                        null;

                    if (
                        data.nurseId
                    ) {
                        const nurse =
                            await this
                                .userRepository
                                .findNurseById(
                                    data.nurseId
                                );

                        nurseName =
                            nurse
                                ?.toPrimitives()
                                ?.name;
                    }

                    return {
                        patientId:
                        data.id,
                        patientName:
                            `${data.name} ${data.lastName}`,
                        hasNurseAssigned:
                            !!data.nurseId,
                        nurseId:
                        data.nurseId,
                        nurseName
                    };
                }
            )
        );
    }

    async getNurseInfoForConsultation(
        query: GetNurseInfoForConsultationQuery
    ): Promise<any> {

        const patient =
            await this
                .patientRepository
                .findById(
                    query.patientId
                );

        if (!patient) {
            throw new Error(
                "Patient not found"
            );
        }

        const patientData =
            patient.toPrimitives();

        if (!patientData.nurseId) {
            throw new Error(
                "This patient no longer has an assigned nurse"
            );
        }

        const nurse =
            await this
                .userRepository
                .findNurseById(
                    patientData.nurseId
                );

        const nurseData =
            nurse?.toPrimitives();

        return {
            patientId:
            patientData.id,
            patientName:
                `${patientData.name} ${patientData.lastName}`,
            nurseId:
            patientData.nurseId,
            nurseName:
            nurseData?.name
        };
    }

    async getConsultationChat(
        query: GetConsultationChatQuery
    ): Promise<any> {

        const consultation =
            await this
                .consultationRepository
                .findById(
                    query.consultationId
                );

        if (!consultation) {
            throw new Error(
                "Consultation not found"
            );
        }

        const data =
            consultation.toPrimitives();

        const authorized =
            data.motherId === query.requesterId ||
            data.nurseId === query.requesterId;

        if (!authorized) {
            throw new Error(
                "Not authorized"
            );
        }

        return {
            consultationId:
            data.id,
            patientId:
            data.patientId,
            nurseId:
            data.nurseId,
            messages:
                data.messages.sort(
                    (a,b)=>
                        new Date(a.sentAt).getTime()
                        -
                        new Date(b.sentAt).getTime()
                )
        };
    }

    async getOpenConsultationsByMother(
        query: GetOpenConsultationsByMotherQuery
    ): Promise<any> {

        const consultations =
            await this
                .consultationRepository
                .findOpenByMotherId(
                    query.motherId
                );

        return consultations.map(
            consultation =>
                consultation.toPrimitives()
        );
    }

    // CommunicationQueryServiceImpl.ts

    async getOpenConsultationsByNurse(
        query: GetOpenConsultationsByNurseQuery
    ): Promise<any> {

        let consultations = await this
            .consultationRepository
            .findOpenByNurseId(query.nurseId);

        // Enriquecer cada consulta con datos del paciente y la madre
        const enrichedConsultations = await Promise.all(
            consultations.map(async (consultation) => {
                const consultationData = consultation.toPrimitives();

                // Obtener datos del paciente
                const patient = await this.patientRepository.findById(consultationData.patientId);
                const patientData = patient?.toPrimitives();

                // Obtener datos de la madre (asumiendo que UserRepository tiene findById o similar)
                const mother = await this.userRepository.findMotherById(consultationData.motherId);
                const motherData = mother?.toPrimitives();

                return {
                    consultationId: consultationData.id,
                    patientId: consultationData.patientId,
                    patientName: patientData ? `${patientData.name} ${patientData.lastName || ''}` : 'Unknown',
                    motherId: consultationData.motherId,
                    motherName: motherData?.name || 'Unknown',
                    nurseId: consultationData.nurseId,
                    lastMessage: consultationData.messages.length > 0
                        ? consultationData.messages[consultationData.messages.length - 1].content
                        : null,
                    lastMessageDate: consultationData.messages.length > 0
                        ? consultationData.messages[consultationData.messages.length - 1].sentAt
                        : null,
                    createdAt: consultationData.createdAt,
                    messageCount: consultationData.messages.length
                };
            })
        );

        // Filtrar por searchTerm (ahora busca en patientName o motherName)
        if (query.searchTerm) {
            const searchLower = query.searchTerm.toLowerCase();
            return enrichedConsultations.filter(
                c => c.patientName.toLowerCase().includes(searchLower) ||
                    c.motherName.toLowerCase().includes(searchLower)
            );
        }

        return enrichedConsultations;
    }

    async getMessagesAfter(
        query: GetMessagesAfterQuery
    ): Promise<any> {

        const consultation =
            await this
                .consultationRepository
                .findById(
                    query.consultationId
                );

        if (!consultation) {
            throw new Error(
                "Consultation not found"
            );
        }

        const data =
            consultation.toPrimitives();

        const authorized =
            data.motherId === query.requesterId ||
            data.nurseId === query.requesterId;

        if (!authorized) {
            throw new Error(
                "Not authorized"
            );
        }

        const limit =
            query.limit || 100;

        return data.messages
            .filter(
                message =>
                    new Date(
                        message.sentAt
                    ).getTime() >
                    query.afterTimestamp
            )
            .sort(
                (a,b)=>
                    new Date(a.sentAt).getTime()
                    -
                    new Date(b.sentAt).getTime()
            )
            .slice(0, limit);
    }
}