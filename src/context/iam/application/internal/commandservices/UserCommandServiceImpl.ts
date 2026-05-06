import {UserCommandService} from "../../../domain/services/UserCommandService";
import {UserRepository} from "../../../domain/repositories/UserRepository";
import {BcryptHashingService} from "../../../infrastructure/security/BcryptHashingService";
import {JwtTokenService} from "../../../infrastructure/security/JwtTokenService";
import {RegisterMotherCommand} from "../../../domain/model/commands/RegisterMotherCommand";
import {Email} from "../../../domain/model/value-objects/Email";
import {User} from "../../../domain/model/aggregate/User";
import {UserId} from "../../../domain/model/value-objects/UserId";
import {randomUUID} from "node:crypto";
import {Password} from "../../../domain/model/value-objects/Password";
import {Role} from "../../../domain/model/enum/Role";
import {Dni} from "../../../domain/model/value-objects/Dni";
import {Phone} from "../../../domain/model/value-objects/Phone";
import {CreateStaffUserCommand} from "../../../domain/model/commands/CreateStaffUserCommand";
import {LoginUserCommand} from "../../../domain/model/commands/LoginUserCommand";
import {RequestResetCodeCommand} from "../../../domain/model/commands/RequestResetCodeCommand ";
import {EmailService} from "../outbound-services/EmailService";
import { ResetPasswordCommand } from "../../../domain/model/commands/ResetPasswordCommand";
import { VerifyResetCodeCommand } from "../../../domain/model/commands/VerifyResetCodeCommand";


export class UserCommandServiceImpl implements UserCommandService {

    constructor(
        private userRepository: UserRepository,
        private bcryptService: BcryptHashingService,
        private jwtService: JwtTokenService,
        private emailService: EmailService
    ) {
    }


    async registerMother(
        command: RegisterMotherCommand
    ): Promise<void> {

        const email = new Email(command.email);

        const existingUser =
            await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword =
            await this.bcryptService.hash(
                command.password
            );

        const user = new User(
            new UserId(randomUUID()),
            command.name,
            command.lastname,
            new Password(hashedPassword),
            Role.MOTHER,
            new Dni(command.dni),
            new Email(command.email),
            new Phone(command.phone)
        );

        await this.userRepository.save(user);
    }

    async createStaffUser(
        command: CreateStaffUserCommand
    ): Promise<void> {

        if (
            command.role !== Role.NURSE &&
            command.role !== Role.ADMIN
        ) {
            throw new Error("Invalid staff role");
        }

        const hashedPassword =
            await this.bcryptService.hash(
                command.password
            );

        const user = new User(
            new UserId(randomUUID()),
            command.name,
            command.lastname,
            new Password(hashedPassword),
            command.role,
            new Dni(command.dni),
            new Email(command.email),
            new Phone(command.phone)
        );

        await this.userRepository.save(user);
    }

    async login(
        command: LoginUserCommand
    ): Promise<string> {

        const user =
            await this.userRepository.findByDni(
                new Dni(command.dni)
            );

        if (!user) {
            throw new Error("User not found");
        }

        const isPasswordValid =
            await this.bcryptService.compare(
                command.password,
                user.getPassword().getValue()
            );

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        const token =
            this.jwtService.generateToken({
                id: user.getId().getValue(),
                email: user.getEmail().getValue(),
                role: user.getRole()
            });

        return token;
    }

    async requestResetCode(
        command: RequestResetCodeCommand
    ): Promise<void> {

        const email = new Email(command.email);

        const user =
            await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("User not found");
        }

        const code = Math.floor(
            1000 + Math.random() * 9000
        ).toString();

        const expiresAt =
            new Date(
                Date.now() + 10 * 60 * 1000
            );

        await this.userRepository.saveResetCode(
            email,
            code,
            expiresAt
        );

        await this.emailService.sendResetCode(
            command.email,
            code
        );
    }

    async resetPassword(
        command: ResetPasswordCommand
    ): Promise<void> {

        const email = new Email(command.email);

        const hashedPassword =
            await this.bcryptService.hash(
                command.newPassword
            );

        await this.userRepository.updatePassword(
            email,
            hashedPassword
        );

        await this.userRepository.clearResetCode(
            email
        );
    }

    async verifyResetCode(command: VerifyResetCodeCommand): Promise<void> {
        const email = new Email(command.email);

        const isValid =
            await this.userRepository.validateResetCode(
                email,
                command.code);

        if(!isValid) {
            throw new Error(
                "Invalid or expired code"
            )
        }
    }
}
