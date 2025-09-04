# COMPLETE MIGRATION: .NET 8 + GraphQL + Next.js 15 (Production-Ready)

⚠️ **CRITICAL: This is a comprehensive enterprise migration prompt enhanced with real-world fixes**
⚠️ **Execute ALL steps sequentially. DO NOT skip validation steps or assume everything works**

You are performing a complete enterprise platform migration combining three transformations:
1. **Backend**: .NET Core 3.1 → .NET 8 LTS with HotChocolate GraphQL + REST APIs
2. **Frontend**: Angular → Next.js 15 with Apollo Client + Axios hybrid approach  
3. **Architecture**: Monolithic REST → Dual API (GraphQL + REST) with backwards compatibility

**Migration Strategy**: Leverage existing specialized implementations while addressing known integration issues that occur during real-world migrations.

**Sources**: 
- Primary: `/Users/MartinGonella/Desktop/Rocket_Demo/MergedApp-LendPro/` (merged Angular + .NET Core 3.1)
- .NET 8 Migration: `/Users/MartinGonella/Desktop/Rocket_Demo/DotNET-LendPro/` (backend-v8)
- GraphQL Implementation: `/Users/MartinGonella/Desktop/Rocket_Demo/GraphQL-LendPro/` (backend-graphql)
- Next.js Migration: `/Users/MartinGonella/Desktop/Rocket_Demo/NextJS-LendPro/` (frontend)

**Target**: `/Users/MartinGonella/Desktop/Rocket_Demo/Rocket-LendPro/`

## ⚠️ KNOWN ISSUES TO ADDRESS DURING MIGRATION

### Critical Backend Issues:
1. **Ambiguous Authorize Attributes**: Use `[HotChocolate.Authorization.Authorize]` instead of `[Authorize]`
2. **Port Configuration**: Ensure consistent port 5001 across all configs (not 5002/5003)
3. **GraphQL Schema Mismatches**: Frontend queries must exactly match backend field names
4. **DbContext Conflicts**: Use `IDbContextFactory<T>` for GraphQL, regular `DbContext` for REST

### Critical Frontend Issues:
1. **Package Version Incompatibilities**: Some package versions don't exist - use tested versions
2. **Mock Data vs Real API**: Components often use hardcoded mock data instead of API calls
3. **Field Name Mismatches**: `isFavorite` vs `isFavorited`, `listedDate` vs `listingDate`
4. **GraphQL Query Parameter Names**: Backend expects `search:` not `where:` for property queries
5. **Null Data Handling**: Components crash with "Cannot read properties of undefined"

### Integration Issues:
1. **API Client Configuration**: URLs must point to correct ports
2. **Authentication Flow**: JWT tokens must work for both REST and GraphQL
3. **CORS Configuration**: Must allow both frontend ports (3000, 4200)
4. **Image URLs**: Many Unsplash URLs return 404 - need fallback handling

---

## PHASE 1: PROJECT SETUP & INITIAL COPY

### Step 1.1: Create Project Structure
```bash
cd "/Users/MartinGonella/Desktop/Rocket_Demo"
mkdir -p Rocket-LendPro
cd Rocket-LendPro

# Create complete structure
mkdir -p backend-net8
mkdir -p frontend-next
mkdir -p database
mkdir -p tests
mkdir -p ops/scripts
```

### Step 1.2: Copy and Merge Source Files
```bash
# Copy base structure from merged project
cp -r "../MergedApp-LendPro/backend/." "./backend-net8/"
cp -r "../MergedApp-LendPro/database/." "./database/"

# Copy enhanced .NET 8 files from DotNET-LendPro
cp -r "../DotNET-LendPro/backend-v8/MortgagePlatform.API/GlobalUsings.cs" "./backend-net8/MortgagePlatform.API/" 2>/dev/null || true
cp -r "../DotNET-LendPro/backend-v8/MortgagePlatform.API/Program.cs" "./backend-net8/MortgagePlatform.API/" 2>/dev/null || true
cp -r "../DotNET-LendPro/backend-v8/MortgagePlatform.API/MortgagePlatform.API.csproj" "./backend-net8/MortgagePlatform.API/" 2>/dev/null || true

# Copy GraphQL implementation from GraphQL-LendPro
mkdir -p "./backend-net8/MortgagePlatform.API/GraphQL"
cp -r "../GraphQL-LendPro/backend-graphql/MortgagePlatform.API/GraphQL/." "./backend-net8/MortgagePlatform.API/GraphQL/" 2>/dev/null || true

# Copy Next.js frontend from NextJS-LendPro
cp -r "../NextJS-LendPro/frontend/." "./frontend-next/" 2>/dev/null || true

# Copy enhanced run script if available
cp "../DotNET-LendPro/run-app.sh" "./" 2>/dev/null || true
cp "../GraphQL-LendPro/run-app.sh" "./" 2>/dev/null || true
cp "../NextJS-LendPro/start-app.sh" "./run-app.sh" 2>/dev/null || true

# Copy documentation
cp "../MergedApp-LendPro/README.md" "./" 2>/dev/null || true
```

### Step 1.3: Merge Enhanced Configurations
```bash
# Merge enhanced appsettings from different projects if they exist
if [ -f "../GraphQL-LendPro/backend-graphql/MortgagePlatform.API/appsettings.json" ]; then
    # Preserve GraphQL configurations
    echo "Merging GraphQL configurations..."
fi

if [ -f "../DotNET-LendPro/backend-v8/MortgagePlatform.API/appsettings.json" ]; then
    # Preserve .NET 8 specific configurations
    echo "Merging .NET 8 configurations..."
fi

if [ -f "../NextJS-LendPro/frontend/next.config.ts" ]; then
    # Preserve Next.js configurations
    cp "../NextJS-LendPro/frontend/next.config.ts" "./frontend-next/" 2>/dev/null || true
fi

# Copy any enhanced package.json configurations
if [ -f "../NextJS-LendPro/frontend/package.json" ]; then
    cp "../NextJS-LendPro/frontend/package.json" "./frontend-next/" 2>/dev/null || true
fi
```

**CONTINUE IMMEDIATELY** to Phase 2.

---

## PHASE 2: .NET 8 LTS MIGRATION

### Step 2.1: Update All Project Files
Use enhanced configurations from DotNET-LendPro project. For each .csproj in backend-net8/, update:

1. **Framework & Properties**:
```xml
<TargetFramework>net8.0</TargetFramework>
<Nullable>enable</Nullable>
<ImplicitUsings>enable</ImplicitUsings>
```

2. **Package References** (complete set):
```xml
<!-- Core packages -->
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.8" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.8" />
<PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.4" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.8.1" />
<PackageReference Include="Serilog.AspNetCore" Version="8.0.2" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />

<!-- GraphQL packages for Phase 3 -->
<PackageReference Include="HotChocolate.AspNetCore" Version="13.9.12" />
<PackageReference Include="HotChocolate.Data.EntityFramework" Version="13.9.12" />
<PackageReference Include="HotChocolate.AspNetCore.Authorization" Version="13.9.12" />
```

### Step 2.2: Create Modern Program.cs with Fixed Configurations
⚠️ **CRITICAL**: This Program.cs includes fixes for real-world issues encountered during migration:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.GraphQL.Queries;
using MortgagePlatform.API.GraphQL.Mutations;
using MortgagePlatform.API.GraphQL.Types;
using MortgagePlatform.API.GraphQL.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Core services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ⚠️ CRITICAL: Dual DbContext setup to avoid conflicts
// Factory pattern for GraphQL (thread-safe, resolves concurrency issues)
builder.Services.AddPooledDbContextFactory<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Regular DbContext for REST controllers
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "ThisIsASecretKeyForJWTTokenGeneration123456789");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

// ⚠️ CRITICAL: CORS must include all possible frontend ports
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",    // Next.js
                "http://localhost:4200",    // Angular (legacy)
                "http://localhost:4001",    // Alternative ports
                "http://localhost:8080"     // Dev server alternatives
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Business Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IMortgageService, MortgageService>();
builder.Services.AddScoped<ILoanService, LoanService>();

// ⚠️ CRITICAL: GraphQL Configuration with proper type registration
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<PropertyType>()  // ⚠️ CRITICAL: Explicitly register PropertyType
    .AddAuthorization()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment())
    .AddHttpRequestInterceptor<GraphQLRequestInterceptor>();

// ⚠️ CRITICAL: Add health check endpoint for startup validation
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ⚠️ CRITICAL: Middleware order is crucial for GraphQL + REST coexistence
app.UseRouting();
app.UseCors("AllowAll");  // Must be before Auth
app.UseAuthentication();
app.UseAuthorization();

// ⚠️ CRITICAL: Health check for startup validation
app.MapHealthChecks("/health");

// Map both REST and GraphQL endpoints
app.MapControllers(); // REST endpoints remain available
app.MapGraphQL();     // GraphQL at /graphql

// ⚠️ CRITICAL: Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
    
    // Seed admin user if not exists
    if (!context.Users.Any(u => u.Email == "admin@mortgageplatform.com"))
    {
        // Add seeding logic
    }
}

app.Run("http://localhost:5001");  // ⚠️ CRITICAL: Explicit port configuration
```

### Step 2.3: Fix DTOs for Nullable References
Update PropertySearchDto.cs and similar DTOs:

```csharp
public class PropertySearchDto
{
    public string? City { get; set; }
    public string? State { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinBedrooms { get; set; }
    public string? PropertyType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
```

**CONTINUE IMMEDIATELY** to Phase 3.

---

## PHASE 3: GRAPHQL API IMPLEMENTATION

### Step 3.1: Leverage Existing GraphQL Implementation
The GraphQL structure should already be copied from GraphQL-LendPro. Verify the structure exists:
```bash
cd backend-net8/MortgagePlatform.API
# Verify GraphQL structure exists (should be copied from GraphQL-LendPro)
ls -la GraphQL/
ls -la GraphQL/Queries/
ls -la GraphQL/Mutations/
ls -la GraphQL/Types/
ls -la GraphQL/Extensions/

# Create any missing directories
mkdir -p GraphQL/Queries GraphQL/Mutations GraphQL/Types GraphQL/Extensions GraphQL/DataLoaders GraphQL/Subscriptions
```

### Step 3.2: Create Production-Ready GraphQL Types
⚠️ **CRITICAL**: This PropertyType includes fixes for real-world GraphQL issues:

```csharp
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Data;

namespace MortgagePlatform.API.GraphQL.Types;

public class PropertyType : ObjectType<Property>
{
    protected override void Configure(IObjectTypeDescriptor<Property> descriptor)
    {
        // ⚠️ CRITICAL: Explicit field mapping prevents GraphQL schema issues
        descriptor.Field(p => p.Id);
        descriptor.Field(p => p.Address);
        descriptor.Field(p => p.City);
        descriptor.Field(p => p.State);
        descriptor.Field(p => p.ZipCode);
        descriptor.Field(p => p.Price);
        descriptor.Field(p => p.Bedrooms);
        descriptor.Field(p => p.Bathrooms);
        descriptor.Field(p => p.SquareFeet);
        descriptor.Field(p => p.PropertyType);
        descriptor.Field(p => p.Description);
        descriptor.Field(p => p.ImageUrl);
        descriptor.Field(p => p.ListedDate);  // ⚠️ CRITICAL: Use exact property name from model
        descriptor.Field(p => p.IsActive);
        
        // ⚠️ CRITICAL: Custom isFavorite field resolver with proper error handling
        descriptor.Field("isFavorite")
            .Type<NonNullType<BooleanType>>()
            .Resolve(async ctx =>
            {
                // Check if user is authenticated - return false if not
                if (!ctx.ContextData.TryGetValue("UserId", out var userIdObj) || userIdObj is not int userId)
                {
                    return false;
                }
                
                try 
                {
                    // ⚠️ CRITICAL: Use DbContextFactory to avoid concurrency issues
                    var dbContextFactory = ctx.Service<IDbContextFactory<ApplicationDbContext>>();
                    using var dbContext = await dbContextFactory.CreateDbContextAsync();
                    
                    return await dbContext.FavoriteProperties.AnyAsync(fp => 
                        fp.PropertyId == ctx.Parent<Property>().Id && 
                        fp.UserId == userId);
                }
                catch (Exception ex)
                {
                    // ⚠️ CRITICAL: Log error but don't break the query
                    // In production, use proper logging
                    Console.WriteLine($"Error checking favorite status: {ex.Message}");
                    return false;
                }
            });
    }
}
```

### Step 3.3: Create Query Root with Real-World Fixes
⚠️ **CRITICAL**: This Query class includes fixes for common GraphQL parameter issues:

```csharp
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Data;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.GraphQL.Types;

namespace MortgagePlatform.API.GraphQL.Queries;

public class Query
{
    // ⚠️ CRITICAL: Property search with correct parameter name (search, not where)
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Property> GetProperties(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        PropertySearchInput? search = null)  // ⚠️ CRITICAL: Parameter name must be 'search'
    {
        var query = dbContext.Properties.Where(p => p.IsActive);
        
        if (search != null)
        {
            if (!string.IsNullOrEmpty(search.City))
                query = query.Where(p => p.City.Contains(search.City));
            
            if (!string.IsNullOrEmpty(search.State))
                query = query.Where(p => p.State == search.State);
            
            if (search.MinPrice.HasValue)
                query = query.Where(p => p.Price >= search.MinPrice);
            
            if (search.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= search.MaxPrice);
            
            if (search.MinBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= search.MinBedrooms);
            
            if (!string.IsNullOrEmpty(search.PropertyType))
                query = query.Where(p => p.PropertyType == search.PropertyType);
        }
        
        return query.OrderBy(p => p.Id);
    }

    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<Property?> GetProperty(
        int id,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return await dbContext.Properties
            .Where(p => p.IsActive && p.Id == id)
            .FirstOrDefaultAsync();
    }

    // ⚠️ CRITICAL: Use fully qualified attribute to avoid conflicts
    [HotChocolate.Authorization.Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    public IQueryable<Property> GetFavoriteProperties(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        [GlobalState("UserId")] int userId)
    {
        return dbContext.FavoriteProperties
            .Where(fp => fp.UserId == userId)
            .Select(fp => fp.Property)
            .Where(p => p.IsActive);
    }

    [HotChocolate.Authorization.Authorize]  // ⚠️ CRITICAL: Fully qualified to avoid ambiguity
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<User?> GetMe(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        [GlobalState("UserId")] int userId)
    {
        return await dbContext.Users.FindAsync(userId);
    }

    // ⚠️ CRITICAL: Mortgage calculation query with correct field names
    public MortgageCalculationResult CalculateMortgage(MortgageCalculationInput input)
    {
        var principal = input.LoanAmount - input.DownPayment;
        var monthlyRate = input.InterestRate / 100 / 12;
        var totalPayments = input.LoanTermYears * 12;
        
        var monthlyPayment = principal * (monthlyRate * Math.Pow(1 + monthlyRate, totalPayments)) 
                           / (Math.Pow(1 + monthlyRate, totalPayments) - 1);
        
        var schedule = new List<AmortizationScheduleItem>();
        var balance = principal;
        
        for (int i = 1; i <= totalPayments; i++)
        {
            var interestPayment = balance * monthlyRate;
            var principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;
            
            schedule.Add(new AmortizationScheduleItem
            {
                PaymentNumber = i,          // ⚠️ CRITICAL: Match DTO property names
                PaymentAmount = monthlyPayment,
                PrincipalAmount = principalPayment,
                InterestAmount = interestPayment,
                RemainingBalance = Math.Max(0, balance)
            });
        }
        
        return new MortgageCalculationResult
        {
            MonthlyPayment = monthlyPayment,
            TotalInterest = schedule.Sum(s => s.InterestAmount),
            TotalPayment = monthlyPayment * totalPayments,
            AmortizationSchedule = schedule
        };
    }
}

// ⚠️ CRITICAL: Input types that match frontend expectations
public class PropertySearchInput
{
    public string? City { get; set; }
    public string? State { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinBedrooms { get; set; }
    public string? PropertyType { get; set; }
}

public class MortgageCalculationInput
{
    public decimal LoanAmount { get; set; }
    public decimal DownPayment { get; set; }
    public decimal InterestRate { get; set; }
    public int LoanTermYears { get; set; }
}

public class MortgageCalculationResult
{
    public decimal MonthlyPayment { get; set; }
    public decimal TotalInterest { get; set; }
    public decimal TotalPayment { get; set; }
    public List<AmortizationScheduleItem> AmortizationSchedule { get; set; } = new();
}

public class AmortizationScheduleItem
{
    public int PaymentNumber { get; set; }
    public decimal PaymentAmount { get; set; }
    public decimal PrincipalAmount { get; set; }
    public decimal InterestAmount { get; set; }
    public decimal RemainingBalance { get; set; }
}
```

### Step 3.4: Create Mutations
Create GraphQL/Mutations/Mutation.cs:

```csharp
namespace MortgagePlatform.API.GraphQL.Mutations;

public class Mutation
{
    [Authorize]
    public async Task<bool> ToggleFavoriteProperty(
        int propertyId,
        [Service] IDbContextFactory<ApplicationDbContext> dbContextFactory,
        [GlobalState("UserId")] int userId)
    {
        using var dbContext = await dbContextFactory.CreateDbContextAsync();
        
        var existing = await dbContext.FavoriteProperties
            .FirstOrDefaultAsync(fp => fp.PropertyId == propertyId && fp.UserId == userId);
        
        if (existing != null)
        {
            dbContext.FavoriteProperties.Remove(existing);
        }
        else
        {
            dbContext.FavoriteProperties.Add(new FavoriteProperty
            {
                PropertyId = propertyId,
                UserId = userId
            });
        }
        
        await dbContext.SaveChangesAsync();
        return existing == null;
    }

    public async Task<LoginResult> Login(
        string email,
        string password,
        [Service] IAuthService authService)
    {
        var result = await authService.Login(email, password);
        if (result.Success)
        {
            return new LoginResult
            {
                Token = result.Token,
                User = result.User
            };
        }
        
        throw new GraphQLException("Invalid credentials");
    }
}

public class LoginResult
{
    public string Token { get; set; }
    public User User { get; set; }
}
```

### Step 3.5: Create Request Interceptor
Create GraphQL/Extensions/GraphQLRequestInterceptor.cs:

```csharp
using HotChocolate.AspNetCore;
using HotChocolate.Execution;
using System.IdentityModel.Tokens.Jwt;

namespace MortgagePlatform.API.GraphQL.Extensions;

public class GraphQLRequestInterceptor : DefaultHttpRequestInterceptor
{
    public override ValueTask OnCreateAsync(HttpContext context, 
        IRequestExecutor requestExecutor, IQueryRequestBuilder requestBuilder)
    {
        var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
        
        if (authHeader?.StartsWith("Bearer ") == true)
        {
            var token = authHeader.Substring("Bearer ".Length).Trim();
            var tokenHandler = new JwtSecurityTokenHandler();
            
            try 
            {
                var jsonToken = tokenHandler.ReadJwtToken(token);
                var userId = jsonToken.Claims.FirstOrDefault(x => x.Type == "nameid")?.Value;
                var userRole = jsonToken.Claims.FirstOrDefault(x => x.Type == "role")?.Value;
                
                if (int.TryParse(userId, out var id))
                {
                    requestBuilder.SetGlobalState("UserId", id);
                    requestBuilder.SetGlobalState("UserRole", userRole);
                }
            }
            catch 
            {
                // Invalid token - proceed without auth context
            }
        }
        
        return base.OnCreateAsync(context, requestExecutor, requestBuilder);
    }
}
```

**CONTINUE IMMEDIATELY** to Phase 4.

---

## PHASE 4: NEXT.JS 15 FRONTEND

### Step 4.1: Leverage Existing Next.js Implementation
The Next.js project should already be copied from NextJS-LendPro. Verify structure and install dependencies:
```bash
cd ../../frontend-next
# Verify Next.js structure exists
ls -la app/
ls -la components/
ls -la lib/

# If package.json exists, install dependencies
if [ -f package.json ]; then
    npm install
else
    # Create new Next.js project if not copied
    npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
fi
```

### Step 4.2: Install Dependencies with Known Working Versions
⚠️ **CRITICAL**: Use these specific versions to avoid compatibility issues:

```bash
# Remove any problematic existing dependencies
rm -rf node_modules package-lock.json

# Install with exact versions that are known to work
npm install \
  @apollo/client@^3.8.8 \
  graphql@^16.8.1 \
  axios@^1.6.2 \
  react-hook-form@^7.48.2 \
  @hookform/resolvers@^3.3.2 \
  zod@^3.22.4 \
  recharts@^2.8.0 \
  react-chartjs-2@^5.2.0 \
  chart.js@^4.4.0 \
  date-fns@^2.30.0 \
  bcryptjs@^2.4.3 \
  jsonwebtoken@^9.0.2 \
  @radix-ui/react-checkbox@^1.0.4 \
  @radix-ui/react-select@^2.0.0 \
  @radix-ui/react-progress@^1.0.3 \
  clsx@^2.0.0 \
  tailwind-merge@^2.0.0 \
  lucide-react@^0.294.0

# ⚠️ CRITICAL: Also install Next.js auth if not present
npm install next-auth@^4.24.5

echo "✅ Dependencies installed with tested versions"
```

### Step 4.3: Verify Next.js Configuration
Configuration should already exist from NextJS-LendPro. Verify or create next.config.ts:

```typescript
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
}
```

### Step 4.4: Create Production-Ready Apollo Client Configuration
⚠️ **CRITICAL**: This configuration includes fixes for real-world API integration issues:

```typescript
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import axios from 'axios';

// ⚠️ CRITICAL: Ensure correct port configuration
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:5001/graphql';
const REST_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// ⚠️ CRITICAL: Proper authentication link with error handling
const authLink = setContext((_, { headers }) => {
  // Handle both browser and server-side rendering
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// ⚠️ CRITICAL: Error handling link for debugging GraphQL issues
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    // Handle 400 errors specifically
    if ('statusCode' in networkError && networkError.statusCode === 400) {
      console.error('GraphQL 400 error - check query syntax and field names');
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Property: {
        fields: {
          isFavorite: {
            read: false, // Don't cache user-specific fields globally
          },
        },
      },
      Query: {
        fields: {
          properties: {
            keyArgs: ['search'], // ⚠️ CRITICAL: Correct cache key for search
            merge(existing = { edges: [] }, incoming) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network', // ⚠️ CRITICAL: Ensure fresh data
    },
  },
});

// ⚠️ CRITICAL: REST API client with proper configuration
export const apiClient = axios.create({
  baseURL: REST_API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ⚠️ CRITICAL: Request interceptor with error handling
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// ⚠️ CRITICAL: Response interceptor for handling auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication errors
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ⚠️ CRITICAL: Server-side API client for SSR
export const serverApiClient = axios.create({
  baseURL: REST_API_URL,
  timeout: 5000,
});
```

### Step 4.5: Verify Core UI Components
UI Components should already exist in NextJS-LendPro. Verify or create components/ui/button.tsx:

```typescript
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            default: "bg-blue-600 text-white hover:bg-blue-700",
            destructive: "bg-red-500 text-white hover:bg-red-600",
            outline: "border border-gray-300 bg-white hover:bg-gray-100",
            secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
            ghost: "hover:bg-gray-100 hover:text-gray-900",
            link: "text-blue-600 underline-offset-4 hover:underline",
          }[variant],
          {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
          }[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
```

### Step 4.6: Create Mortgage Calculator
Create components/calculators/mortgage-calculator.tsx:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { calculateMonthlyPayment, generateAmortizationSchedule } from '@/lib/mortgage-utils'
import { AmortizationChart } from '@/components/charts/amortization-chart'
import { apiClient } from '@/lib/apollo-client'

export function MortgageCalculator() {
  const [loanAmount, setLoanAmount] = useState('400000')
  const [interestRate, setInterestRate] = useState('6.5')
  const [loanTerm, setLoanTerm] = useState('30')
  const [downPayment, setDownPayment] = useState('80000')
  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [amortizationSchedule, setAmortizationSchedule] = useState([])

  useEffect(() => {
    const principal = parseFloat(loanAmount) - parseFloat(downPayment)
    const rate = parseFloat(interestRate)
    const term = parseInt(loanTerm)
    
    if (principal > 0 && rate > 0 && term > 0) {
      const payment = calculateMonthlyPayment(principal, rate, term)
      setMonthlyPayment(payment)
      
      const schedule = generateAmortizationSchedule(principal, rate, term)
      setAmortizationSchedule(schedule)
    }
  }, [loanAmount, interestRate, loanTerm, downPayment])

  const handleCalculate = async () => {
    try {
      const response = await apiClient.post('/mortgage/calculate', {
        loanAmount: parseFloat(loanAmount),
        interestRate: parseFloat(interestRate),
        loanTerm: parseInt(loanTerm),
        downPayment: parseFloat(downPayment),
      })
      
      // Save calculation to history
      localStorage.setItem('lastCalculation', JSON.stringify(response.data))
    } catch (error) {
      console.error('Error saving calculation:', error)
    }
  }

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Mortgage Calculator</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Home Price</label>
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              prefix="$"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Down Payment</label>
            <Input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              prefix="$"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Interest Rate (%)</label>
            <Input
              type="number"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              suffix="%"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Loan Term (years)</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
            >
              <option value="15">15 years</option>
              <option value="20">20 years</option>
              <option value="25">25 years</option>
              <option value="30">30 years</option>
            </select>
          </div>
          
          <Button onClick={handleCalculate} className="w-full">
            Calculate & Save
          </Button>
        </div>
        
        <div>
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Monthly Payment</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${monthlyPayment.toFixed(2)}
            </p>
          </div>
          
          {amortizationSchedule.length > 0 && (
            <AmortizationChart data={amortizationSchedule} />
          )}
        </div>
      </div>
    </Card>
  )
}
```

### Step 4.7: Create Property Search with Fixed GraphQL Queries
⚠️ **CRITICAL**: This search page includes fixes for common GraphQL integration issues:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'
import { PropertyCard } from '@/components/property/property-card'
import { PropertyFilters } from '@/components/property/property-filters'
import { Button } from '@/components/ui/button'
import { apolloClient } from '@/lib/apollo-client'

// ⚠️ CRITICAL: Correct parameter name and field names
const SEARCH_PROPERTIES_QUERY = gql`
  query SearchProperties($first: Int, $after: String, $search: PropertySearchInput) {
    properties(first: $first, after: $after, search: $search) {
      edges {
        node {
          id
          address
          city
          state
          zipCode
          price
          bedrooms
          bathrooms
          squareFeet
          propertyType
          description
          imageUrl
          listedDate
          isFavorite
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

// ⚠️ CRITICAL: Toggle favorite mutation with proper error handling
const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavoriteProperty($propertyId: Int!) {
    toggleFavoriteProperty(propertyId: $propertyId) {
      property {
        id
        isFavorite
      }
      isFavorite
      errors {
        message
        code
      }
    }
  }
`

export default function PropertySearch() {
  const [filters, setFilters] = useState({})
  
  const { data, loading, error, fetchMore, refetch } = useQuery(SEARCH_PROPERTIES_QUERY, {
    client: apolloClient,
    variables: {
      first: 12,
      search: filters,  // ⚠️ CRITICAL: Use 'search' not 'where'
    },
    errorPolicy: 'all',  // ⚠️ CRITICAL: Show partial data even with errors
  })

  const [toggleFavorite] = useMutation(TOGGLE_FAVORITE_MUTATION, {
    client: apolloClient,
    onError: (error) => {
      console.error('Error toggling favorite:', error);
    },
    // ⚠️ CRITICAL: Optimistic UI update
    optimisticResponse: (vars) => ({
      toggleFavoriteProperty: {
        property: {
          id: vars.propertyId,
          isFavorite: true, // Will be corrected by real response
          __typename: 'Property'
        },
        isFavorite: true,
        errors: [],
        __typename: 'ToggleFavoriteResult'
      }
    }),
    // ⚠️ CRITICAL: Update cache after mutation
    update: (cache, { data: mutationData }) => {
      if (mutationData?.toggleFavoriteProperty?.property) {
        cache.modify({
          id: cache.identify(mutationData.toggleFavoriteProperty.property),
          fields: {
            isFavorite: () => mutationData.toggleFavoriteProperty.isFavorite
          }
        });
      }
    }
  });

  const handleToggleFavorite = async (propertyId: number) => {
    try {
      await toggleFavorite({
        variables: { propertyId }
      });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const loadMore = () => {
    if (data?.properties?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.properties.pageInfo.endCursor,
          first: 12,
          search: filters,
        },
      })
    }
  }

  // ⚠️ CRITICAL: Add debugging information
  useEffect(() => {
    if (error) {
      console.error('Properties query error:', error);
    }
    if (data) {
      console.log('Properties data loaded:', data.properties?.edges?.length, 'properties');
    }
  }, [data, error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Properties</h1>
      
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <PropertyFilters onFiltersChange={setFilters} />
        </div>
        
        <div className="lg:col-span-3">
          {loading && <div className="text-center py-8">Loading properties...</div>}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              Error loading properties: {error.message}
              <button 
                onClick={() => refetch()} 
                className="ml-2 text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          )}
          
          {data?.properties?.edges?.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No properties found. Try adjusting your search criteria.
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.properties?.edges?.map(({ node }) => (
              <PropertyCard 
                key={node.id} 
                property={node} 
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
          
          {data?.properties?.pageInfo?.hasNextPage && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
          
          {/* ⚠️ CRITICAL: Debug information in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded text-sm">
              <strong>Debug Info:</strong><br />
              Total properties: {data?.properties?.edges?.length || 0}<br />
              Has more: {data?.properties?.pageInfo?.hasNextPage ? 'Yes' : 'No'}<br />
              Error: {error ? error.message : 'None'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**CONTINUE IMMEDIATELY** to Phase 5.

---

## PHASE 5: UNIFIED DEPLOYMENT SCRIPTS

### Step 5.1: Create Comprehensive Startup Script
Create run-app.sh at project root:

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Rocket-LendPro Complete Platform Launcher${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to cleanup ports
cleanup_ports() {
    echo -e "${YELLOW}🧹 Cleaning up ports...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:5001 | xargs kill -9 2>/dev/null || true
    pkill -f "dotnet.*5001" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    echo -e "${GREEN}✅ Ports cleaned${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check .NET 8
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET SDK not found${NC}"
        exit 1
    fi
    
    DOTNET_VERSION=$(dotnet --version | cut -d. -f1)
    if [ "$DOTNET_VERSION" -lt 8 ]; then
        echo -e "${RED}❌ .NET 8+ required${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ .NET SDK $(dotnet --version)${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js 18+ required${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${YELLOW}🔧 Starting .NET 8 backend with REST + GraphQL...${NC}"
    cd backend-net8/MortgagePlatform.API
    
    dotnet restore > /dev/null 2>&1
    
    if dotnet build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend build successful${NC}"
        
        export ASPNETCORE_ENVIRONMENT=Development
        export ASPNETCORE_URLS=http://localhost:5001
        nohup dotnet run > ../../backend.log 2>&1 &
        echo $! > ../../.backend.pid
        
        echo -e "${GREEN}📡 REST API: http://localhost:5001/api${NC}"
        echo -e "${GREEN}🔗 GraphQL: http://localhost:5001/graphql${NC}"
        echo -e "${GREEN}📚 Swagger: http://localhost:5001/swagger${NC}"
    else
        echo -e "${RED}❌ Backend build failed${NC}"
        exit 1
    fi
    
    cd ../..
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}🎨 Starting Next.js frontend...${NC}"
    cd frontend-next
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install --cache /tmp/.npm > ../frontend-install.log 2>&1
    fi
    
    nohup npm run dev > ../frontend.log 2>&1 &
    echo $! > ../.frontend.pid
    
    cd ..
}

# Function to wait for services
wait_for_services() {
    echo -e "${YELLOW}⏳ Waiting for services...${NC}"
    
    # Wait for backend
    for i in {1..30}; do
        if curl -s http://localhost:5001/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend ready${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start${NC}"
            exit 1
        fi
        sleep 2
    done
    
    # Wait for frontend
    for i in {1..45}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend ready${NC}"
            break
        fi
        if [ $i -eq 45 ]; then
            echo -e "${RED}❌ Frontend failed to start${NC}"
            exit 1
        fi
        sleep 2
    done
}

# Cleanup function
cleanup_and_exit() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    if [ -f ".backend.pid" ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    if [ -f ".frontend.pid" ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
    cleanup_ports
    exit 0
}

trap cleanup_and_exit INT

# Main execution
check_prerequisites
cleanup_ports
start_backend
start_frontend
wait_for_services

echo -e "${BLUE}🎉 Rocket-LendPro Platform Ready!${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""
echo -e "${GREEN}🎨 Frontend (Next.js):${NC} http://localhost:3000"
echo -e "${GREEN}📡 REST API:${NC} http://localhost:5001/api"
echo -e "${GREEN}🔗 GraphQL Playground:${NC} http://localhost:5001/graphql"
echo -e "${GREEN}📚 Swagger Docs:${NC} http://localhost:5001/swagger"
echo ""
echo -e "${BLUE}📊 Technologies:${NC}"
echo -e "• Backend: .NET 8 LTS with HotChocolate GraphQL"
echo -e "• Frontend: Next.js 15 with Apollo Client"
echo -e "• Database: PostgreSQL with EF Core 8"
echo ""
echo -e "${BLUE}🔑 Test Accounts:${NC}"
echo -e "• User: ${YELLOW}john.doe@email.com${NC} / ${YELLOW}user123${NC}"
echo -e "• Admin: ${YELLOW}admin@mortgageplatform.com${NC} / ${YELLOW}admin123${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

wait
```

### Step 5.2: Make Scripts Executable
```bash
chmod +x run-app.sh
```

**CONTINUE IMMEDIATELY** to Phase 6.

---

## PHASE 6: FINAL VALIDATION & DOCUMENTATION

### Step 6.1: Create Project README
```markdown
# Rocket-LendPro: Modern Mortgage Platform

Complete enterprise mortgage lending platform featuring:
- **.NET 8 LTS Backend** with REST + GraphQL APIs
- **Next.js 15 Frontend** with Apollo Client
- **PostgreSQL Database** with Entity Framework Core 8

## Quick Start

```bash
./run-app.sh
```

This single command starts the entire platform with:
- REST API at http://localhost:5001/api
- GraphQL API at http://localhost:5001/graphql
- Next.js Frontend at http://localhost:3000

## Architecture

### Backend (.NET 8 LTS)
- Dual API support: REST controllers + GraphQL resolvers
- JWT authentication working with both APIs
- Entity Framework Core 8 with PostgreSQL
- HotChocolate 13.x for GraphQL implementation
- Comprehensive business logic for mortgage calculations

### Frontend (Next.js 15)
- Apollo Client for GraphQL queries/mutations
- Axios for REST API calls (calculators, forms)
- Complex mortgage calculators with real-time updates
- Multi-step loan application wizard
- Advanced property search with filtering
- Responsive design with Tailwind CSS

## Key Features

1. **Mortgage Calculators**
   - Standard mortgage calculator with amortization
   - Refinance calculator with break-even analysis
   - Extra payment impact calculator
   - Rent vs buy comparison tool

2. **Property Management**
   - Advanced search with GraphQL pagination
   - Favorite properties with real-time updates
   - Property comparison tools

3. **Loan Processing**
   - 6-step application wizard
   - Document upload system
   - Application status tracking

4. **Market Analytics**
   - Real-time market trends
   - Interactive data visualizations
   - Regional comparisons

## API Architecture

### GraphQL Queries
- `properties`: Paginated property search
- `property(id)`: Single property details
- `currentUser`: Authenticated user data
- `marketTrends`: Market analytics data

### GraphQL Mutations
- `toggleFavoriteProperty`: Add/remove favorites
- `login`: Authentication with JWT
- `submitLoanApplication`: Multi-step form submission

### REST Endpoints (Preserved)
- `/api/mortgage/calculate`: Complex calculations
- `/api/loans/applications`: Loan management
- `/api/admin/*`: Admin operations

## Development

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- PostgreSQL (optional, uses in-memory for dev)

### Environment Variables
Create `.env.local` in frontend-next/:
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:5001/graphql
```

## Deployment

Both frontend and backend are containerization-ready with proper health checks and environment configuration support.
```

### Step 6.2: Verify Final Structure
```bash
# Final structure should be:
Rocket-LendPro/
├── backend-net8/          # .NET 8 with REST + GraphQL
├── frontend-next/         # Next.js 15 with Apollo
├── database/              # PostgreSQL scripts
├── tests/                 # Integration tests
├── ops/scripts/           # Deployment scripts
├── run-app.sh             # Main startup script
└── README.md              # Documentation
```

---

## ⚠️ CRITICAL SUCCESS VALIDATION WITH REAL-WORLD FIXES

**Before marking migration complete, verify each item and fix any issues:**

### Backend (.NET 8 + GraphQL) ✅
- [ ] Target framework updated to net8.0 in ALL .csproj files
- [ ] All NuGet packages updated with exact working versions
- [ ] Program.cs uses minimal API with explicit port configuration (5001)
- [ ] GraphQL endpoint responds at http://localhost:5001/graphql
- [ ] REST endpoints remain functional at http://localhost:5001/api
- [ ] JWT authentication works for BOTH REST and GraphQL
- [ ] CORS includes ALL frontend ports (3000, 4200, 8080)
- [ ] Health check endpoint works at /health
- [ ] No ambiguous `[Authorize]` attributes (use HotChocolate.Authorization.Authorize)
- [ ] PropertyType explicitly registered in GraphQL configuration
- [ ] Database seeding works correctly

### Frontend (Next.js 15) ✅  
- [ ] Apollo Client configured with error handling
- [ ] REST client (Axios) configured for calculations
- [ ] All components use REAL API calls (not mock data)
- [ ] GraphQL queries use correct field names (search vs where, isFavorite vs isFavorited)
- [ ] Property detail pages fetch from API (not hardcoded data)
- [ ] Favorite functionality calls backend and updates UI
- [ ] Dashboard shows real favorite properties (not mock data)
- [ ] AmortizationChart handles null/undefined data gracefully
- [ ] Package.json uses tested, compatible versions
- [ ] Images have fallback handling for 404 errors

### Critical Data Flow Fixes ✅
- [ ] Property search parameter is `search:` not `where:`
- [ ] Amortization fields match backend: paymentNumber, paymentAmount, principalAmount, interestAmount, remainingBalance
- [ ] All GraphQL queries include exact field names from backend schema
- [ ] No components rely on hardcoded mock arrays
- [ ] API clients point to correct ports (5001, not 5002/5003)
- [ ] Authentication tokens work for both GraphQL and REST

### Integration & Runtime ✅
- [ ] Frontend connects to both REST and GraphQL successfully
- [ ] No "Cannot read properties of undefined" errors
- [ ] No GraphQL 400 errors in backend logs
- [ ] Favorite toggle works end-to-end
- [ ] Property detail pages load real data
- [ ] Dashboard shows actual user favorites count
- [ ] No package version compatibility errors
- [ ] All API calls succeed (no CORS issues)

### Deployment & Startup ✅
- [ ] run-app.sh starts both services without errors
- [ ] Backend health check passes before frontend starts
- [ ] Services accessible at correct URLs
- [ ] No console errors or warnings in browser
- [ ] GraphQL playground accessible
- [ ] Swagger docs accessible
- [ ] Performance meets requirements
- [ ] All test accounts work for login

## ⚠️ COMMON ISSUES TO CHECK FOR:

1. **GraphQL 400 Errors**: Check field names match exactly between frontend queries and backend schema
2. **Property Not Found**: Ensure components use API calls, not hardcoded data
3. **Favorites Not Syncing**: Verify favorite mutations call backend and update cache
4. **Package Install Failures**: Use specific tested versions, not latest
5. **Port Conflicts**: Ensure consistent port 5001 in all configs
6. **Auth Failures**: Check JWT token handling in both GraphQL and REST
7. **Null Reference Errors**: Add null checks in all components expecting data
8. **CORS Issues**: Include all possible frontend ports in backend CORS config

**MIGRATION COMPLETE** - The Rocket-LendPro platform now features a modern .NET 8 backend with dual REST/GraphQL APIs and a Next.js 15 frontend, combining implementations from:
- DotNET-LendPro (.NET 8 migration)  
- GraphQL-LendPro (GraphQL implementation)
- NextJS-LendPro (Next.js frontend)
- MergedApp-LendPro (base application)

This unified approach creates a single, cohesive enterprise application leveraging the best features from all migration projects.