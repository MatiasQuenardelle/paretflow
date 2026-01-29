import type { Metadata, Viewport } from 'next'
import { AppLayout } from '@/components/AppLayout'
import './globals.css'

export const metadata: Metadata = {
  title: 'Paretflow',
  description: 'Focus. Simplify. Achieve.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
