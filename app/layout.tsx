import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Liberdus",
  description: "Liberdus web app",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-background flex items-center justify-center h-[100vh] bg-white`}
        suppressHydrationWarning
      >
        <main className="relative container mx-auto w-[min(100vw,400px)] h-[min(100vh,800px)] overflow-hidden rounded-xl border border-gray-300 px-4 flex flex-col">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden scrollbar-thin">{children}</div>
            <BottomNav />
        </main>
      </body>
    </html>
  );
}