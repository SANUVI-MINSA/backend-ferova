import {UserCommandService} from "../../../domain/services/UserCommandService";
import {UserQueryService} from "../../../domain/services/UserQueryService";

export class UserFacade {

    constructor(
        private commandService: UserCommandService,
        private queryService: UserQueryService
    ) {}

    async registerMother(data: any): Promise<void> {
        await this.commandService.registerMother(data);
    }

    async createStaffUser(data: any): Promise<void> {
        await this.commandService.createStaffUser(data);
    }

    async login(data: any): Promise<string> {
        return this.commandService.login(data);
    }

    async getUserById(userId: string) {
        return this.queryService.getUserById({
            userId
        });
    }

    async requestResetCode(
        data: any
    ): Promise<void> {
        await this.commandService.requestResetCode(
            data
        );
    }

    async resetPassword(
        data: any
    ): Promise<void> {
        await this.commandService.resetPassword(
            data
        );
    }

    async getUserByEmail(email: string) {
        return this.queryService.getUserByEmail({ email });
    }

    async verifyResetCode(
        data: any
    ): Promise<void> {
        await this.commandService.verifyResetCode(
            data
        );
    }
}