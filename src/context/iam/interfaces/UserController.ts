import { Request, Response } from "express";
import {UserFacade} from "./acl/facade/UserFacade";
import {UserResourceAssembler} from "./assemblers/UserResourceAssembler";

export class UserController {

    constructor(
        private userFacade: UserFacade
    ) {}

    registerMother = async (
        req: Request,
        res: Response
    ) => {
        try {
            await this.userFacade.registerMother(
                req.body
            );

            res.status(201).json({
                message: "Mother registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    login = async (
        req: Request,
        res: Response
    ) => {
        try {
            const token =
                await this.userFacade.login(
                    req.body
                );

            res.status(200).json({
                token
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    getUserById = async (
        req: Request,
        res: Response
    ) => {
        try {
            const user =
                await this.userFacade.getUserById(
                    req.params.id as string
                );

            if (!user) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            const response =
                UserResourceAssembler.toResource(
                    user
                );

            res.status(200).json(response);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    createStaffUser = async (
        req: Request,
        res: Response
    ) => {
        try {
            await this.userFacade.createStaffUser(
                req.body
            );

            res.status(201).json({
                message: "Staff user registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    requestResetCode = async (req: Request, res: Response) => {
        console.log(`[CONTROLLER] 📨 Request recibida: POST /password/request-code`);
        console.log(`[CONTROLLER] Body:`, req.body);

        try {
            await this.userFacade.requestResetCode(req.body);
            console.log(`[CONTROLLER] ✅ Éxito`);
            res.status(200).json({ message: "Reset code sent successfully" });
        } catch (error: any) {
            console.log(`[CONTROLLER] ❌ Error:`, error.message);
            res.status(400).json({ error: error.message });
        }
    };

    resetPassword = async (
        req: Request,
        res: Response
    ) => {
        try {
            await this.userFacade.resetPassword(
                req.body
            );

            res.status(200).json({
                message: "Password reset successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    verifyCode = async(
        req: Request,
        res: Response
    )=> {
        try {
            await this.userFacade.verifyResetCode(
                req.body
            );

            res.status(200).json({
                message: "Code verified successfully"
            });
        } catch (error: any) {
            res.status(400).json({
                error: error.message
                }
            )
        }
    }


}