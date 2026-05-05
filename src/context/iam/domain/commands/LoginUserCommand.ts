export type LoginUserCommand = Readonly<{
    email: string;
    password: string;
}>;