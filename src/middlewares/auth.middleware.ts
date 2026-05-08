import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request de Express
export interface AuthRequest extends Request {
    user?: {
        id: string;
        motherId?: string;
        nurseId?: string;
        role: 'Mother' | 'Nurse' | 'Admin';
        email: string;
    };
}

// Middleware de autenticación
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Auth Header:", authHeader); // ← AGREGAR LOG

        if (!authHeader) {
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const token = authHeader.split(' ')[1];
        console.log("Token extraído:", token); // ← AGREGAR LOG

        if (!token) {
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        console.log("Token decodificado:", decoded); // ← AGREGAR LOG

        (req as AuthRequest).user = {
            id: decoded.id,
            motherId: decoded.motherId,
            nurseId: decoded.nurseId,
            role: decoded.role,
            email: decoded.email
        };

        console.log("req.user asignado:", (req as AuthRequest).user); // ← AGREGAR LOG

        next();
    } catch (error: any) {
        console.log("Error en authenticate:", error.message); // ← AGREGAR LOG
        return res.status(401).json({ error: "Token inválido" });
    }
};

// Middleware para verificar roles
export const requireRole = (roles: ('Mother' | 'Nurse' | 'Admin')[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authReq = req as AuthRequest;

        if (!authReq.user) {
            return res.status(401).json({ error: "No autenticado" });
        }

        if (!roles.includes(authReq.user.role)) {
            return res.status(403).json({
                error: `Acceso denegado. Rol requerido: ${roles.join(' o ')}`
            });
        }

        next();
    };
};

// Middlewares específicos por rol
export const requireMother = requireRole(['Mother']);
export const requireNurse = requireRole(['Nurse']);
export const requireAdmin = requireRole(['Admin']);
