export class PdfReportResponseDto {
    constructor(
        public readonly pdfBase64: string,  // PDF en base64 para enviar al frontend
        public readonly fileName: string
    ) {}
}