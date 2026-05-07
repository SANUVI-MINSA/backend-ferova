import bcrypt from "bcrypt";

export class BcryptHashingService {

    async hash(
        password: string
    ): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    async compare(
        plain: string,
        hashed: string
    ): Promise<boolean> {
        return bcrypt.compare(
            plain,
            hashed
        );
    }
}