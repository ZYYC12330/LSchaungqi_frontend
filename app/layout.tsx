import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { AnalysisProvider } from '@/contexts/AnalysisContext'
import { HistorySidebar } from '@/components/history-sidebar'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: '智能选型系统',
  description: '仿真机和板卡智能选型系统',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* 加载运行时配置 - 修改此文件无需重新构建 */}
        <script src="/config.js" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <AnalysisProvider>
          <HistorySidebar />
          {children}
          <Toaster />
          <Analytics />
        </AnalysisProvider>
      </body>
    </html>
  )
}
