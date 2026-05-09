import { ConsultationMapper } from "../mappers/ConsultationMapper";
import { ConsultationRepository } from "../../../../domain/repositories/ConsultationRepository";
import { Consultation } from "../../../../domain/model/aggregate/Consultation";
import { ConsultationModel } from "../models/ConsultationSchema";

export class MongoConsultationRepository
    implements ConsultationRepository {

    async save(
        consultation: Consultation
    ): Promise<void> {

        const data =
            ConsultationMapper
                .toPersistence(
                    consultation
                );

        await ConsultationModel
            .create(data);
    }


    async update(
        consultation: Consultation
    ): Promise<void> {

        const data =
            ConsultationMapper
                .toPersistence(
                    consultation
                );

        await ConsultationModel
            .findOneAndUpdate(
                {
                    id: data.id
                },
                data
            );
    }


    async findById(
        consultationId: string
    ): Promise<Consultation | null> {

        const consultation =
            await ConsultationModel
                .findOne({
                    id: consultationId
                });

        if (!consultation) {
            return null;
        }

        return ConsultationMapper
            .toDomain(
                consultation
            );
    }


    async findOpenByMotherId(
        motherId: string
    ): Promise<Consultation[]> {

        const consultations =
            await ConsultationModel
                .find({
                    motherId
                });

        // ✅ SOLUCIÓN: tipar explícitamente el parámetro 'consultation'
        return consultations.map(
            (consultation: any) =>  // ← Agregar ": any" aquí
                ConsultationMapper
                    .toDomain(
                        consultation
                    )
        );
    }


    async findOpenByNurseId(
        nurseId: string
    ): Promise<Consultation[]> {

        const consultations =
            await ConsultationModel
                .find({
                    nurseId
                });

        // ✅ SOLUCIÓN: tipar explícitamente el parámetro 'consultation'
        return consultations.map(
            (consultation: any) =>  // ← Agregar ": any" aquí
                ConsultationMapper
                    .toDomain(
                        consultation
                    )
        );
    }


    async findOpenByPatientId(
        patientId: string
    ): Promise<Consultation | null> {

        const consultation =
            await ConsultationModel
                .findOne({
                    patientId
                });

        if (!consultation) {
            return null;
        }

        return ConsultationMapper
            .toDomain(
                consultation
            );
    }


    async delete(
        consultationId: string
    ): Promise<void> {

        await ConsultationModel
            .deleteOne({
                id: consultationId
            });
    }
}