import './globals.css'
import ConditionalNavbar from '@/components/ConditionalNavbar'
import MainWrapper from '@/components/MainWrapper'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'ERP Dashboard - Modern Enterprise Resource Planning',
  description: 'Elegant ERP Dashboard built with Next.js and Tailwind CSS',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
            <ConditionalNavbar />
            <MainWrapper>
              {children}
            </MainWrapper>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
