# COMPLETE MIGRATION: .NET 8 + GraphQL + Next.js 15 (One-Shot Execution)

**EXECUTE ALL STEPS SEQUENTIALLY WITHOUT STOPPING. DO NOT PAUSE FOR CONFIRMATION.**

You are tasked with performing a complete enterprise platform migration that combines three transformations:
1. Backend: .NET Core 3.1 → .NET 8 LTS with GraphQL API alongside REST
2. Frontend: Angular → Next.js 15 with Apollo Client
3. Architecture: Monolithic REST → Modern GraphQL with backwards compatibility

**Source**: `/Users/MartinGonella/Desktop/Rocket_Demo/MergedApp-LendPro/`
**Target**: `/Users/MartinGonella/Desktop/Rocket_Demo/Rocket-LendPro/`

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

### Step 1.2: Copy Source Files
```bash
# Copy backend for migration
cp -r "../MergedApp-LendPro/backend/." "./backend-net8/"

# Copy database assets
cp -r "../MergedApp-LendPro/database/." "./database/"

# Copy root files if they exist
cp "../MergedApp-LendPro/README.md" "./" 2>/dev/null || true
```

**CONTINUE IMMEDIATELY** to Phase 2.

---

## PHASE 2: .NET 8 LTS MIGRATION

### Step 2.1: Update All Project Files
For each .csproj in backend-net8/, update:

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

### Step 2.2: Create Modern Program.cs
Replace Startup.cs pattern with minimal API Program.cs:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.GraphQL;
using HotChocolate.AspNetCore;

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

// Database with factory pattern for GraphQL
builder.Services.AddPooledDbContextFactory<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Also add regular DbContext for REST controllers
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

// CORS for both Angular and Next.js
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200", "http://localhost:4001")
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

// GraphQL Configuration (prepare for Phase 3)
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddAuthorization()
    .AddProjections()
    .AddFiltering()
    .AddSorting()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment())
    .AddHttpRequestInterceptor<GraphQLRequestInterceptor>();

var app = builder.Build();

// Middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Map both REST and GraphQL endpoints
app.MapControllers(); // REST endpoints remain available
app.MapGraphQL(); // GraphQL at /graphql

app.Run();
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

### Step 3.1: Create GraphQL Structure
```bash
cd backend-net8/MortgagePlatform.API
mkdir -p GraphQL/Queries
mkdir -p GraphQL/Mutations
mkdir -p GraphQL/Types
mkdir -p GraphQL/Extensions
```

### Step 3.2: Create GraphQL Types
Create GraphQL/Types/PropertyType.cs:

```csharp
using HotChocolate;
using HotChocolate.Types;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.GraphQL.Types;

public class PropertyType : ObjectType<Property>
{
    protected override void Configure(IObjectTypeDescriptor<Property> descriptor)
    {
        descriptor.Field(p => p.Id);
        descriptor.Field(p => p.Address);
        descriptor.Field(p => p.City);
        descriptor.Field(p => p.State);
        descriptor.Field(p => p.Price);
        descriptor.Field(p => p.Bedrooms);
        
        descriptor.Field("isFavorite")
            .Type<NonNullType<BooleanType>>()
            .Resolve(async ctx =>
            {
                if (!ctx.ContextData.TryGetValue("UserId", out var userIdObj) || 
                    userIdObj is not int userId)
                {
                    return false;
                }
                
                var dbContextFactory = ctx.Service<IDbContextFactory<ApplicationDbContext>>();
                using var dbContext = await dbContextFactory.CreateDbContextAsync();
                
                return await dbContext.FavoriteProperties.AnyAsync(fp => 
                    fp.PropertyId == ctx.Parent<Property>().Id && 
                    fp.UserId == userId);
            });
    }
}
```

### Step 3.3: Create Query Root
Create GraphQL/Queries/Query.cs:

```csharp
using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Data;
using Microsoft.EntityFrameworkCore;

namespace MortgagePlatform.API.GraphQL.Queries;

public class Query
{
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Property> GetProperties(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return dbContext.Properties.Where(p => p.IsActive);
    }

    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<Property?> GetProperty(
        int id,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return await dbContext.Properties.FindAsync(id);
    }

    [Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<User?> GetCurrentUser(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
        [GlobalState("UserId")] int userId)
    {
        return await dbContext.Users.FindAsync(userId);
    }
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

### Step 4.1: Initialize Next.js Project
```bash
cd ../../frontend-next
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

### Step 4.2: Install Dependencies
```bash
npm install @apollo/client graphql axios react-hook-form @hookform/resolvers zod \
  recharts chart.js react-chartjs-2 date-fns bcryptjs jsonwebtoken \
  @radix-ui/react-checkbox @radix-ui/react-select @radix-ui/react-progress \
  clsx tailwind-merge lucide-react
```

### Step 4.3: Configure Next.js for Images
Create next.config.ts:

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

### Step 4.4: Create Apollo Client Configuration
Create lib/apollo-client.ts:

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:5001/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Property: {
        fields: {
          isFavorite: {
            read: false, // Don't cache user-specific fields globally
          },
        },
      },
    },
  }),
  defaultOptions: {
    query: {
      errorPolicy: 'all',
    },
  },
});

// REST API client for non-GraphQL endpoints
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Step 4.5: Create Core UI Components
Create components/ui/button.tsx:

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

### Step 4.7: Create Property Search with GraphQL
Create app/search/page.tsx:

```typescript
'use client'

import { useState } from 'react'
import { useQuery, gql } from '@apollo/client'
import { PropertyCard } from '@/components/property/property-card'
import { PropertyFilters } from '@/components/property/property-filters'
import { apolloClient } from '@/lib/apollo-client'

const SEARCH_PROPERTIES_QUERY = gql`
  query SearchProperties($first: Int, $after: String, $where: PropertyFilterInput) {
    properties(first: $first, after: $after, where: $where) {
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
          imageUrl
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

export default function PropertySearch() {
  const [filters, setFilters] = useState({})
  
  const { data, loading, error, fetchMore } = useQuery(SEARCH_PROPERTIES_QUERY, {
    client: apolloClient,
    variables: {
      first: 12,
      where: filters,
    },
  })

  const loadMore = () => {
    if (data?.properties?.pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          after: data.properties.pageInfo.endCursor,
        },
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Properties</h1>
      
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <PropertyFilters onFiltersChange={setFilters} />
        </div>
        
        <div className="lg:col-span-3">
          {loading && <div>Loading properties...</div>}
          {error && <div>Error loading properties</div>}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.properties?.edges?.map(({ node }) => (
              <PropertyCard key={node.id} property={node} />
            ))}
          </div>
          
          {data?.properties?.pageInfo?.hasNextPage && (
            <div className="text-center mt-8">
              <Button onClick={loadMore}>Load More</Button>
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

## CRITICAL SUCCESS VALIDATION

Before completion, verify:

### Backend (.NET 8 + GraphQL) ✅
- [ ] Target framework updated to net8.0
- [ ] All NuGet packages updated including HotChocolate
- [ ] Program.cs implements minimal API pattern
- [ ] GraphQL endpoint available at /graphql
- [ ] REST endpoints remain functional
- [ ] JWT authentication works for both APIs
- [ ] CORS configured for port 3000

### Frontend (Next.js 15) ✅
- [ ] Apollo Client configured for GraphQL
- [ ] REST client configured for calculations
- [ ] All calculators implemented with accuracy
- [ ] Multi-step forms with validation
- [ ] Property search using GraphQL
- [ ] Authentication integrated
- [ ] Images loading properly

### Integration ✅
- [ ] Frontend connects to both REST and GraphQL
- [ ] Authentication flows work end-to-end
- [ ] Real-time updates for favorites
- [ ] Calculator results match original
- [ ] Form submissions process correctly

### Deployment ✅
- [ ] run-app.sh starts both services
- [ ] Services accessible at correct URLs
- [ ] No console errors or warnings
- [ ] Performance meets requirements

**MIGRATION COMPLETE** - The Rocket-LendPro platform now features a modern .NET 8 backend with dual REST/GraphQL APIs and a Next.js 15 frontend, combining the best of all three migrations into a single, cohesive enterprise application.