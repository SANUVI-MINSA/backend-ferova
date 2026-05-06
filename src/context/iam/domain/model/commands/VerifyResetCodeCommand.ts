export type VerifyResetCodeCommand = Readonly<{
    email: string;
    code: string;
}>;