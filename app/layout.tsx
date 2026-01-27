import type { Metadata } from 'next'
import { AppLayout } from '@/components/AppLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'Paretflow',
  description: 'Focus. Simplify. Achieve.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
