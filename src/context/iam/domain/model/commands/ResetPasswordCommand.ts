export type ResetPasswordCommand = Readonly<{
    email: string;
    code: string;
    newPassword: string;
}>;