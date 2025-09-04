# LendPro Full-Stack Application - .NET 8 LTS + Angular

> **Enterprise Mortgage Lending Platform** - Migrated from .NET Core 3.1 to .NET 8 LTS with preserved Angular 19 frontend

## 🏗️ Project Structure

```
DotNET-LendPro/
├── frontend/           # Angular 19 frontend (unchanged from original)
├── backend-v8/         # .NET 8 LTS migrated backend
│   └── MortgagePlatform.API/
├── database/           # Database scripts and migrations
├── tests/              # Integration and unit tests
│   └── LendPro.Api.Tests/
├── run-app.sh          # Single-command deployment script
└── README.md           # This file
```

## 🚀 Quick Start (Single Command)

```bash
./run-app.sh
```

**That's it!** This single script will:
- 🧹 Clean up any processes on ports 4100 and 5004
- 🔧 Build the .NET 8 backend automatically
- 📦 Install frontend dependencies (if needed)
- 🚀 Start both backend and frontend services
- ✨ Show you all access URLs and credentials

## 🌐 Application URLs

Once started, access these URLs:

- **🎨 Frontend**: http://localhost:4100 (Angular application)
- **🔗 Backend API**: http://localhost:5004 (REST API)
- **📚 API Documentation**: http://localhost:5004/swagger (OpenAPI/Swagger)
- **🏥 Health Check**: http://localhost:5004/health (System status)

## 🔑 Test Accounts

The application comes pre-seeded with test accounts:

- **Regular User**: `john.doe@email.com` / `user123`
- **Admin User**: `admin@mortgageplatform.com` / `admin123`

## 🎯 Migration Highlights

### Backend (.NET Core 3.1 → .NET 8 LTS)
- ✅ **Modern Hosting Model**: Migrated from Startup.cs to minimal API Program.cs
- ✅ **Updated Packages**: All NuGet packages upgraded to .NET 8 compatible versions
- ✅ **Enhanced Security**: Modern JWT authentication with improved token validation
- ✅ **Health Checks**: Built-in health monitoring at `/health` endpoint
- ✅ **Structured Logging**: Integrated Serilog for better observability
- ✅ **Nullable Reference Types**: Enhanced code safety and null-checking
- ✅ **Performance**: Leverages .NET 8 performance improvements

### Frontend (Preserved)
- ✅ **Angular 19**: Modern frontend preserved unchanged
- ✅ **All Features**: Property search, mortgage calculators, loan applications
- ✅ **Admin Dashboard**: User and loan management capabilities
- ✅ **Responsive Design**: Works on desktop and mobile devices

### Database
- ✅ **PostgreSQL**: Configured for development with Entity Framework Core 8
- ✅ **In-Memory Development**: No external database required for testing
- ✅ **Migrations Ready**: EF Core migrations configured for production deployment

## 📋 Prerequisites

- **.NET 8 SDK** ([Download here](https://dotnet.microsoft.com/download))
- **Node.js 18+** ([Download here](https://nodejs.org))
- **npm** (comes with Node.js)

**No Docker required!** Simple, fast local development.

## 🛠️ Development Workflow

1. **Start Everything**: `./run-app.sh`
2. **Develop**: Make changes to frontend or backend code
3. **Auto-Reload**: Both services support hot-reload during development
4. **Stop Services**: Press `Ctrl+C` to stop all services cleanly

## 🧪 Testing

Run the integration tests:

```bash
cd tests/LendPro.Api.Tests
dotnet test
```

## 🏢 Application Features

### For Users
- **Property Search**: Browse available properties with filters
- **Mortgage Calculator**: Calculate payments, interest, and amortization
- **Loan Applications**: Submit and track loan applications
- **Document Upload**: Upload required documentation
- **Payment Tracking**: View payment history and schedules

### For Administrators
- **User Management**: Manage user accounts and roles
- **Loan Review**: Review and process loan applications
- **System Analytics**: View application usage and statistics
- **Document Management**: Handle uploaded documents

## 🔧 Manual Setup (Alternative)

If you prefer manual setup instead of the script:

### Backend
```bash
cd backend-v8/MortgagePlatform.API
dotnet restore
dotnet build
dotnet run --urls http://localhost:5004
```

### Frontend
```bash
cd frontend
npm install
npm start  # Runs on http://localhost:4100
```

## 📊 Architecture

- **Frontend**: Angular 19 with TypeScript, Angular Material UI
- **Backend**: .NET 8 Web API with minimal hosting model
- **Database**: Entity Framework Core 8 with PostgreSQL
- **Authentication**: JWT-based authentication with role-based authorization
- **API Documentation**: OpenAPI/Swagger integration
- **Testing**: xUnit integration tests with ASP.NET Core Test Host

## 🛑 Troubleshooting

### Script Issues
- **Permission denied**: Run `chmod +x run-app.sh`
- **Port conflicts**: The script automatically cleans up ports
- **Build errors**: Ensure .NET 8 SDK is installed with `dotnet --version`

### Manual Cleanup (if needed)
```bash
# Kill processes manually
lsof -ti:4100 | xargs kill -9  # Frontend
lsof -ti:5004 | xargs kill -9  # Backend

# Or use built-in cleanup
pkill -f "dotnet.*5004"
pkill -f "ng serve"
```

### Common Issues
- **Frontend dependencies**: Script automatically runs `npm install` if needed
- **Backend compilation**: Ensure .NET 8 SDK is properly installed
- **Database connection**: Uses in-memory database by default for development

## 📈 Performance Notes

- **Startup Time**: ~15-30 seconds for complete application
- **Memory Usage**: ~200-400MB total (both services)
- **Build Time**: ~10-20 seconds for backend build
- **Hot Reload**: Both frontend and backend support development hot-reload

## 🔒 Security Features

- JWT-based authentication with configurable expiry
- Role-based authorization (User/Admin)
- CORS configured for development and production
- Input validation on all API endpoints
- Secure password hashing with BCrypt

## 📝 Logs

Application logs are written to:
- **Backend**: `backend.log`
- **Frontend**: `frontend.log`
- **Installation**: `frontend-install.log` (if dependencies are installed)

## 🚀 Production Deployment

For production deployment:
1. Update connection strings in `appsettings.Production.json`
2. Configure proper CORS origins
3. Set up SSL certificates
4. Configure logging for production environment
5. Set up database migrations: `dotnet ef database update`

---

**The complete mortgage lending platform is now running on .NET 8 LTS with modern architecture, enhanced security, and improved performance while preserving all original functionality.**