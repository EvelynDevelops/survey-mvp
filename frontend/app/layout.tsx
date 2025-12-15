import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Survey MVP",
  description: "Survey MVP Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header - Fixed */}
          <Header />

          {/* Main Content - with padding for fixed header */}
          <main className="flex-1 pt-16">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-navy py-6">
            <div className="text-center text-white text-sm">
                Built with care by Evelyn
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
