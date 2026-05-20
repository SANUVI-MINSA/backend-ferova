import { Request, Response } from "express";
import {TreatmentFacade} from "./facade/TreatmentFacade";
import {StartTreatmentCommandFromResourceAssembler} from "./assemblers/StartTreatmentCommandFromResourceAssembler";
import {ConfirmDoseCommandFromResourceAssembler} from "./assemblers/ConfirmDoseCommandFromResourceAssembler";
import {
    CompleteTreatmentCommandFromResourceAssembler
} from "./assemblers/CompleteTreatmentCommandFromResourceAssembler";
import {AbandonTreatmentCommandFromResourceAssembler} from "./assemblers/AbandonTreatmentCommandFromResourceAssembler";
import {
    EvaluateMissedDoseCommandFromResourceAssembler
} from "./assemblers/EvaluateMissedDoseCommandFromResourceAssembler";
import {AuthRequest} from "../../../middlewares/auth.middleware";

export class TreatmentController {

    constructor(
        private facade:
        TreatmentFacade
    ) {}

    startTreatment = async (
        req: AuthRequest,
        res: Response
    ) => {
        try {

            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            await this.facade.validateNurseHasPatient(nurseId, req.body.patientId);

            const commandData = {
                ...req.body,
                nurseId: nurseId,
            }

            const command =
                StartTreatmentCommandFromResourceAssembler
                    .toCommand(commandData)

            const result = await this.facade.startTreatment(command)

            res.status(201).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    // TreatmentController.ts
    confirmDose = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId; // o como se llame en tu token

            if (!motherId) {
                return res.status(401).json({ error: "Mother ID no encontrado en token" });
            }

            const command = {
                patientId: req.body.patientId,
                motherId: motherId  // Se toma del token
            };

            const result = await this.facade.confirmDose(command);
            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    completeTreatment = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command = CompleteTreatmentCommandFromResourceAssembler.toCommand(req.body);

            const result =
                await this.facade
                    .completeTreatment(
                        command
                    );

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    abandonTreatment = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command = AbandonTreatmentCommandFromResourceAssembler.toCommand(req.body);

            const result =
                await this.facade
                    .abandonTreatment(
                        command
                    );

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    evaluateMissedDose = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command = EvaluateMissedDoseCommandFromResourceAssembler.toCommand(req.body);

            const result =
                await this.facade
                    .evaluateMissedDose(
                        command
                    );

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getTodayDose = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getTodayDose({
                        patientId:
                        req.params.patientId,
                        motherId:
                        req.query.motherId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getPatientDoseHistory = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getPatientDoseHistory({
                        patientId:
                        req.params.patientId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getPendingPatientsByNurse = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getPendingPatientsByNurse({
                        nurseId:
                        req.params.nurseId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getRiskLevelOverview = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getRiskLevelOverview({
                        nurseId:
                        req.query.nurseId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getTreatmentsByNurse = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getTreatmentsByNurse({
                        nurseId:
                        req.params.nurseId,
                        status:
                        req.query.status
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getTreatmentDetails = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getTreatmentDetails({
                        treatmentId:
                        req.params.treatmentId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getPatientsByRiskLevel = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getPatientsByRiskLevel({
                        riskLevel:
                        req.params.riskLevel,
                        nurseId:
                        req.query.nurseId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getPatientTreatmentDetail = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getPatientTreatmentDetail({
                        patientId:
                        req.params.patientId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getCriticalAlertsByNurse = async (
        req: Request,
        res: Response
    ) => {
        try {

            const result =
                await this.facade
                    .getCriticalAlertsByNurse({
                        nurseId:
                        req.params.nurseId
                    });

            res.status(200).json(
                result
            );

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };
}