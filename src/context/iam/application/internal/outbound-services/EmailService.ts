import nodemailer from "nodemailer";

export class EmailService {

    async sendResetCode(
        email: string,
        code: string
    ): Promise<void> {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Ferova Password Reset",
            text: `Your reset code is: ${code}`
        });
    }
}