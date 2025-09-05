using HotChocolate;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.GraphQL.Types;

namespace MortgagePlatform.API.GraphQL.Mutations;

public class Mutation
{
    public async Task<AuthPayload> Login(
        LoginInput input,
        [Service] IAuthService authService)
    {
        try
        {
            var token = await authService.LoginAsync(new LoginDto 
            { 
                Email = input.Email, 
                Password = input.Password 
            });
            
            var user = await authService.GetUserByEmailAsync(input.Email);
            
            return new AuthPayload(token, user, null);
        }
        catch (Exception ex)
        {
            return new AuthPayload(null, null, new[] { new UserError(ex.Message, "AUTH_ERROR") });
        }
    }
    
    public async Task<AuthPayload> Register(
        RegisterInput input,
        [Service] IAuthService authService)
    {
        try
        {
            if (input.Password != input.ConfirmPassword)
                return new AuthPayload(null, null, new[] { new UserError("Passwords do not match", "VALIDATION_ERROR") });
                
            var token = await authService.RegisterAsync(new RegisterDto
            {
                FirstName = input.FirstName,
                LastName = input.LastName,
                Email = input.Email,
                Password = input.Password,
                ConfirmPassword = input.ConfirmPassword
            });
            
            var user = await authService.GetUserByEmailAsync(input.Email);
            
            return new AuthPayload(token, user, null);
        }
        catch (Exception ex)
        {
            return new AuthPayload(null, null, new[] { new UserError(ex.Message, "REGISTRATION_ERROR") });
        }
    }
    
    [HotChocolate.Authorization.Authorize]
    public async Task<PropertyPayload> ToggleFavoriteProperty(
        int propertyId,
        [GlobalState("UserId")] int userId,
        [Service] IPropertyService propertyService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            var isFavorite = await propertyService.ToggleFavoriteAsync(propertyId, userId);
            var property = await dbContext.Properties.FirstOrDefaultAsync(p => p.Id == propertyId);
            
            return new PropertyPayload(property, isFavorite, null);
        }
        catch (Exception ex)
        {
            return new PropertyPayload(null, false, new[] { new UserError(ex.Message, "FAVORITE_ERROR") });
        }
    }
    
    [HotChocolate.Authorization.Authorize]
    public async Task<LoanApplicationPayload> CreateLoanApplication(
        CreateLoanApplicationInput input,
        [GlobalState("UserId")] int userId,
        [Service] ILoanService loanService)
    {
        try
        {
            var loanApp = await loanService.CreateLoanApplicationAsync(new CreateLoanApplicationDto
            {
                LoanAmount = input.LoanAmount,
                PropertyValue = input.PropertyValue,
                DownPayment = input.DownPayment,
                InterestRate = input.InterestRate,
                LoanTermYears = input.LoanTermYears,
                AnnualIncome = input.AnnualIncome,
                EmploymentStatus = input.EmploymentStatus,
                Employer = input.Employer,
                Notes = input.Notes
            }, userId);
            
            // Convert DTO to Model for GraphQL response
            var model = new LoanApplication
            {
                Id = loanApp.Id,
                UserId = loanApp.UserId,
                LoanAmount = loanApp.LoanAmount,
                PropertyValue = loanApp.PropertyValue,
                DownPayment = loanApp.DownPayment,
                InterestRate = loanApp.InterestRate,
                LoanTermYears = loanApp.LoanTermYears,
                AnnualIncome = loanApp.AnnualIncome,
                EmploymentStatus = loanApp.EmploymentStatus,
                Employer = loanApp.Employer,
                Status = loanApp.Status,
                Notes = loanApp.Notes,
                CreatedAt = loanApp.CreatedAt,
                UpdatedAt = loanApp.UpdatedAt
            };
            
            return new LoanApplicationPayload(model, null);
        }
        catch (Exception ex)
        {
            return new LoanApplicationPayload(null, new[] { new UserError(ex.Message, "LOAN_ERROR") });
        }
    }
    
    [HotChocolate.Authorization.Authorize(Roles = new[] { "Admin" })]
    public async Task<LoanApplicationPayload> UpdateLoanApplicationStatus(
        UpdateLoanStatusInput input,
        [Service] ILoanService loanService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            var loanAppDto = await loanService.UpdateLoanApplicationStatusAsync(
                input.LoanApplicationId,
                new UpdateLoanApplicationStatusDto
                {
                    Status = input.Status,
                    Notes = input.Notes
                });
                
            // Get the updated model from database for GraphQL response
            var model = await dbContext.LoanApplications
                .Include(la => la.User)
                .Include(la => la.Documents)
                .Include(la => la.Payments)
                .FirstOrDefaultAsync(la => la.Id == input.LoanApplicationId);
                
            return new LoanApplicationPayload(model, null);
        }
        catch (Exception ex)
        {
            return new LoanApplicationPayload(null, new[] { new UserError(ex.Message, "UPDATE_ERROR") });
        }
    }

    [HotChocolate.Authorization.Authorize(Roles = new[] { "Admin" })]
    public async Task<UserPayload> UpdateUserRole(
        UpdateUserRoleInput input,
        [Service] IAuthService authService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == input.UserId);
            if (user == null)
                return new UserPayload(null, new[] { new UserError("User not found", "USER_NOT_FOUND") });

            user.Role = input.NewRole;
            user.UpdatedAt = DateTime.UtcNow;
            
            await dbContext.SaveChangesAsync();
            
            return new UserPayload(user, null);
        }
        catch (Exception ex)
        {
            return new UserPayload(null, new[] { new UserError(ex.Message, "ROLE_UPDATE_ERROR") });
        }
    }

    [HotChocolate.Authorization.Authorize]
    public async Task<UserPayload> ChangePassword(
        ChangePasswordInput input,
        [GlobalState("UserId")] int userId,
        [Service] IAuthService authService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            if (input.NewPassword != input.ConfirmNewPassword)
                return new UserPayload(null, new[] { new UserError("New passwords do not match", "PASSWORD_MISMATCH") });

            var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return new UserPayload(null, new[] { new UserError("User not found", "USER_NOT_FOUND") });

            // Verify current password
            if (!await authService.VerifyPasswordAsync(user.Email, input.CurrentPassword))
                return new UserPayload(null, new[] { new UserError("Current password is incorrect", "INVALID_PASSWORD") });

            // Update password
            await authService.ChangePasswordAsync(userId, input.NewPassword);
            
            var updatedUser = await dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);
            
            return new UserPayload(updatedUser, null);
        }
        catch (Exception ex)
        {
            return new UserPayload(null, new[] { new UserError(ex.Message, "PASSWORD_CHANGE_ERROR") });
        }
    }

    [HotChocolate.Authorization.Authorize]
    public async Task<DocumentPayload> UploadLoanDocument(
        UploadDocumentInput input,
        [GlobalState("UserId")] int userId,
        [Service] ILoanService loanService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            // Verify user owns the loan application
            var loanApp = await dbContext.LoanApplications.FirstOrDefaultAsync(la => la.Id == input.LoanApplicationId);
            if (loanApp == null)
                return new DocumentPayload(null, new[] { new UserError("Loan application not found", "LOAN_NOT_FOUND") });

            if (loanApp.UserId != userId)
                return new DocumentPayload(null, new[] { new UserError("Unauthorized", "UNAUTHORIZED") });

            var documentDto = await loanService.UploadDocumentAsync(new UploadDocumentDto
            {
                LoanApplicationId = input.LoanApplicationId,
                DocumentType = input.DocumentType,
                FileName = input.FileName,
                FileData = input.FileData,
                FileSize = input.FileSize
            });

            // Convert DTO to Model for GraphQL response
            var document = new Document
            {
                Id = documentDto.Id,
                LoanApplicationId = documentDto.LoanApplicationId,
                DocumentType = documentDto.DocumentType,
                FileName = documentDto.FileName,
                FilePath = documentDto.FilePath,
                FileSize = documentDto.FileSize,
                UploadedAt = documentDto.UploadedAt
            };

            return new DocumentPayload(document, null);
        }
        catch (Exception ex)
        {
            return new DocumentPayload(null, new[] { new UserError(ex.Message, "UPLOAD_ERROR") });
        }
    }

    [HotChocolate.Authorization.Authorize]
    public async Task<BoolPayload> DeleteLoanDocument(
        int documentId,
        [GlobalState("UserId")] int userId,
        [Service] ILoanService loanService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            // Verify user owns the document through loan application
            var document = await dbContext.Documents
                .Include(d => d.LoanApplication)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                return new BoolPayload(false, new[] { new UserError("Document not found", "DOCUMENT_NOT_FOUND") });

            if (document.LoanApplication.UserId != userId)
                return new BoolPayload(false, new[] { new UserError("Unauthorized", "UNAUTHORIZED") });

            var success = await loanService.DeleteDocumentAsync(documentId);
            
            return new BoolPayload(success, success ? null : new[] { new UserError("Failed to delete document", "DELETE_ERROR") });
        }
        catch (Exception ex)
        {
            return new BoolPayload(false, new[] { new UserError(ex.Message, "DELETE_ERROR") });
        }
    }
}

// Payload types
public record AuthPayload(string? Token, User? User, IReadOnlyList<UserError>? Errors);
public record PropertyPayload(Property? Property, bool IsFavorite, IReadOnlyList<UserError>? Errors);
public record LoanApplicationPayload(LoanApplication? LoanApplication, IReadOnlyList<UserError>? Errors);
public record UserPayload(User? User, IReadOnlyList<UserError>? Errors);
public record DocumentPayload(Document? Document, IReadOnlyList<UserError>? Errors);
public record BoolPayload(bool Success, IReadOnlyList<UserError>? Errors);
public record UserError(string Message, string Code);