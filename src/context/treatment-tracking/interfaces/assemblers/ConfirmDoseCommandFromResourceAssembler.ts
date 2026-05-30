import {ConfirmDoseResource} from "../resources/ConfirmDoseResource";
import {ConfirmDoseCommand} from "../../model/domain/commands/ConfirmDoseCommand";

export class ConfirmDoseCommandFromResourceAssembler {

    static toCommand(
        resource: ConfirmDoseResource
    ): ConfirmDoseCommand {
        return {
            patientId: resource.patientId,
            motherId: resource.motherId,
        };
    }
}