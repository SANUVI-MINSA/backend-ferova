import {MedicalRecord} from "../../domain/model/entities/MedicalRecord";
import {HemoglobinLevel} from "../../domain/model/value-objects/HemoglobinLevel";
import {Weight} from "../../domain/model/value-objects/Weight";
import {Height} from "../../domain/model/value-objects/Height";
import {Gender} from "../../domain/model/enum/Gender";
import {Antecedente} from "../../domain/model/value-objects/Antecedente";
import {MotivoConsulta} from "../../domain/model/value-objects/MotivoConsulta";
import {Observaciones} from "../../domain/model/value-objects/Observaciones";
import {Control} from "../../domain/model/entities/Control";


export class MedicalRecordMapper {

    static toDomain(document: any): MedicalRecord {
        // Asegurar que controls sea un array y reconstruir cada Control
        const controls = (document.controls || []).map((control: any) => {
            // Verificar si ya es una instancia de Control
            if (control instanceof Control) {
                return control;
            }
            // Reconstruir desde objeto plano
            return new Control(
                control.id || control._id,
                control.date || control.createdAt,
                new HemoglobinLevel(control.hemoglobinLevel)
            );
        });

        return new MedicalRecord(
            document.id,
            document.createdAt,
            document.updatedAt,
            document.hemoglobinLevel
                ? new HemoglobinLevel(document.hemoglobinLevel)
                : null,
            new Weight(document.weight),
            new Height(document.height),
            document.gender as Gender,
            (document.antecedentes || []).map(
                (antecedente: any) =>
                    new Antecedente(antecedente.type, antecedente.description)
            ),
            new MotivoConsulta(document.motivoConsulta),
            new Observaciones(document.observaciones),
            document.sintomas || [],
            controls, // ✅ Usar los controles reconstruidos
            document.patientId,
            document.nurseId
        );
    }

    static toPersistence(
        medicalRecord: MedicalRecord
    ) {

        const data =
            medicalRecord.toPrimitives();

        return {
            id: data.id,
            patientId:
            data.patientId,
            nurseId:
            data.nurseId,
            createdAt:
            data.createdAt,
            updatedAt:
            data.updatedAt,
            hemoglobinLevel:
            data.hemoglobinLevel,
            weight:
            data.weight,
            height:
            data.height,
            gender:
            data.gender,
            antecedentes:
            data.antecedentes,
            motivoConsulta:
            data.motivoConsulta,
            observaciones:
            data.observaciones,
            sintomas:
            data.sintomas,
            controls:
            data.controls
        };
    }
}