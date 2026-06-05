import nodemailer from "nodemailer";
import dns from "dns";

export class EmailService {

    async sendResetCode(email: string, code: string): Promise<void> {
        console.log(`[EMAIL] 📧 Iniciando envío a: ${email}`);
        console.log(`[EMAIL] 📧 Código: ${code}`);
        console.log(`[EMAIL] 📧 EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Configurado' : '❌ FALTA'}`);
        console.log(`[EMAIL] 📧 EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Configurado' : '❌ FALTA'}`);

        // Verificar conectividad
        const dns = require('dns');
        dns.resolve4('smtp.gmail.com', (err, addresses) => {
            console.log(`[EMAIL] 📡 Resolución IPv4 de smtp.gmail.com:`, addresses);
        });

        dns.resolve6('smtp.gmail.com', (err, addresses) => {
            console.log(`[EMAIL] 📡 Resolución IPv6 de smtp.gmail.com:`, addresses);
        });

        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                },
                family: 4,
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 15000
            } as any);

            console.log(`[EMAIL] 📡 Transporter creado, enviando...`);

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Ferova Password Reset",
                text: `Your reset code is: ${code}`
            });

            console.log(`[EMAIL] ✅ Enviado exitosamente a ${email}`);

        } catch (error) {
            console.log(`[EMAIL] ❌ ERROR DETALLADO:`);
            console.log(`[EMAIL] Mensaje: ${error.message}`);
            console.log(`[EMAIL] Código: ${error.code}`);
            console.log(`[EMAIL] Stack: ${error.stack}`);
            throw error;
        }
    }
}