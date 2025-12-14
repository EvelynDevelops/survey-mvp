import type { Metadata } from 'next'

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
      <body>{children}</body>
    </html>
  )
}
