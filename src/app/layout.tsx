import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "AquaVion | Monitoring Kolam Lele IoT",
  description: "Platform cerdas pemantauan kualitas air kolam lele (Suhu, pH, Turbidity, Tinggi Air) dengan analitik dan notifikasi real-time.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "AquaVion | Monitoring Kolam Lele IoT",
    description: "Platform cerdas pemantauan kualitas air kolam lele (Suhu, pH, Turbidity, Tinggi Air) dengan analitik dan notifikasi real-time.",
    siteName: "AquaVion",
    images: [
      {
        url: "/icon.svg",
        width: 800,
        height: 600,
        alt: "Logo AquaVion",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AquaVion | Monitoring Kolam Lele IoT",
    description: "Platform cerdas pemantauan kualitas air kolam lele (Suhu, pH, Turbidity, Tinggi Air) dengan analitik dan notifikasi real-time.",
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
