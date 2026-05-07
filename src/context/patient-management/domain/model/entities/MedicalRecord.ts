import {HemoglobinLevel} from "../value-objects/HemoglobinLevel";
import {Weight} from "../value-objects/Weight";
import {Height} from "../value-objects/Height";
import {Gender} from "../enum/Gender";
import {Control} from "./Control";
import {Antecedente} from "../value-objects/Antecedente";
import {MotivoConsulta} from "../value-objects/MotivoConsulta";
import {Observaciones} from "../value-objects/Observaciones";

export class MedicalRecord {

    constructor(
        private id: string,
        private createdAt: Date,
        private updatedAt: Date,
        private hemoglobinLevel:
        HemoglobinLevel,
        private weight: Weight,
        private height: Height,
        private gender: Gender,
        private antecedentes: Antecedente[],
        private motivoConsulta: MotivoConsulta,
        private observaciones: Observaciones,
        private sintomas: string[] | [],
        private controls: Control[],
        private patientId: string,
        private nurseId: string | null
    ) {}

    addControl(
        control: Control
    ): void {

        this.controls.push(
            control
        );

        this.hemoglobinLevel =
            control
                .getHemoglobinLevel();

        this.updatedAt =
            new Date();
    }

    updateClinicalInformation(
        weight: Weight,
        height: Height,
        motivoConsulta: MotivoConsulta,
        observaciones: Observaciones,
        antecedentes: Antecedente[],
        sintomas: string[]
    ): void {

        this.weight = weight;

        this.height = height;

        this.motivoConsulta =
            motivoConsulta;

        this.observaciones =
            observaciones;

        this.validateDuplicateAntecedentes(
            antecedentes
        );

        this.antecedentes =
            antecedentes;

        this.updatedAt =
            new Date();

        this.sintomas = sintomas;
    }

    toPrimitives() {
        return {
            id: this.id,

            createdAt:
            this.createdAt,

            updatedAt:
            this.updatedAt,

            hemoglobinLevel:
                this.hemoglobinLevel
                    .getValue(),

            weight:
                this.weight
                    .getValue(),

            height:
                this.height
                    .getValue(),

            gender:
            this.gender,

            antecedentes: this.antecedentes.map(
                antecedente =>
                    antecedente.toPrimitives()
            ),

            motivoConsulta:
                this.motivoConsulta.getValue(),

            observaciones:
                this.observaciones.getValue(),

            controls:
                this.controls.map(
                    control =>
                        control
                            .toPrimitives()
                ),

            patientId:
            this.patientId,

            nurseId:
                this.nurseId,

            sintomas:
                this.sintomas
        };
    }

    // Valida que no haya antecedentes duplicados en el registro médico
    private validateDuplicateAntecedentes(
        antecedentes: Antecedente[]
    ): void {

        const types =
            antecedentes.map(
                antecedente =>
                    antecedente.getType()
            );

        const uniqueTypes =
            new Set(types);

        if (
            types.length !==
            uniqueTypes.size
        ) {
            throw new Error(
                "Duplicate antecedents are not allowed"
            );
        }
    }
}