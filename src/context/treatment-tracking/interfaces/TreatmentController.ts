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
        req: AuthRequest,  // Cambiar de Request a AuthRequest
        res: Response
    ) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(401).json({
                    error: "Nurse ID no encontrado en el token"
                });
            }

            const commandData = {
                treatmentId: req.body.treatmentId,
                nurseId: nurseId,
                observation: req.body.observation
            };

            const command = CompleteTreatmentCommandFromResourceAssembler.toCommand(commandData);

            const result = await this.facade.completeTreatment(command);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    abandonTreatment = async (
        req: AuthRequest,  // Cambiar de Request a AuthRequest
        res: Response
    ) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(401).json({
                    error: "Nurse ID no encontrado en el token"
                });
            }

            const commandData = {
                treatmentId: req.body.treatmentId,
                nurseId: nurseId,
                observation: req.body.observation
            };

            const command = AbandonTreatmentCommandFromResourceAssembler.toCommand(commandData);

            const result = await this.facade.abandonTreatment(command);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
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
        req: AuthRequest,
        res: Response
    ) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(401).json({
                    error: "Mother ID not found in token"
                });
            }

            const result = await this.facade.getTodayDose({
                patientId: req.params.patientId,
                motherId: motherId
            });

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    getPatientDoseHistory = async (
        req: AuthRequest,
        res: Response
    ) => {
        try {

            // variable para valida la autenticacion de la madre
            const motherId = req.user?.motherId;

            // validar token de la madre
            if(!motherId) {
                return res.status(400).json({
                    error: "Mother ID not found in token"
                })
            }

            const result =
                await this.facade
                    .getPatientDoseHistory({
                        patientId:
                        req.params.patientId,
                        motherId: motherId
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
        req: AuthRequest,
        res: Response
    ) => {
        try {

            // variable para valida la autenticacion del nurse
            const nurseId = req.user?.nurseId;

            // validar token del nurse
            if(!nurseId) {
                return res.status(400).json({
                    error: "Nurse ID not found in token"
                })
            }


            const result =
                await this.facade
                    .getPendingPatientsByNurse({
                        nurseId: nurseId
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
        req: AuthRequest,
        res: Response
    ) => {
        try {

            const nurseId = req.user?.nurseId;

            if(!nurseId) {
                return res.status(400).json({
                    error: "Nurse ID not found in token"
                })
            }

            const result =
                await this.facade
                    .getRiskLevelOverview({
                        nurseId: nurseId
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
        req: AuthRequest,
        res: Response
    ) => {
        try {

            const nurseId = req.user?.nurseId;

            if(!nurseId) {
                return res.status(400).json({
                    error: "Nurse ID not found in token"
                })
            }

            const result =
                await this.facade
                    .getTreatmentsByNurse({
                        nurseId: nurseId,
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
        req: AuthRequest,
        res: Response
    ) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(401).json({
                    error: "Nurse ID not found in token"
                });
            }

            const treatment = await this.facade.getTreatmentDetails({
                treatmentId: req.params.treatmentId
            });

            await this.facade.validateNurseHasPatient(
                nurseId,
                treatment.patientId  // El tratamiento debe incluir el patientId
            );

            res.status(200).json(treatment);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    getPatientsByRiskLevel = async (
        req: AuthRequest,
        res: Response
    ) => {
        try {

            const nurseId = req.user?.nurseId;

            if(!nurseId) {
                return res.status(400).json({
                    error: "Nurse ID not found in token"
                })
            }


            const result =
                await this.facade
                    .getPatientsByRiskLevel({
                        riskLevel:
                        req.params.riskLevel,
                        nurseId: nurseId
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
        req: AuthRequest,
        res: Response
    ) => {
        try {
            // guardar token del nurse
            const nurseId = req.user?.nurseId;

            // Validar token de nurse
            if (!nurseId) {
                return res.status(401).json({
                    error: "Nurse ID not found in token"
                });
            }

            // Validar que la enfermera tiene acceso a este paciente
            await this.facade.validateNurseHasPatient(
                nurseId,
                req.params.patientId as string
            );

            const result = await this.facade.getPatientTreatmentDetail({
                patientId: req.params.patientId
            });

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    forceOmitDoseForTesting = async (req: Request, res: Response) => {
        try {
            const { dailyDoseId } = req.body;

            if (!dailyDoseId) {
                return res.status(400).json({ error: "dailyDoseId is required" });
            }

            const result = await this.facade.forceOmitDoseForTesting(dailyDoseId);
            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}