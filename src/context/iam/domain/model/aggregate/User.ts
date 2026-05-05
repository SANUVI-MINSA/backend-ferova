import {UserId} from "../value-objects/UserId";
import {Dni} from "../value-objects/Dni";
import {Email} from "../value-objects/Email";
import {Phone} from "../value-objects/Phone";
import {Password} from "../value-objects/Password";
import {Role} from "../enum/Role";

export class User {

    constructor(
        private id: UserId,
        private name: string,
        private lastname: string,
        private password: Password,
        private role: Role,
        private dni: Dni,
        private email: Email,
        private phone: Phone
    ) {
        this.validateName(name);
        this.validateLastname(lastname);
    }

    private validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error("Name is required");
        }
    }

    private validateLastname(lastname: string): void {
        if (!lastname || lastname.trim().length === 0) {
            throw new Error("Lastname is required");
        }
    }

    public changePassword(newPassword: Password): void {
        this.password = newPassword;
    }

    public getId(): UserId {
        return this.id;
    }

    public getRole(): Role {
        return this.role;
    }

    public getEmail(): Email {
        return this.email;
    }

    public getDni(): Dni {
        return this.dni;
    }

    public getPhone(): Phone {
        return this.phone;
    }

    public toPrimitives() {
        return {
            id: this.id.getValue(),
            name: this.name,
            lastname: this.lastname,
            role: this.role,
            dni: this.dni.getValue(),
            email: this.email.getValue(),
            phone: this.phone.getValue()
        };
    }
}