import {Role} from "../enum/Role";

export type CreateStaffUserCommand = Readonly<{
    name: string;
    lastname: string;
    dni: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
}>;