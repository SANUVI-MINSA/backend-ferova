import { Request, Response } from "express";

import {CommunicationFacade} from "./facade/CommunicationFacade";
import {
    StartConsultationCommandFromResourceAssembler
} from "./assemblers/StartConsultationCommandFromResourceAssembler";
import {AddMessageCommandFromResourceAssembler} from "./assemblers/AddMessageCommandFromResourceAssembler";
import {
    CloseConsultationCommandFromResourceAssembler
} from "./assemblers/CloseConsultationCommandFromResourceAssembler";
import {GetPatientsWithNurseAssignmentQueryAssembler} from "./assemblers/GetPatientsWithNurseAssignmentQueryAssembler";
import {GetNurseInfoForConsultationQueryAssembler} from "./assemblers/GetNurseInfoForConsultationQueryAssembler";
import {GetConsultationChatQueryAssembler} from "./assemblers/GetConsultationChatQueryAssembler";
import {GetOpenConsultationsByMotherQueryAssembler} from "./assemblers/GetOpenConsultationsByMotherQueryAssembler";
import {GetOpenConsultationsByNurseQueryAssembler} from "./assemblers/GetOpenConsultationsByNurseQueryAssembler";
import {GetMessagesAfterQueryAssembler} from "./assemblers/GetMessagesAfterQueryAssembler";

export class CommunicationController {

    constructor(
        private facade:
        CommunicationFacade
    ) {}

    startConsultation = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command =
                StartConsultationCommandFromResourceAssembler
                    .toCommand(req.body);

            const result =
                await this.facade
                    .startConsultation(command);

            res.status(201).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    addMessage = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command =
                AddMessageCommandFromResourceAssembler
                    .toCommand(req.body);

            const result =
                await this.facade
                    .addMessage(command);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    closeConsultation = async (
        req: Request,
        res: Response
    ) => {
        try {

            const command =
                CloseConsultationCommandFromResourceAssembler
                    .toCommand(req.body);

            const result =
                await this.facade
                    .closeConsultation(command);

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    getPatientsWithNurseAssignment = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetPatientsWithNurseAssignmentQueryAssembler
                    .toQuery(
                        req.params.motherId as string
                    );

            const result =
                await this.facade
                    .getPatientsWithNurseAssignment(
                        query
                    );

            res.status(200).json(result);

        } catch (error: any) {
            res.status(400).json({
                error: error.message
            });
        }
    };

    getNurseInfoForConsultation = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetNurseInfoForConsultationQueryAssembler
                    .toQuery(
                        req.params.patientId as string
                    );

            const result =
                await this.facade
                    .getNurseInfoForConsultation(
                        query
                    );

            res.status(200).json(result);

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getConsultationChat = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetConsultationChatQueryAssembler
                    .toQuery(
                        req.params.consultationId as string,
                        req.query.requesterId as string
                    );

            const result =
                await this.facade
                    .getConsultationChat(
                        query
                    );

            res.status(200).json(result);

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getOpenConsultationsByMother = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetOpenConsultationsByMotherQueryAssembler
                    .toQuery(
                        req.params.motherId as string
                    );

            const result =
                await this.facade
                    .getOpenConsultationsByMother(
                        query
                    );

            res.status(200).json(result);

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getOpenConsultationsByNurse = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetOpenConsultationsByNurseQueryAssembler
                    .toQuery(
                        req.params.nurseId as string,
                        req.query.searchTerm as string
                    );

            const result =
                await this.facade
                    .getOpenConsultationsByNurse(
                        query
                    );

            res.status(200).json(result);

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };

    getMessagesAfter = async (
        req: Request,
        res: Response
    ) => {
        try {

            const query =
                GetMessagesAfterQueryAssembler
                    .toQuery(
                        req.params.consultationId as string,
                        req.query.requesterId as string,
                        Number(req.query.afterTimestamp),
                        Number(req.query.limit)
                    );

            const result =
                await this.facade
                    .getMessagesAfter(
                        query
                    );

            res.status(200).json(result);

        } catch (error:any) {
            res.status(400).json({
                error:error.message
            });
        }
    };
}