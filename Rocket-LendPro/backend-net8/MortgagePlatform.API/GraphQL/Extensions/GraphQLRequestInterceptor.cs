using HotChocolate.AspNetCore;
using HotChocolate.Execution;
using System.Security.Claims;
using Serilog;

namespace MortgagePlatform.API.GraphQL.Extensions;

public class GraphQLRequestInterceptor : DefaultHttpRequestInterceptor
{
    private readonly ILogger<GraphQLRequestInterceptor> _logger;
    
    public GraphQLRequestInterceptor(ILogger<GraphQLRequestInterceptor> logger)
    {
        _logger = logger;
    }
    
    public override ValueTask OnCreateAsync(
        HttpContext context,
        IRequestExecutor requestExecutor,
        IQueryRequestBuilder requestBuilder,
        CancellationToken cancellationToken)
    {
        // Log authentication state
        _logger.LogInformation("GraphQL Request - IsAuthenticated: {IsAuthenticated}", context.User.Identity?.IsAuthenticated);
        
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
            var userEmail = context.User.FindFirst(ClaimTypes.Email)?.Value;
            
            // Log all claims for debugging
            _logger.LogInformation("Authenticated User - ID: {UserId}, Role: {UserRole}, Email: {Email}", 
                userId, userRole, userEmail);
            
            foreach (var claim in context.User.Claims)
            {
                _logger.LogDebug("Claim: {Type} = {Value}", claim.Type, claim.Value);
            }
            
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out var id))
            {
                requestBuilder.SetGlobalState("UserId", id);
                requestBuilder.SetGlobalState("UserRole", userRole);
            }
        }
        else
        {
            _logger.LogWarning("Unauthenticated GraphQL request");
        }
        
        return base.OnCreateAsync(context, requestExecutor, requestBuilder, cancellationToken);
    }
}