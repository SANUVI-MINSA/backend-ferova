export class CanRegisterResponseDto {
    constructor(
        public readonly available: boolean,
        public readonly message: string,
        public readonly details?: string
    ) {}
}