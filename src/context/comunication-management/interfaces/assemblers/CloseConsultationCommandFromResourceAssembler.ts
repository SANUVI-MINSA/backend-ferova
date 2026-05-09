import {CloseConsultationResource} from "../resources/CloseConsultationResource";
import {CloseConsultationCommand} from "../../domain/model/commands/CloseConsultationCommand";

export class CloseConsultationCommandFromResourceAssembler {

    static toCommand(
        resource: CloseConsultationResource
    ): CloseConsultationCommand {

        return {
            consultationId:
            resource.consultationId,

            nurseId:
            resource.nurseId
        };
    }
}