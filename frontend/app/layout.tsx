import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: 'Survey MVP',
  description: 'Survey MVP Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    Survey MVP
                  </Link>
                </div>
                <nav className="flex gap-6">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                  <Link href="/surveys" className="text-gray-600 hover:text-gray-900">
                    Surveys
                  </Link>
                  <Link href="/login" className="text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
