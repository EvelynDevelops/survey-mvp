import type { Metadata } from "next";
import Link from "next/link";
import { AcornLmsLogo } from "@/components/icon/AcornLogo";
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
          <header className="fixed top-0 left-0 right-0 bg-navy border-b border-slate-800 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Left: Logo */}
                <Link href="/" className="flex items-center">
                  <AcornLmsLogo className="h-8 w-auto text-white" />
                </Link>

                {/* Right: Login Button */}
                <Link
                  href="/login"
                  className="inline-flex items-center rounded-md bg-emerald-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-300 transition-colors"
                >
                  Login
                </Link>
              </div>
            </div>
          </header>

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
