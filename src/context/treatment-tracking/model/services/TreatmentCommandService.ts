import {StartTreatmentCommand} from "../domain/commands/StartTreatmentCommand";
import {ConfirmDoseCommand} from "../domain/commands/ConfirmDoseCommand";
import {CompleteTreatmentCommand} from "../domain/commands/CompleteTreatmentCommand";
import {AbandonTreatmentCommand} from "../domain/commands/AbandonTreatmentCommand";
import {EvaluateMissedDoseCommand} from "../domain/commands/EvaluateMissedDoseCommand";

export interface TreatmentCommandService {

    startTreatment(
        command: StartTreatmentCommand
    ): Promise<any>;

    confirmDose(
        command: ConfirmDoseCommand
    ): Promise<any>;

    completeTreatment(
        command: CompleteTreatmentCommand
    ): Promise<any>;

    abandonTreatment(
        command: AbandonTreatmentCommand
    ): Promise<any>;

    evaluateMissedDose(
        command: EvaluateMissedDoseCommand
    ): Promise<any>;

}