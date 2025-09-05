using System;

namespace MortgagePlatform.API.DTOs
{
    public class LoanDocumentDto
    {
        public int Id { get; set; }
        public int LoanApplicationId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }
}