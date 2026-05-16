import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'C.A. Combos e Lanches - Cardápio Digital',
  description: 'Peça seus lanches, combos, porções e muito mais pelo nosso cardápio digital. Faça seu pedido pelo WhatsApp!',
}

export const viewport: Viewport = {
  themeColor: '#c4391c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
