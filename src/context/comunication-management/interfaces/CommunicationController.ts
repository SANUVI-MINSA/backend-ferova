import { Request, Response } from "express";
import { CommunicationFacade } from "./facade/CommunicationFacade";
import {
    StartConsultationCommandFromResourceAssembler
} from "./assemblers/StartConsultationCommandFromResourceAssembler";
import { AddMessageCommandFromResourceAssembler } from "./assemblers/AddMessageCommandFromResourceAssembler";
import {
    CloseConsultationCommandFromResourceAssembler
} from "./assemblers/CloseConsultationCommandFromResourceAssembler";
import { GetPatientsWithNurseAssignmentQueryAssembler } from "./assemblers/GetPatientsWithNurseAssignmentQueryAssembler";
import { GetNurseInfoForConsultationQueryAssembler } from "./assemblers/GetNurseInfoForConsultationQueryAssembler";
import { GetConsultationChatQueryAssembler } from "./assemblers/GetConsultationChatQueryAssembler";
import { GetOpenConsultationsByMotherQueryAssembler } from "./assemblers/GetOpenConsultationsByMotherQueryAssembler";
import { GetOpenConsultationsByNurseQueryAssembler } from "./assemblers/GetOpenConsultationsByNurseQueryAssembler";
import { GetMessagesAfterQueryAssembler } from "./assemblers/GetMessagesAfterQueryAssembler";
import { AuthRequest } from "../../../middlewares/auth.middleware";

export class CommunicationController {

    constructor(
        private facade: CommunicationFacade
    ) {}

    startConsultation = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const { patientId, firstMessageContent } = req.body;

            if (!patientId || !firstMessageContent) {
                return res.status(400).json({ error: "Faltan campos requeridos: patientId, firstMessageContent" });
            }

            const command = StartConsultationCommandFromResourceAssembler
                .toCommand({
                    motherId,
                    patientId,
                    firstMessageContent
                });

            const result = await this.facade.startConsultation(command);

            res.status(201).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    addMessage = async (req: AuthRequest, res: Response) => {
        try {
            const senderId = req.user?.id;
            const senderRole = req.user?.role;

            if (!senderId || !senderRole) {
                return res.status(400).json({ error: "Usuario no autenticado correctamente" });
            }

            const { consultationId, content } = req.body;

            if (!consultationId || !content) {
                return res.status(400).json({ error: "Faltan campos requeridos: consultationId, content" });
            }

            const command = AddMessageCommandFromResourceAssembler
                .toCommand({
                    consultationId,
                    senderId,
                    senderRole: senderRole.toUpperCase(),
                    content
                });

            const result = await this.facade.addMessage(command);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    closeConsultation = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const { consultationId } = req.body;

            if (!consultationId) {
                return res.status(400).json({ error: "Falta campo requerido: consultationId" });
            }

            const command = CloseConsultationCommandFromResourceAssembler
                .toCommand({
                    consultationId,
                    nurseId
                });

            const result = await this.facade.closeConsultation(command);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getPatientsWithNurseAssignment = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const query = GetPatientsWithNurseAssignmentQueryAssembler
                .toQuery(motherId);

            const result = await this.facade.getPatientsWithNurseAssignment(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getNurseInfoForConsultation = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            // ✅ Convertir a string asegurando que no sea array
            const patientId = Array.isArray(req.params.patientId)
                ? req.params.patientId[0]
                : req.params.patientId;

            if (!patientId) {
                return res.status(400).json({ error: "Patient ID es requerido" });
            }

            const query = GetNurseInfoForConsultationQueryAssembler
                .toQuery(patientId);

            const result = await this.facade.getNurseInfoForConsultation(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getConsultationChat = async (req: AuthRequest, res: Response) => {
        try {
            const requesterId = req.user?.id;

            if (!requesterId) {
                return res.status(400).json({ error: "Usuario no autenticado correctamente" });
            }

            // ✅ Convertir a string asegurando que no sea array
            const consultationId = Array.isArray(req.params.consultationId)
                ? req.params.consultationId[0]
                : req.params.consultationId;

            if (!consultationId) {
                return res.status(400).json({ error: "Consultation ID es requerido" });
            }

            const query = GetConsultationChatQueryAssembler
                .toQuery(consultationId, requesterId);

            const result = await this.facade.getConsultationChat(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getOpenConsultationsByMother = async (req: AuthRequest, res: Response) => {
        try {
            const motherId = req.user?.motherId;

            if (!motherId) {
                return res.status(400).json({ error: "Mother ID no encontrado en el token" });
            }

            const query = GetOpenConsultationsByMotherQueryAssembler
                .toQuery(motherId);

            const result = await this.facade.getOpenConsultationsByMother(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getOpenConsultationsByNurse = async (req: AuthRequest, res: Response) => {
        try {
            const nurseId = req.user?.nurseId;

            if (!nurseId) {
                return res.status(400).json({ error: "Nurse ID no encontrado en el token" });
            }

            const searchTerm = req.query.searchTerm as string;

            const query = GetOpenConsultationsByNurseQueryAssembler
                .toQuery(nurseId, searchTerm);

            const result = await this.facade.getOpenConsultationsByNurse(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getMessagesAfter = async (req: AuthRequest, res: Response) => {
        try {
            const requesterId = req.user?.id;

            if (!requesterId) {
                return res.status(400).json({ error: "Usuario no autenticado correctamente" });
            }

            // ✅ Convertir a string asegurando que no sea array
            const consultationId = Array.isArray(req.params.consultationId)
                ? req.params.consultationId[0]
                : req.params.consultationId;

            const afterTimestamp = Number(req.query.afterTimestamp);
            const limit = req.query.limit ? Number(req.query.limit) : undefined;

            if (!consultationId) {
                return res.status(400).json({ error: "Consultation ID es requerido" });
            }

            if (isNaN(afterTimestamp)) {
                return res.status(400).json({ error: "afterTimestamp es requerido y debe ser un número" });
            }

            const query = GetMessagesAfterQueryAssembler
                .toQuery(consultationId, requesterId, afterTimestamp, limit);

            const result = await this.facade.getMessagesAfter(query);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };
}