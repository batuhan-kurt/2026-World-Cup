import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { GoalAlerts } from "@/components/layout/GoalAlerts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "2026 Dünya Kupası Dashboard",
  description: "2026 FIFA Dünya Kupası'nı canlı takip et. Maç skorları, istatistikler, takım bilgileri ve daha fazlası.",
  keywords: "2026 Dünya Kupası, FIFA, futbol, canlı skor, maç istatistikleri",
  authors: [{ name: "World Cup Dashboard" }],
  openGraph: {
    title: "2026 Dünya Kupası Dashboard",
    description: "Canlı skorlar, istatistikler ve maç detayları",
    type: "website",
    locale: "tr_TR",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#050810",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`dark ${inter.variable} ${outfit.variable}`}>
      <body className="bg-background text-slate-200 antialiased min-h-screen font-sans">
        <div className="flex h-screen overflow-hidden">
          {/* Masaüstü Sidebar - sadece md ve üzeri */}
          <div className="hidden md:flex md:w-64 md:flex-col fixed h-full z-50">
            <Sidebar />
          </div>

          <div className="flex-1 flex flex-col md:pl-64 h-full min-w-0">
            {/* Mobil Header (hamburger menü) - sadece mobil */}
            <div className="md:hidden sticky top-0 z-40">
              <Header />
            </div>

            {/* Ana İçerik */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-8">
              <div className="max-w-7xl mx-auto h-full">
                {children}
              </div>
            </main>
            <GoalAlerts />
          </div>
        </div>
      </body>
    </html>
  );
}
