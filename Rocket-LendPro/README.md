# Rocket-LendPro: Modern Mortgage Platform

Rocket-LendPro is a complete enterprise mortgage lending platform featuring modern architecture with GraphQL-first API and a cutting-edge frontend. This platform represents a successful migration from legacy technologies to modern stack, with comprehensive bug fixes and enhancements implemented during development.

## Features

### For All Users
- **Property Search**: Browse thousands of properties with advanced filtering
- **Mortgage Calculators**: Calculate payments, refinancing options, and rent vs buy comparisons
- **Market Trends**: Analyze real estate market data and price trends

### For Authenticated Users
- **User Dashboard**: Track loan applications and manage profile
- **Loan Applications**: Apply for mortgages directly through the platform
- **Favorite Properties**: Save and track properties of interest

### For Admin Users
- **Admin Dashboard**: Overview of system metrics and recent activity
- **Loan Management**: Review, approve, and manage all loan applications
- **User Management**: Manage user accounts and permissions
- **Dual Dashboard Access**: Admin users can access both admin and regular user dashboards

## 🚀 What We've Accomplished

### Complete Platform Migration
- **Backend**: Migrated from .NET Core 3.1 REST API to .NET 8 with GraphQL-first architecture
- **Frontend**: Migrated from Angular to Next.js 15.5.2 with TypeScript and Apollo Client
- **Authentication**: Integrated NextAuth.js with JWT tokens for seamless authentication
- **Performance**: Implemented Turbopack for 10x faster development builds

### Critical Issues Fixed
1. **Apollo Client Authentication Error (Invariant Violation Error 18)**
   - **Problem**: Apollo Client crashed when accessing authenticated pages before session was established
   - **Solution**: Implemented proper session checks, error handling, and graceful fallbacks
   - **Impact**: Eliminated authentication-related crashes and improved user experience

2. **Property Price Auto-Population**
   - **Problem**: Property prices weren't automatically populated when navigating to mortgage calculator
   - **Solution**: Implemented URL parameter passing and automatic form field calculations
   - **Impact**: Enhanced user experience with pre-filled mortgage calculations

3. **Mock Data Removal**
   - **Problem**: Dashboard and other components used hardcoded mock data
   - **Solution**: Replaced all mock data with real GraphQL queries
   - **Impact**: Dynamic, real-time data throughout the application

4. **Image Error Handling**
   - **Problem**: Properties without images showed broken UI
   - **Solution**: Created PropertyImage component with fallback UI
   - **Impact**: Consistent, professional appearance for all properties

## Architecture

```
Rocket-LendPro/
├── backend-net8/               # .NET 8 LTS with GraphQL API (port 5001)
│   └── MortgagePlatform.API/   # Main API project with HotChocolate GraphQL
├── frontend-next/              # Next.js 15.5.2 with Apollo Client (port 3000)
├── database/                   # PostgreSQL initialization scripts
├── logs/                       # Centralized application logs
├── run-app.sh                  # Unified startup script
└── README.md                   # This documentation
```

### Technology Stack

**Backend (.NET 8 LTS)**
- GraphQL-first API with HotChocolate 13.x
- JWT authentication with proper session management
- Entity Framework Core 8 with PostgreSQL
- Comprehensive error handling and logging
- Health check endpoints for monitoring

**Frontend (Next.js 15.5.2)**
- Apollo Client for GraphQL with NextAuth integration
- Server-side rendering for optimal performance
- Complex mortgage calculators with real-time updates
- Multi-step loan application wizard
- Advanced property search with filtering
- Responsive design with Tailwind CSS and shadcn/ui

## Prerequisites

- .NET 8 SDK
- Node.js 18+
- PostgreSQL 13+ (optional, uses in-memory for development)

## Quick Start

```bash
./run-app.sh
```

This single command starts the entire platform with:
- REST API at http://localhost:5001/api
- GraphQL API at http://localhost:5001/graphql
- Next.js Frontend at http://localhost:3000

The startup script automatically:
- Verifies prerequisites (.NET 8, Node.js 18+)
- Cleans up ports (3000, 5001)
- Builds and starts the .NET 8 backend
- Installs dependencies and starts Next.js frontend
- Provides comprehensive health checks
- Shows real-time startup status

### Access Points

- **🎨 Frontend (Next.js):** http://localhost:3000
- **📡 REST API:** http://localhost:5001/api
- **🔗 GraphQL Playground:** http://localhost:5001/graphql
- **📚 Swagger Docs:** http://localhost:5001/swagger
- **🏥 Health Check:** http://localhost:5001/health

### Test Accounts

- **User:** `john.doe@email.com` / `user123`
- **Admin:** `admin@mortgageplatform.com` / `admin123`

## Navigation Structure

### Header Navigation
- **Always Visible**: Home Search, Mortgage Tools
- **Authenticated Users**: Dashboard
- **Admin Users**: Admin Dashboard + User Dashboard
- **Auth Links**: Login/Logout

### Home Page Features
- **Public Access**: Home Search, Mortgage Tools, Market Trends
- **Authenticated Users**: Loan Application
- **Admin Users**: Loan Management, User Management

## Development

### Frontend Development
```bash
cd frontend
pnpm install
pnpm start         # Development server on port 4001
pnpm build         # Production build
pnpm test          # Run tests
pnpm lint          # Run linter
pnpm typecheck     # TypeScript type checking
```

### Backend Development
```bash
cd backend/MortgagePlatform.API
dotnet restore     # Restore dependencies
dotnet run         # Run on port 5001
dotnet build       # Build the project
dotnet test        # Run tests (if available)
```

## API Architecture (GraphQL-First)

### GraphQL Schema

```graphql
type Query {
  # Property queries
  properties(first: Int, after: String, search: PropertySearchInput): PropertyConnection!
  property(id: Int!): Property
  favoriteProperties: [Property!]!
  
  # User queries
  me: User
  
  # Calculation queries
  calculateMortgage(input: MortgageCalculationInput!): MortgageCalculationResult!
  
  # Admin queries (require admin role)
  dashboardMetrics: DashboardMetrics! @authorize(roles: ["Admin"])
  users(first: Int): UserConnection! @authorize(roles: ["Admin"])
  loanApplications(first: Int): LoanApplicationConnection! @authorize(roles: ["Admin"])
}

type Mutation {
  # Authentication
  login(email: String!, password: String!): LoginResult!
  register(input: RegisterInput!): RegisterResult!
  
  # Property operations
  toggleFavoriteProperty(propertyId: Int!): ToggleFavoriteResult! @authorize
  
  # Loan operations
  submitLoanApplication(input: LoanApplicationInput!): LoanApplicationResult! @authorize
  updateLoanApplicationStatus(input: UpdateStatusInput!): UpdateStatusResult! @authorize(roles: ["Admin"])
}
```

### Key Implementation Details

1. **Authentication Integration**
   - Apollo Client uses NextAuth session tokens
   - Proper error handling for unauthenticated requests
   - Session checks before making authenticated queries

2. **Real-time Updates**
   - Optimistic UI updates for favorites
   - Cache management for consistent data
   - Refetch queries for data synchronization

3. **Error Handling**
   - Graceful fallbacks for authentication errors
   - User-friendly error messages
   - Network error recovery

## Key Features

### 1. Mortgage Calculators
- Standard mortgage calculator with amortization schedules
- Refinance calculator with break-even analysis
- Extra payment impact calculator
- Rent vs buy comparison tool

### 2. Property Management
- Advanced search with GraphQL pagination and filtering
- Favorite properties with real-time updates
- Property comparison tools
- Market trend analysis

### 3. Loan Processing
- 6-step application wizard with validation
- Document upload system
- Application status tracking
- Admin approval workflow

### 4. Market Analytics
- Real-time market trends
- Interactive data visualizations
- Regional comparisons

## Configuration

### Environment Variables

Frontend (`frontend-next/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:5001/graphql
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

Backend (`backend-net8/MortgagePlatform.API/appsettings.json`):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=MortgagePlatform;..."
  },
  "Jwt": {
    "Key": "secret-key",
    "Issuer": "MortgagePlatform",
    "Audience": "MortgagePlatform"
  }
}
```

## Stopping the Application

Press `Ctrl+C` in the terminal running `./run-app.sh` to stop all services. The script automatically:
- Stops the Next.js development server
- Stops the .NET 8 API
- Cleans up ports and processes
- Preserves log files for debugging

## Development

### Frontend Development (Next.js 15)
```bash
cd frontend-next
npm install
npm run dev          # Development server on port 3000
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript checking
```

### Backend Development (.NET 8)
```bash
cd backend-net8/MortgagePlatform.API
dotnet restore       # Restore packages
dotnet run           # Run on port 5001
dotnet build         # Build project
dotnet test          # Run tests
```

## Troubleshooting

### Common Issues and Solutions

#### Apollo Client Invariant Violation (Error 18)
**Symptoms**: Console error "Invariant Violation" when accessing authenticated pages
**Solution**: 
- Check that your components wait for session to be established
- Use `skip: !session?.accessToken` in useQuery hooks
- Ensure services return empty arrays instead of throwing on auth errors

#### Property Price Not Auto-Populating
**Symptoms**: Mortgage calculator doesn't show property price when navigating from property details
**Solution**:
- Verify the property details page passes `propertyPrice` as URL parameter
- Check that mortgage-tools page reads `searchParams.get('propertyPrice')`
- Ensure form default values use the URL parameter

#### Favorites Not Updating
**Symptoms**: Favorite heart icon doesn't update immediately
**Solution**:
- Check that `toggleFavoriteProperty` mutation includes proper cache updates
- Verify optimistic responses are configured
- Ensure `isFavorite` field is included in all property queries

#### Authentication Errors
**Symptoms**: 401 errors or unexpected logouts
**Solution**:
- Verify NextAuth is properly configured
- Check that Apollo Client uses session tokens, not localStorage
- Ensure JWT token expiration matches between frontend and backend

### Port Conflicts
The startup script automatically cleans ports 3000 and 5001. If issues persist:
```bash
# Kill processes manually
lsof -ti:3000 | xargs kill -9
lsof -ti:5001 | xargs kill -9
```

### GraphQL Schema Issues
Visit http://localhost:5001/graphql to explore the GraphQL schema and test queries in the playground.

### Apollo Client Cache Issues
Clear Apollo Client cache by restarting the frontend development server or using:
```javascript
// In browser console
window.__APOLLO_CLIENT__.cache.reset()
```

### Log Files
- Backend: `logs/backend.log`
- Frontend: `logs/frontend.log`
- Installation: `frontend-install.log`

## Deployment

Both frontend and backend are containerization-ready with proper health checks and environment configuration support.

### Production Considerations
- Update environment variables for production URLs
- Configure proper database connections
- Set secure JWT secrets
- Enable HTTPS
- Configure reverse proxy (nginx/Apache)

## Lessons Learned

### Technical Best Practices
1. **Session Management**: Always check authentication status before making authenticated API calls
2. **Error Handling**: Implement graceful fallbacks instead of throwing errors in services
3. **Data Flow**: Use URL parameters for passing data between pages for better UX
4. **Cache Management**: Configure Apollo Client cache policies carefully for user-specific data
5. **Component Design**: Create reusable components with proper error boundaries

### Architecture Decisions
1. **GraphQL-First**: Unified API approach simplifies frontend development
2. **NextAuth + Apollo**: Seamless authentication integration with proper session handling
3. **TypeScript**: End-to-end type safety prevents runtime errors
4. **Turbopack**: Significantly improves development experience with faster builds

### Performance Optimizations
1. **Network-Only Fetch**: Use for authenticated queries to ensure fresh data
2. **Optimistic Updates**: Improve perceived performance for user actions
3. **Image Optimization**: Next.js image component with proper fallbacks
4. **Code Splitting**: Automatic with Next.js app router

## Migration History

This platform represents the complete migration from:
- **DotNET-LendPro**: .NET 8 migration foundation
- **GraphQL-LendPro**: GraphQL API implementation  
- **NextJS-LendPro**: Next.js frontend migration
- **MergedApp-LendPro**: Base application structure

The result is a unified, modern mortgage platform leveraging the best features from all migration projects, enhanced with comprehensive bug fixes and improvements discovered during development.

## Project Status

✅ **Production Ready** - All critical issues have been resolved:
- Authentication flow is stable
- Data synchronization works correctly
- User experience is smooth and intuitive
- Performance meets enterprise standards

## License

This project is proprietary software. All rights reserved.