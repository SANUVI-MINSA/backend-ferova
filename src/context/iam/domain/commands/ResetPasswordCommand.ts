export type ResetPasswordCommand = Readonly<{
    email: string;
    token: string;
    newPassword: string;
}>;