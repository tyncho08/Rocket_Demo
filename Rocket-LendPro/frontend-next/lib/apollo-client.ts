import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { getSession } from 'next-auth/react';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:5001/graphql',
});

const authLink = setContext(async (_, { headers }) => {
  // Get token from NextAuth session
  let token = '';
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      token = (session as any)?.accessToken || '';
    } catch (error) {
      console.error('Error getting session for Apollo:', error);
    }
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error('GraphQL Error:', message, extensions);
      // Handle GraphQL authentication errors
      if (extensions?.code === 'AUTH_NOT_AUTHENTICATED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
      }
    });
  }
  
  if (networkError) {
    console.error('Network Error:', networkError);
    // Handle network authentication errors (401)
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache({
    typePolicies: {
      Property: {
        fields: {
          isFavorite: {
            // Allow caching but merge updates properly
            merge(existing, incoming) {
              return incoming;
            },
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