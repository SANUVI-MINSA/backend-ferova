export type RegisterMotherCommand = Readonly<{
    name: string;
    lastname: string;
    dni: string;
    email: string;
    phone: string;
    password: string;
}>;