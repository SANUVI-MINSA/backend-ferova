export type LoginUserCommand = Readonly<{
    dni: string;
    password: string;
}>;