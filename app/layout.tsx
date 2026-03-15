import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Providers } from './providers';
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Telemedicine App",
  description: "The fastest way to build apps with Next.js and Supabase",
};

const kanit = Kanit({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin', 'thai'],
  variable: '--font-kanit',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${kanit.className} antialiased bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-400 min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}