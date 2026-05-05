import {RegisterMotherCommand} from "../model/commands/RegisterMotherCommand";
import {CreateStaffUserCommand} from "../model/commands/CreateStaffUserCommand";
import {LoginUserCommand} from "../model/commands/LoginUserCommand";
import {RequestPasswordResetCommand} from "../model/commands/RequestPasswordResetCommand";
import {ResetPasswordCommand} from "../model/commands/ResetPasswordCommand";

export interface UserCommandService {

    registerMother(
        command: RegisterMotherCommand
    ): Promise<void>;

    createStaffUser(
        command: CreateStaffUserCommand
    ): Promise<void>;

    login(
        command: LoginUserCommand
    ): Promise<string>;

    requestPasswordReset(
        command: RequestPasswordResetCommand
    ): Promise<void>;

    resetPassword(
        command: ResetPasswordCommand
    ): Promise<void>;
}