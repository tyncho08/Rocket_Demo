using HotChocolate.Types;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Data;

namespace MortgagePlatform.API.GraphQL.Types;

public class LoanDocumentType : ObjectType<Document>
{
    protected override void Configure(IObjectTypeDescriptor<Document> descriptor)
    {
        descriptor.Field(ld => ld.Id);
        descriptor.Field(ld => ld.LoanApplicationId);
        descriptor.Field(ld => ld.DocumentType);
        descriptor.Field(ld => ld.FileName);
        descriptor.Field(ld => ld.FilePath);
        descriptor.Field(ld => ld.FileSize);
        descriptor.Field(ld => ld.UploadedAt);
        
        descriptor.Field(ld => ld.LoanApplication)
            .UseDbContext<ApplicationDbContext>();
            
        // Add computed field for file size in human readable format
        descriptor.Field("fileSizeFormatted")
            .Type<StringType>()
            .Resolve(ctx =>
            {
                var document = ctx.Parent<Document>();
                var size = document.FileSize;
                
                if (size < 1024) return $"{size} B";
                if (size < 1024 * 1024) return $"{size / 1024:F1} KB";
                if (size < 1024 * 1024 * 1024) return $"{size / (1024 * 1024):F1} MB";
                return $"{size / (1024 * 1024 * 1024):F1} GB";
            });
    }
}