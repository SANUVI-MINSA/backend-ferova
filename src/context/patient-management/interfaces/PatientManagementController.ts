import { Request, Response } from "express";
import {PatientManagementFacade} from "./facade/PatientManagementFacade";
import {HemoglobinHistoryResourceAssembler} from "./assemblers/HemoglobinHistoryResourceAssembler";
import {EligibleDischargePatientResourceAssembler} from "./assemblers/EligibleDischargePatientResourceAssembler";

export class PatientManagementController {

    constructor(
        private patientFacade:
        PatientManagementFacade
    ) {}

    registerPatient = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this.patientFacade
                .registerPatient(
                    req.body
                );

            res.status(201).json({
                message:
                    "Patient registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    assignPatientToNurse = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this.patientFacade
                .assignPatientToNurse(
                    req.body
                );

            res.status(200).json({
                message:
                    "Patient assigned successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    createMedicalRecord = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this.patientFacade
                .createInitialMedicalRecord(
                    req.body
                );

            res.status(201).json({
                message:
                    "Medical record created successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    registerHemoglobinControl = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this.patientFacade
                .registerHemoglobinControl(
                    req.body
                );

            res.status(200).json({
                message:
                    "Hemoglobin control registered successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    updateMedicalRecord = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this.patientFacade
                .updateMedicalRecord(
                    req.body
                );

            res.status(200).json({
                message:
                    "Medical record updated successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    dischargePatient = async (
        req: Request,
        res: Response
    ) => {
        try {

            await this.patientFacade
                .dischargePatient(
                    req.body
                );

            res.status(200).json({
                message:
                    "Patient discharged successfully"
            });

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    listPatientsByMother = async (
        req: Request,
        res: Response
    ) => {
        try {

            const patients =
                await this.patientFacade
                    .listPatientsByMother({
                        motherId:
                        req.params.motherId as string
                    });

            res.status(200).json(
                patients
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getMedicalRecord = async (
        req: Request,
        res: Response
    ) => {
        try {

            const data =
                await this.patientFacade
                    .getMedicalRecord({
                        patientId:
                        req.params.patientId as string
                    });

            res.status(200).json(
                data
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getHemoglobinHistory = async (
        req: Request,
        res: Response
    ) => {
        try {

            const history =
                await this.patientFacade
                    .getHemoglobinControlsHistory({
                        medicalRecordId:
                        req.params
                            .medicalRecordId as string
                    });

            res.status(200).json(
                HemoglobinHistoryResourceAssembler
                    .toResource(
                        history
                    )
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getEligiblePatientsForDischarge =
        async (
            req: Request,
            res: Response
        ) => {
            try {

                const patients =
                    await this.patientFacade
                        .getPatientsEligibleForDischarge({
                            nurseId:
                            req.params.nurseId as string
                        });

                res.status(200).json(
                    patients.map(
                        patient =>
                            EligibleDischargePatientResourceAssembler
                                .toResource(
                                    patient
                                )
                    )
                );

            } catch (error: any) {
                res.status(400).json({
                    error:
                    error.message
                });
            }
        };

    downloadMedicalRecordPdf = async (
        req: Request,
        res: Response
    ) => {
        try {

            const pdf =
                await this.patientFacade
                    .downloadMedicalRecordPdf({
                        medicalRecordId:
                        req.params
                            .medicalRecordId as string
                    });

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=medical-record.pdf"
            );

            res.send(pdf);

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    downloadHemoglobinReportPdf =
        async (
            req: Request,
            res: Response
        ) => {
            try {

                const pdf =
                    await this.patientFacade
                        .downloadHemoglobinReportPdf({
                            medicalRecordId:
                            req.params
                                .medicalRecordId as string
                        });

                res.setHeader(
                    "Content-Disposition",
                    "attachment; filename=hemoglobin-report.pdf"
                );

                res.send(pdf);

            } catch (error: any) {
                res.status(400).json({
                    error:
                    error.message
                });
            }
        };

    searchMotherByDni = async (
        req: Request,
        res: Response
    ) => {
        try {

            const mother =
                await this.patientFacade
                    .searchMotherByDni({
                        dni: req.params.dni as string
                    });

            res.status(200).json(
                mother
            );

        } catch (error: any) {
            res.status(400).json({
                error:
                error.message
            });
        }
    };

    getPatientsAssignedToNurse =
        async (
            req: Request,
            res: Response
        ) => {
            try {

                const patients =
                    await this.patientFacade
                        .getPatientsAssignedToNurse({
                            nurseId:
                            req.params.nurseId as string
                        });

                res.status(200).json(
                    patients
                );

            } catch (error: any) {
                res.status(400).json({
                    error:
                    error.message
                });
            }
        };


    getHemoglobinEvolutionChart =
        async (
            req: Request,
            res: Response
        ) => {
            try {

                const result =
                    await this.patientFacade
                        .getHemoglobinEvolutionChart({
                            patientId:
                            req.params.patientId as string
                        });

                res.status(200).json(
                    result
                );

            } catch (error: any) {
                res.status(400).json({
                    error:
                    error.message
                });
            }
        };


}