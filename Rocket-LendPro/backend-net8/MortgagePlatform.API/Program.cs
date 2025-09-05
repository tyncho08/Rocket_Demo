using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.GraphQL;
using MortgagePlatform.API.GraphQL.Queries;
using MortgagePlatform.API.GraphQL.Mutations;
using MortgagePlatform.API.GraphQL.Extensions;
using HotChocolate.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// GraphQL-only configuration - no REST controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Keep for GraphQL schema documentation

// Database with factory pattern for GraphQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddPooledDbContextFactory<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Regular DbContext for non-resolver GraphQL operations
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

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

// CORS for Next.js frontend (GraphQL-only)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:4001")
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

// GraphQL Configuration - Primary API Layer
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<MortgagePlatform.API.GraphQL.Types.PropertyType>()
    .AddType<MortgagePlatform.API.GraphQL.Types.LoanApplicationType>()
    .AddType<MortgagePlatform.API.GraphQL.Types.UserType>()
    .AddType<MortgagePlatform.API.GraphQL.Types.LoanDocumentType>()
    .AddAuthorization()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment())
    .AddHttpRequestInterceptor<GraphQLRequestInterceptor>();

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
    
    // Seed database in development
    await SeedDatabase(app.Services);
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// GraphQL-only endpoints 
app.MapGraphQL(); // GraphQL at /graphql - Primary API endpoint
app.MapHealthChecks("/health");

app.Run();

// Database seeding method
static async Task SeedDatabase(IServiceProvider services)
{
    try
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
        await context.Database.EnsureCreatedAsync();

        // Check if admin user exists
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@mortgageplatform.com");
        if (existingAdmin == null)
        {
            var adminUser = new User
            {
                FirstName = "Admin",
                LastName = "User", 
                Email = "admin@mortgageplatform.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }

        // Check if regular user exists
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "john.doe@email.com");
        if (existingUser == null)
        {
            var regularUser = new User
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@email.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(regularUser);
            await context.SaveChangesAsync();
        }

        // Check if properties exist
        var existingProperties = await context.Properties.AnyAsync();
        if (!existingProperties)
        {
            var properties = new List<Property>
            {
                // Austin Properties
                new Property { Address = "123 Main St", City = "Austin", State = "TX", ZipCode = "78701", Price = 450000.00m, Bedrooms = 3, Bathrooms = 2, SquareFeet = 1800, PropertyType = "Single Family", Description = "Beautiful home in downtown Austin with modern amenities", ImageUrl = "https://images.unsplash.com/photo-1568605114967-8130f3a36994", ListedDate = DateTime.UtcNow.AddDays(-10), IsActive = true },
                new Property { Address = "456 Oak Ave", City = "Austin", State = "TX", ZipCode = "78702", Price = 325000.00m, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1200, PropertyType = "Condo", Description = "Modern condo with city views", ImageUrl = "https://images.unsplash.com/photo-1570129477492-45c003edd2be", ListedDate = DateTime.UtcNow.AddDays(-8), IsActive = true },
                new Property { Address = "987 Cedar Blvd", City = "Austin", State = "TX", ZipCode = "78703", Price = 675000.00m, Bedrooms = 4, Bathrooms = 3, SquareFeet = 2800, PropertyType = "Single Family", Description = "Luxury home with pool and modern finishes", ImageUrl = "https://images.unsplash.com/photo-1613977257363-707ba9348227", ListedDate = DateTime.UtcNow.AddDays(-5), IsActive = true },
                new Property { Address = "741 Ash Dr", City = "Austin", State = "TX", ZipCode = "78704", Price = 550000.00m, Bedrooms = 3, Bathrooms = 3, SquareFeet = 2200, PropertyType = "Single Family", Description = "Updated home with energy-efficient features", ImageUrl = "https://images.unsplash.com/photo-1582407947304-fd86f028f716", ListedDate = DateTime.UtcNow.AddDays(-12), IsActive = true },
                new Property { Address = "852 Congress Ave", City = "Austin", State = "TX", ZipCode = "78701", Price = 485000.00m, Bedrooms = 3, Bathrooms = 2, SquareFeet = 1850, PropertyType = "Condo", Description = "High-rise condo in the heart of downtown Austin", ImageUrl = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", ListedDate = DateTime.UtcNow.AddDays(-15), IsActive = true },
                new Property { Address = "963 South Lamar", City = "Austin", State = "TX", ZipCode = "78704", Price = 395000.00m, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1400, PropertyType = "Townhouse", Description = "Trendy townhouse in South Austin", ImageUrl = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9", ListedDate = DateTime.UtcNow.AddDays(-7), IsActive = true },

                // Houston Properties  
                new Property { Address = "789 Pine St", City = "Houston", State = "TX", ZipCode = "77001", Price = 520000.00m, Bedrooms = 4, Bathrooms = 3, SquareFeet = 2400, PropertyType = "Single Family", Description = "Spacious family home with large yard", ImageUrl = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6", ListedDate = DateTime.UtcNow.AddDays(-6), IsActive = true },
                new Property { Address = "147 Birch Way", City = "Houston", State = "TX", ZipCode = "77002", Price = 425000.00m, Bedrooms = 3, Bathrooms = 2, SquareFeet = 1900, PropertyType = "Single Family", Description = "Charming home near downtown", ImageUrl = "https://images.unsplash.com/photo-1560518883-ce09059eeffa", ListedDate = DateTime.UtcNow.AddDays(-9), IsActive = true },
                new Property { Address = "321 Heights Blvd", City = "Houston", State = "TX", ZipCode = "77008", Price = 465000.00m, Bedrooms = 3, Bathrooms = 2, SquareFeet = 1950, PropertyType = "Single Family", Description = "Historic Heights home with character", ImageUrl = "https://images.unsplash.com/photo-1600585154526-990dced4db0d", ListedDate = DateTime.UtcNow.AddDays(-11), IsActive = true },
                new Property { Address = "654 Memorial Dr", City = "Houston", State = "TX", ZipCode = "77007", Price = 385000.00m, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1500, PropertyType = "Condo", Description = "Upscale condo near Memorial Park", ImageUrl = "https://images.unsplash.com/photo-1600585154084-fb1fee4b5b4c", ListedDate = DateTime.UtcNow.AddDays(-4), IsActive = true },

                // Dallas Properties
                new Property { Address = "321 Elm Dr", City = "Dallas", State = "TX", ZipCode = "75201", Price = 380000.00m, Bedrooms = 3, Bathrooms = 2, SquareFeet = 1600, PropertyType = "Townhouse", Description = "Modern townhouse in great neighborhood", ImageUrl = "https://images.unsplash.com/photo-1605146769289-440113cc3d00", ListedDate = DateTime.UtcNow.AddDays(-13), IsActive = true },
                new Property { Address = "258 Spruce St", City = "Dallas", State = "TX", ZipCode = "75202", Price = 340000.00m, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1300, PropertyType = "Condo", Description = "Contemporary condo with amenities", ImageUrl = "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13", ListedDate = DateTime.UtcNow.AddDays(-14), IsActive = true },
                new Property { Address = "468 Deep Ellum", City = "Dallas", State = "TX", ZipCode = "75226", Price = 395000.00m, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1450, PropertyType = "Loft", Description = "Industrial loft in trendy Deep Ellum", ImageUrl = "https://images.unsplash.com/photo-1600566752355-35792bedcfeb", ListedDate = DateTime.UtcNow.AddDays(-3), IsActive = true },

                // San Antonio Properties
                new Property { Address = "654 Maple Ln", City = "San Antonio", State = "TX", ZipCode = "78201", Price = 295000.00m, Bedrooms = 2, Bathrooms = 1, SquareFeet = 1000, PropertyType = "Condo", Description = "Cozy condo perfect for first-time buyers", ImageUrl = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750", ListedDate = DateTime.UtcNow.AddDays(-16), IsActive = true },
                new Property { Address = "369 Willow Ave", City = "San Antonio", State = "TX", ZipCode = "78202", Price = 275000.00m, Bedrooms = 2, Bathrooms = 1, SquareFeet = 950, PropertyType = "Townhouse", Description = "Affordable townhouse in quiet area", ImageUrl = "https://images.unsplash.com/photo-1572120360610-d971b9d7767c", ListedDate = DateTime.UtcNow.AddDays(-2), IsActive = true },
                new Property { Address = "147 Riverwalk Dr", City = "San Antonio", State = "TX", ZipCode = "78205", Price = 385000.00m, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1350, PropertyType = "Condo", Description = "Downtown condo near the Riverwalk", ImageUrl = "https://images.unsplash.com/photo-1600566752355-35792bedcfec", ListedDate = DateTime.UtcNow.AddDays(-1), IsActive = true }
            };

            context.Properties.AddRange(properties);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        // Log error but don't crash the application
        Log.Error(ex, "Error seeding database");
        Console.WriteLine("Error seeding database: " + ex.Message);
    }
}