import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  unique_name: string;
  email: string;
  role: string;
  nameid: string;
  exp: number;
  iss: string;
  aud: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${process.env.API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          
          if (!data.token) {
            return null;
          }

          // Decode the JWT to get user information
          const decoded = jwtDecode<DecodedToken>(data.token);
          
          return {
            id: decoded.nameid,
            email: decoded.email,
            name: decoded.unique_name,
            role: decoded.role,
            accessToken: data.token
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update') {
        return { ...token, ...session.user };
      }
      
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      
      // Check if token is expired
      if (token.accessToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(token.accessToken as string);
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (decoded.exp < currentTime) {
            // Token is expired, clear session
            return {};
          }
        } catch (error) {
          return {};
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  }
};