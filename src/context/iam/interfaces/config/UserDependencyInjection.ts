// repository
import {MongoUserRepository} from "../../infrastructure/persistence/mongodb/repositories/MongoUserRepository";
import {BcryptHashingService} from "../../infrastructure/security/BcryptHashingService";
import {JwtTokenService} from "../../infrastructure/security/JwtTokenService";
import {UserCommandServiceImpl} from "../../application/internal/commandservices/UserCommandServiceImpl";
import {UserQueryServiceImpl} from "../../application/internal/queryservices/UserQueryServiceImpl";
import {UserFacade} from "../acl/facade/UserFacade";
import {UserController} from "../UserController";
import {EmailService} from "../../application/internal/outbound-services/EmailService";

const userRepository =
    new MongoUserRepository();


// outbound services
const bcryptService =
    new BcryptHashingService();

const jwtService =
    new JwtTokenService();

const emailService =
    new EmailService();

// application services
const userCommandService =
    new UserCommandServiceImpl(
        userRepository,
        bcryptService,
        jwtService,
        emailService
    );

const userQueryService =
    new UserQueryServiceImpl(
        userRepository
    );


// facade
const userFacade =
    new UserFacade(
        userCommandService,
        userQueryService
    );


// controller
export const userController =
    new UserController(
        userFacade
    );