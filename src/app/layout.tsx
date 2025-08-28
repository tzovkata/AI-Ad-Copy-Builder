import { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RSA Builder',
  description: 'AI-Powered RSA Builder for Google Ads',
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