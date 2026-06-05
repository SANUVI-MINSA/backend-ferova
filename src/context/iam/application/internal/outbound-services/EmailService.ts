import { Resend } from 'resend';

export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
    }

    async sendResetCode(
        email: string,
        code: string
    ): Promise<void> {
        try {
            const { data, error } = await this.resend.emails.send({
                from: process.env.EMAIL_FROM || "Ferova <onboarding@resend.dev>",
                to: email,
                subject: "Ferova Password Reset",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px;">
                        <h2>Recuperación de Contraseña - Ferova</h2>
                        <p>Haz solicitado restablecer tu contraseña.</p>
                        <p>Tu código de verificación es:</p>
                        <h1 style="color: #4F46E5; font-size: 32px;">${code}</h1>
                        <p>Este código expira en 10 minutos.</p>
                        <hr />
                        <p style="font-size: 12px; color: #666;">Si no solicitaste este cambio, ignora este mensaje.</p>
                    </div>
                `,
                text: `Tu código de recuperación es: ${code}`
            });

            if (error) {
                console.error('Error sending email:', error);
                throw new Error(`Failed to send email: ${error.message}`);
            }

            console.log(`Email sent to ${email}, id: ${data?.id}`);

        } catch (error) {
            console.error('Email service error:', error);
            throw new Error('Could not send reset code email');
        }
    }
}