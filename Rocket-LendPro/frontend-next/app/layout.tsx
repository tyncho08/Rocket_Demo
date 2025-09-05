import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ApolloWrapper } from "@/components/providers/apollo-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LendPro - Mortgage Platform",
  description: "Enterprise mortgage lending platform with advanced calculators and loan management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ApolloWrapper>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
