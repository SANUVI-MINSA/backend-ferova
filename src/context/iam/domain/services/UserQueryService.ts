import {GetUserByIdQuery} from "../model/queries/GetUserByIdQuery";
import {GetUserProfileQuery} from "../model/queries/GetUserProfileQuery";
import {GetAllStaffUsersQuery} from "../model/queries/GetAllStaffUsersQuery";
import {GetMothersQuery} from "../model/queries/GetMothersQuery";
import {GetUserByEmailQuery} from "../model/queries/GetUserByEmailQuery";
import {User} from "../model/aggregate/User";

export interface UserQueryService {

    getUserById(
        query: GetUserByIdQuery
    ): Promise<User | null>;

    getUserProfile(
        query: GetUserProfileQuery
    ): Promise<User | null>;

    getAllStaffUsers(
        query: GetAllStaffUsersQuery
    ): Promise<User[]>;

    getMothers(
        query: GetMothersQuery
    ): Promise<User[]>;

    getUserByEmail(
        query: GetUserByEmailQuery
    ): Promise<User | null>;
}