import {User} from "../model/aggregate/User";
import {UserId} from "../model/value-objects/UserId";
import {Email} from "../model/value-objects/Email";
import {Dni} from "../model/value-objects/Dni";
import {Phone} from "../model/value-objects/Phone";
import {Role} from "../model/enum/Role";

export interface UserRepository {

    save(user: User): Promise<User>;

    findById(id: UserId): Promise<User | null>;

    findByEmail(email: Email): Promise<User | null>;

    findByDni(dni: Dni): Promise<User | null>;

    findByPhone(phone: Phone): Promise<User | null>;

    findByRole(role: Role): Promise<User[]>;

    findAll(): Promise<User[]>;

    saveResetCode(email: Email, code: string, expiresAt: Date): Promise<void>;

    validateResetCode(email: Email, code: string): Promise<boolean>;

    updatePassword(email: Email, newPassword: string): Promise<void>;

    clearResetCode(email: Email): Promise<void>;

    findMotherByDni(
        dni: string
    ): Promise<User | null>;

    findNurseById(
        id: string
    ): Promise<User | null>;

    findMotherById(
        id: string
    ): Promise<User | null>;
}