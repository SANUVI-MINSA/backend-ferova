import {StartConsultationCommand} from "../model/commands/StartConsultationCommand";
import {AddMessageCommand} from "../model/commands/AddMessageCommand";
import {CloseConsultationCommand} from "../model/commands/CloseConsultationCommand";

export interface CommunicationCommandService {

    startConsultation(
        command: StartConsultationCommand
    ): Promise<any>;

    addMessage(
        command: AddMessageCommand
    ): Promise<any>;

    closeConsultation(
        command: CloseConsultationCommand
    ): Promise<any>;
}