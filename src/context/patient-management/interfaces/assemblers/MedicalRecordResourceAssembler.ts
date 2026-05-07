import { MedicalRecord } from
        "../../domain/model/entities/MedicalRecord";

export class MedicalRecordResourceAssembler {

    static toResource(
        medicalRecord: MedicalRecord
    ) {

        const data =
            medicalRecord
                .toPrimitives();

        return {
            medicalRecordId:
            data.id,
            patientId:
            data.patientId,
            nurseId:
            data.nurseId,
            weight:
            data.weight,
            height:
            data.height,
            hemoglobinLevel:
            data.hemoglobinLevel,
            motivoConsulta:
            data.motivoConsulta,
            observaciones:
            data.observaciones,
            antecedentes:
            data.antecedentes,
            sintomas:
            data.sintomas
        };
    }
}