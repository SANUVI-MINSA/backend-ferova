import nodemailer from "nodemailer";
import dns from "dns";

export class EmailService {

    async sendResetCode(
        email: string,
        code: string
    ): Promise<void> {

        // Forzar resolución DNS a IPv4
        dns.setDefaultResultOrder('ipv4first');

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            family: 4,
            tls: {
                rejectUnauthorized: false,
                minVersion: "TLSv1.2"
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000
        } as any);  // Esto silencia el error de TypeScript

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Ferova Password Reset",
            text: `Your reset code is: ${code}`
        });
    }
}