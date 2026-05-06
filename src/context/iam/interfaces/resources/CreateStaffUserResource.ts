import {Role} from "../../domain/model/enum/Role";

export type CreateStaffUserResource = {
    name: string;
    lastname: string;
    dni: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
};