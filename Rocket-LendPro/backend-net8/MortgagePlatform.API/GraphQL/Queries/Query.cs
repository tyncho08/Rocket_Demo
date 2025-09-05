using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.GraphQL.Types;
using DTOs = MortgagePlatform.API.DTOs;

namespace MortgagePlatform.API.GraphQL.Queries;

// Dashboard DTOs
public record DashboardMetricsDto(
    int TotalApplications,
    int PendingApplications,
    int ApprovedApplications,
    int RejectedApplications,
    decimal ApprovalRate,
    int TotalUsers,
    int NewUsersThisMonth,
    IReadOnlyList<RecentApplicationDto> RecentApplications
);

public record RecentApplicationDto(
    int Id,
    string UserName,
    decimal LoanAmount,
    string Status,
    DateTime CreatedAt
);

public record PreApprovalResultDto(
    bool IsEligible,
    decimal MaxLoanAmount,
    decimal EstimatedRate,
    string Message
);

public record RefinanceAnalysisDto(
    decimal CurrentPayment,
    decimal NewPayment,
    decimal MonthlySavings,
    int BreakEvenMonths,
    decimal TotalSavings,
    bool IsRecommended,
    string Recommendation
);

public record AffordabilityResultDto(
    decimal MaxLoanAmount,
    decimal MaxHomePrice,
    decimal RecommendedPayment,
    decimal DebtToIncomeRatio,
    bool IsAffordable
);

// Enhanced input types for mortgage calculations
public record PreApprovalInput(
    decimal AnnualIncome,
    decimal MonthlyDebts,
    decimal DownPayment,
    int CreditScore,
    string EmploymentStatus
);

public record RefinanceInput(
    decimal CurrentLoanAmount,
    decimal CurrentInterestRate,
    int RemainingYears,
    decimal NewInterestRate,
    int NewLoanTermYears,
    decimal ClosingCosts
);

public record AffordabilityInput(
    decimal AnnualIncome,
    decimal MonthlyDebts,
    decimal DownPayment,
    decimal InterestRate,
    int LoanTermYears
);

public class Query
{
    // Authentication Queries
    [HotChocolate.Authorization.Authorize]
    public async Task<User?> GetMe(
        [Service] IAuthService authService,
        [GlobalState("UserId")] int userId)
    {
        return await authService.GetUserByIdAsync(userId);
    }
    
    // Property Queries - CRITICAL: Middleware order must be exact
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Property> GetProperties(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        PropertySearchInput? search)
    {
        var query = dbContext.Properties.Where(p => p.IsActive);
        
        if (search != null)
        {
            if (!string.IsNullOrEmpty(search.City))
                query = query.Where(p => p.City.ToLower().Contains(search.City.ToLower()));
                
            if (!string.IsNullOrEmpty(search.State))
                query = query.Where(p => p.State == search.State);
                
            if (search.MinPrice.HasValue)
                query = query.Where(p => p.Price >= search.MinPrice.Value);
                
            if (search.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= search.MaxPrice.Value);
                
            if (search.MinBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= search.MinBedrooms.Value);
                
            if (search.MaxBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms <= search.MaxBedrooms.Value);
                
            if (search.MinBathrooms.HasValue)
                query = query.Where(p => p.Bathrooms >= search.MinBathrooms.Value);
                
            if (search.MaxBathrooms.HasValue)
                query = query.Where(p => p.Bathrooms <= search.MaxBathrooms.Value);
                
            if (!string.IsNullOrEmpty(search.PropertyType))
                query = query.Where(p => p.PropertyType == search.PropertyType);
        }
        
        return query;
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<Property?> GetProperty(
        int id,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return await dbContext.Properties.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
    }
    
    [HotChocolate.Authorization.Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Property> GetFavoriteProperties(
        [GlobalState("UserId")] int userId,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return dbContext.FavoriteProperties
            .Where(fp => fp.UserId == userId)
            .Select(fp => fp.Property)
            .Where(p => p.IsActive);
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<DTOs.LocationsDto> GetLocations(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        var states = await dbContext.Properties
            .Where(p => p.IsActive)
            .Select(p => p.State)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();
            
        var cities = await dbContext.Properties
            .Where(p => p.IsActive)
            .Select(p => p.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
            
        return new DTOs.LocationsDto { States = states.ToArray(), Cities = cities.ToArray() };
    }
    
    // Loan Application Queries - CRITICAL: Middleware order
    [HotChocolate.Authorization.Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<LoanApplication> GetMyLoanApplications(
        [GlobalState("UserId")] int userId,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return dbContext.LoanApplications
            .Include(la => la.Documents)
            .Include(la => la.Payments)
            .Where(la => la.UserId == userId);
    }
    
    [HotChocolate.Authorization.Authorize]
    public async Task<LoanApplication?> GetLoanApplication(
        int id,
        [GlobalState("UserId")] int userId,
        [GlobalState("UserRole")] string userRole,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        var loan = await dbContext.LoanApplications
            .Include(la => la.User)
            .Include(la => la.Documents)
            .Include(la => la.Payments)
            .FirstOrDefaultAsync(la => la.Id == id);
        
        // Check authorization - user can only see their own loans unless they're admin
        if (loan != null && userRole != "Admin" && loan.UserId != userId)
            return null;
            
        return loan;
    }
    
    [HotChocolate.Authorization.Authorize(Roles = new[] { "Admin" })]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<LoanApplication> GetAllLoanApplications(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        AdminSearchInput? search)
    {
        var query = dbContext.LoanApplications
            .Include(la => la.User)
            .Include(la => la.Documents)
            .Include(la => la.Payments)
            .AsQueryable();
        
        if (search != null)
        {
            if (!string.IsNullOrEmpty(search.Status))
                query = query.Where(la => la.Status == search.Status);
                
            if (!string.IsNullOrEmpty(search.Search))
            {
                query = query.Where(la => 
                    la.User.FirstName.Contains(search.Search) ||
                    la.User.LastName.Contains(search.Search) ||
                    la.User.Email.Contains(search.Search) ||
                    la.Employer!.Contains(search.Search));
            }
        }
        
        return query;
    }
    
    // Mortgage Calculation Queries
    public DTOs.MortgageCalculationResultDto CalculateMortgage(
        MortgageCalculationInput input,
        [Service] IMortgageService mortgageService)
    {
        var result = mortgageService.CalculateMortgage(new MortgagePlatform.API.DTOs.MortgageCalculationDto
        {
            PropertyPrice = input.PropertyPrice,
            DownPayment = input.DownPayment,
            InterestRate = input.InterestRate,
            LoanTermYears = input.LoanTermYears
        });
        
        return result;
    }
    
    public PreApprovalResultDto CheckPreApproval(PreApprovalInput input)
    {
        // Enhanced pre-approval logic with detailed calculations
        var monthlyIncome = input.AnnualIncome / 12;
        var totalMonthlyDebts = input.MonthlyDebts;
        var debtToIncomeRatio = totalMonthlyDebts / monthlyIncome;
        
        // Basic qualification criteria
        var isEligible = debtToIncomeRatio <= 0.43m && // DTI ratio under 43%
                        input.CreditScore >= 620 && // Minimum credit score
                        input.DownPayment >= 10000m && // At least $10k down
                        input.EmploymentStatus != "Unemployed";
        
        var maxMonthlyPayment = (monthlyIncome * 0.28m) - totalMonthlyDebts; // 28% front-end ratio
        var estimatedRate = input.CreditScore >= 740 ? 6.5m : 
                           input.CreditScore >= 680 ? 7.0m : 7.5m;
        
        // Calculate max loan amount using payment capacity
        var monthlyRate = (double)(estimatedRate / 100 / 12);
        var totalPayments = 30 * 12; // Assume 30-year loan
        var maxLoanAmount = isEligible && maxMonthlyPayment > 0 ? 
            (decimal)((double)maxMonthlyPayment * (Math.Pow(1 + monthlyRate, totalPayments) - 1) / 
            (monthlyRate * Math.Pow(1 + monthlyRate, totalPayments))) : 0;
        
        var message = isEligible 
            ? $"Congratulations! You may qualify for a mortgage up to ${maxLoanAmount:N0}."
            : GetPreApprovalDeclineReason(debtToIncomeRatio, input.CreditScore, input.DownPayment, input.EmploymentStatus);
        
        return new PreApprovalResultDto(
            isEligible,
            Math.Round(Math.Max(0, maxLoanAmount), 2),
            estimatedRate,
            message
        );
    }
    
    private static string GetPreApprovalDeclineReason(decimal dtiRatio, int creditScore, decimal downPayment, string employmentStatus)
    {
        var reasons = new List<string>();
        
        if (dtiRatio > 0.43m)
            reasons.Add($"debt-to-income ratio is {dtiRatio:P} (should be ≤ 43%)");
        if (creditScore < 620)
            reasons.Add($"credit score is {creditScore} (should be ≥ 620)");
        if (downPayment < 10000m)
            reasons.Add("down payment should be at least $10,000");
        if (employmentStatus == "Unemployed")
            reasons.Add("employment verification is required");
        
        return reasons.Count > 0 
            ? $"To improve your chances: {string.Join(", ", reasons)}."
            : "Please speak with a loan officer for detailed assistance.";
    }
    
    // New Refinance Analysis Query
    public RefinanceAnalysisDto AnalyzeRefinance(RefinanceInput input)
    {
        // Current mortgage payment calculation
        var currentMonthlyRate = (double)(input.CurrentInterestRate / 100 / 12);
        var currentRemainingPayments = (double)(input.RemainingYears * 12);
        
        var currentPayment = (decimal)((double)input.CurrentLoanAmount * 
            (currentMonthlyRate * Math.Pow(1 + currentMonthlyRate, currentRemainingPayments)) / 
            (Math.Pow(1 + currentMonthlyRate, currentRemainingPayments) - 1));
        
        // New mortgage payment calculation
        var newMonthlyRate = (double)(input.NewInterestRate / 100 / 12);
        var newTotalPayments = (double)(input.NewLoanTermYears * 12);
        var newPayment = (decimal)((double)input.CurrentLoanAmount * 
            (newMonthlyRate * Math.Pow(1 + newMonthlyRate, newTotalPayments)) / 
            (Math.Pow(1 + newMonthlyRate, newTotalPayments) - 1));
        
        var monthlySavings = currentPayment - newPayment;
        var breakEvenMonths = monthlySavings > 0 ? (int)Math.Ceiling(input.ClosingCosts / monthlySavings) : 0;
        
        // Total savings over remaining term
        var totalSavings = (monthlySavings * (decimal)Math.Min(currentRemainingPayments, newTotalPayments)) - input.ClosingCosts;
        var isRecommended = totalSavings > 0 && breakEvenMonths <= 60; // Break even within 5 years
        
        var recommendation = isRecommended 
            ? $"Refinancing is recommended. You'll save ${monthlySavings:N2}/month and break even in {breakEvenMonths} months."
            : monthlySavings <= 0 
                ? "Refinancing would increase your monthly payment." 
                : $"Break-even period of {breakEvenMonths} months may be too long to justify refinancing.";
        
        return new RefinanceAnalysisDto(
            Math.Round(currentPayment, 2),
            Math.Round(newPayment, 2),
            Math.Round(monthlySavings, 2),
            breakEvenMonths,
            Math.Round(totalSavings, 2),
            isRecommended,
            recommendation
        );
    }
    
    // New Affordability Calculator Query
    public AffordabilityResultDto CalculateAffordability(AffordabilityInput input)
    {
        var monthlyIncome = input.AnnualIncome / 12;
        var maxHousingPayment = monthlyIncome * 0.28m; // 28% housing rule
        var maxTotalPayment = monthlyIncome * 0.36m; // 36% total debt rule
        var availableForMortgage = Math.Min(maxHousingPayment, maxTotalPayment - input.MonthlyDebts);
        
        // Calculate max loan amount based on available payment
        var monthlyRate = (double)(input.InterestRate / 100 / 12);
        var totalPayments = (double)(input.LoanTermYears * 12);
        
        var maxLoanAmount = availableForMortgage > 0 ? 
            (decimal)((double)availableForMortgage * (Math.Pow(1 + monthlyRate, totalPayments) - 1) / 
            (monthlyRate * Math.Pow(1 + monthlyRate, totalPayments))) : 0;
        
        var maxHomePrice = maxLoanAmount + input.DownPayment;
        var debtToIncomeRatio = (input.MonthlyDebts + availableForMortgage) / monthlyIncome;
        var isAffordable = debtToIncomeRatio <= 0.43m && availableForMortgage > 0;
        
        return new AffordabilityResultDto(
            Math.Round(Math.Max(0, maxLoanAmount), 2),
            Math.Round(Math.Max(0, maxHomePrice), 2),
            Math.Round(Math.Max(0, availableForMortgage), 2),
            Math.Round(debtToIncomeRatio * 100, 2),
            isAffordable
        );
    }
    
    // Admin Queries - CRITICAL: Middleware order
    [HotChocolate.Authorization.Authorize(Roles = new[] { "Admin" })]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<User> GetUsers(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        AdminSearchInput? search)
    {
        var query = dbContext.Users
            .Include(u => u.LoanApplications)
            .AsQueryable();
        
        if (search != null && !string.IsNullOrEmpty(search.Search))
        {
            query = query.Where(u => 
                u.FirstName.Contains(search.Search) ||
                u.LastName.Contains(search.Search) ||
                u.Email.Contains(search.Search));
        }
        
        return query;
    }
    
    [HotChocolate.Authorization.Authorize(Roles = new[] { "Admin" })]
    public async Task<DashboardMetricsDto> GetDashboardMetrics(
        [Service] IDbContextFactory<ApplicationDbContext> dbContextFactory)
    {
        using var dbContext = await dbContextFactory.CreateDbContextAsync();
        
        var totalApplications = await dbContext.LoanApplications.CountAsync();
        var pendingApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Pending");
        var approvedApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Approved");
        var rejectedApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Rejected");
        
        var approvalRate = totalApplications > 0 ? (decimal)approvedApplications / totalApplications * 100 : 0;
        
        var totalUsers = await dbContext.Users.CountAsync();
        var utcNow = DateTime.UtcNow;
        var startOfMonth = new DateTime(utcNow.Year, utcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var newUsersThisMonth = await dbContext.Users.CountAsync(u => u.CreatedAt >= startOfMonth);
        
        var recentApplications = await dbContext.LoanApplications
            .Include(la => la.User)
            .OrderByDescending(la => la.CreatedAt)
            .Take(10)
            .Select(la => new RecentApplicationDto(
                la.Id,
                $"{la.User.FirstName} {la.User.LastName}",
                la.LoanAmount,
                la.Status,
                la.CreatedAt
            ))
            .ToListAsync();
        
        return new DashboardMetricsDto(
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            approvalRate,
            totalUsers,
            newUsersThisMonth,
            recentApplications
        );
    }
}