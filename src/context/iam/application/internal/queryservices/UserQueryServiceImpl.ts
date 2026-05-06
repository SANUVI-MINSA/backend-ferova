import {UserQueryService} from "../../../domain/services/UserQueryService";
import {UserRepository} from "../../../domain/repositories/UserRepository";
import {GetUserByIdQuery} from "../../../domain/model/queries/GetUserByIdQuery";
import {User} from "../../../domain/model/aggregate/User";
import {UserId} from "../../../domain/model/value-objects/UserId";
import {GetUserProfileQuery} from "../../../domain/model/queries/GetUserProfileQuery";
import {GetAllStaffUsersQuery} from "../../../domain/model/queries/GetAllStaffUsersQuery";
import {Role} from "../../../domain/model/enum/Role";
import {GetMothersQuery} from "../../../domain/model/queries/GetMothersQuery";
import {GetUserByEmailQuery} from "../../../domain/model/queries/GetUserByEmailQuery";
import {Email} from "../../../domain/model/value-objects/Email";

export class UserQueryServiceImpl
    implements UserQueryService {

    constructor(
        private userRepository: UserRepository
    ) {}

    async getUserById(
        query: GetUserByIdQuery
    ): Promise<User | null> {
        return this.userRepository.findById(
            new UserId(query.userId)
        );
    }

    async getUserProfile(
        query: GetUserProfileQuery
    ): Promise<User | null> {
        return this.userRepository.findById(
            new UserId(query.userId)
        );
    }

    async getAllStaffUsers(
        query: GetAllStaffUsersQuery
    ): Promise<User[]> {

        const nurses =
            await this.userRepository.findByRole(
                Role.NURSE
            );

        const admins =
            await this.userRepository.findByRole(
                Role.ADMIN
            );

        return [...nurses, ...admins];
    }

    async getMothers(
        query: GetMothersQuery
    ): Promise<User[]> {
        return this.userRepository.findByRole(
            Role.MOTHER
        );
    }

    async getUserByEmail(
        query: GetUserByEmailQuery
    ): Promise<User | null> {
        return this.userRepository.findByEmail(
            new Email(query.email)
        );
    }
}