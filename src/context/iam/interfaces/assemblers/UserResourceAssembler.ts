import {User} from "../../domain/model/aggregate/User";
import {UserResource} from "../resources/UserResource";

export class UserResourceAssembler {

    static toResource(
        user: User
    ): UserResource {

        const data = user.toPrimitives();

        return {
            id: data.id,
            name: data.name,
            lastname: data.lastname,
            role: data.role,
            dni: data.dni,
            email: data.email,
            phone: data.phone
        };
    }
}