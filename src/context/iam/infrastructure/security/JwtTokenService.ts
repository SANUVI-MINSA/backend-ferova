import jwt from "jsonwebtoken";

export class JwtTokenService {

    generateToken(payload: object): string {
        return jwt.sign(
            payload,
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );
    }

    verifyToken(
        token: string
    ): any {
        return jwt.verify(
            token,
            process.env.JWT_SECRET!
        );
    }
}