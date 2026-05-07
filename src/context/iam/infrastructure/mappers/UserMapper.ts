import { User } from "../../domain/model/aggregate/User";
import { UserId } from "../../domain/model/value-objects/UserId";
import { Password } from "../../domain/model/value-objects/Password";
import { Dni } from "../../domain/model/value-objects/Dni";
import { Email } from "../../domain/model/value-objects/Email";
import { Phone } from "../../domain/model/value-objects/Phone";

export class UserMapper {

    static toDomain(document: any): User {
        return new User(
            new UserId(document._id.toString()),
            document.name,
            document.lastname,
            new Password(document.password),
            document.role,
            new Dni(document.dni),
            new Email(document.email),
            Phone.fromPersistence(document.phone)
        );
    }

    static toPersistence(user: User) {
        const data = user.toPrimitives();

        return {
            name: data.name,
            lastname: data.lastname,
            password: data.password.getValue(),
            role: data.role,
            dni: data.dni,
            email: data.email,
            phone: data.phone
        };
    }
}