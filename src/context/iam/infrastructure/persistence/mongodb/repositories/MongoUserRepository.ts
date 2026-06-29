import {UserRepository} from "../../../../domain/repositories/UserRepository";
import {User} from "../../../../domain/model/aggregate/User";
import {UserMapper} from "../../../mappers/UserMapper";
import {UserModel} from "../models/UserModel";
import {UserId} from "../../../../domain/model/value-objects/UserId";
import {Email} from "../../../../domain/model/value-objects/Email";
import {Dni} from "../../../../domain/model/value-objects/Dni";
import {Phone} from "../../../../domain/model/value-objects/Phone";
import {Role} from "../../../../domain/model/enum/Role";
import {Promise} from "mongoose";


export class MongoUserRepository implements UserRepository {
    async saveResetCode(
        email: Email,
        code: string,
        expiresAt: Date
    ): Promise<void> {

        await UserModel.updateOne(
            {
                email: email.getValue()
            },
            {
                resetCode: code,
                resetCodeExpiresAt: expiresAt
            }
        );
    }

    async validateResetCode(
        email: Email,
        code: string
    ): Promise<boolean> {

        const user = await UserModel.findOne({
            email: email.getValue(),
            resetCode: code
        });

        if (!user) {
            return false;
        }

        if (!user.resetCodeExpiresAt) {
            return false;
        }

        if (
            new Date() > user.resetCodeExpiresAt
        ) {
            return false;
        }

        return true;
    }

    async updatePassword(
        email: Email,
        newPassword: string
    ): Promise<void> {

        await UserModel.updateOne(
            {
                email: email.getValue()
            },
            {
                password: newPassword
            }
        );
    }

    async clearResetCode(
        email: Email
    ): Promise<void> {

        await UserModel.updateOne(
            {
                email: email.getValue()
            },
            {
                resetCode: null,
                resetCodeExpiresAt: null
            }
        );
    }

    async save(user: User): Promise<User> {
        const data = UserMapper.toPersistence(user);

        await UserModel.create(data);

        return user;
    }

    async findById(id: UserId): Promise<User | null> {
        const document = await UserModel.findById(
            id.getValue()
        );

        if (!document) return null;

        return UserMapper.toDomain(document);
    }

    async findByEmail(
        email: Email
    ): Promise<User | null> {
        const document = await UserModel.findOne({
            email: email.getValue()
        });

        if (!document) return null;

        return UserMapper.toDomain(document);
    }

    async findByDni(
        dni: Dni
    ): Promise<User | null> {
        const document = await UserModel.findOne({
            dni: dni.getValue()
        });

        if (!document) return null;

        return UserMapper.toDomain(document);
    }

    async findByPhone(
        phone: Phone
    ): Promise<User | null> {
        const document = await UserModel.findOne({
            phone: phone.getValue()
        });

        if (!document) return null;

        return UserMapper.toDomain(document);
    }

    async findByRole(
        role: Role
    ): Promise<User[]> {
        const documents = await UserModel.find({
            role
        });

        return documents.map(
            UserMapper.toDomain
        );
    }

    async findAll(): Promise<User[]> {
        const documents = await UserModel.find();

        return documents.map(
            UserMapper.toDomain
        );
    }

    async findMotherByDni(
        dni: string
    ): Promise<User | null> {

        const user =
            await UserModel.findOne({
                dni,
                role: "Mother"
            });

        if (!user) {
            return null;
        }

        return UserMapper.toDomain(user);
    }

    async findMothersBySearchTerm(
        searchTerm: string
    ): Promise<User[]> {
        const term = searchTerm.trim();

        // Buscar SOLO por DNI (coincidencia parcial)
        const users = await UserModel.find({
            role: 'Mother',
            dni: { $regex: term, $options: 'i' }
        });

        return users.map(user => UserMapper.toDomain(user));
    }

    async findNurseById(id: string): Promise<User | null> {
        const user =
            await UserModel.findOne({
                _id: id,
                role: "Nurse"
            });

        if (!user) {
            return null;
        }

        return UserMapper.toDomain(user);
    }

    async findMotherById(id: string): Promise<User | null> {
        const user =
            await UserModel.findOne({
                _id: id,
                role: "Mother"
            });

        if (!user) {
            return null;
        }

        return UserMapper.toDomain(user);
    }

    async findAllNurses(): Promise<User[]> {
        const users = await UserModel.find({
            role: "Nurse"
        });

        return users.map(user => UserMapper.toDomain(user));
    }
}