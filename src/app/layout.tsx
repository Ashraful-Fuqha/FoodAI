import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'FoodAI: Your Nutrition Assistant',
  description: 'Comprehensive food information with AI insights.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar/>
            <main className="flex-grow container mx-auto p-4">{children}</main> {/* flex-grow to push footer down */}
            <footer className="bg-gray-200 text-center p-4 mt-auto dark:bg-gray-900 dark:text-gray-400 transition-colors duration-300">
              <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} FoodAI. All rights reserved.</p>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
