namespace MortgagePlatform.API.DTOs
{
    public class UploadDocumentDto
    {
        public int LoanApplicationId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public byte[] FileData { get; set; } = Array.Empty<byte>();
        public long FileSize { get; set; }
    }
}