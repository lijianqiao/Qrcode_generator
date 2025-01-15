import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ThemeRegistry from "@/app/theme/ThemeRegistry";
import Navbar from "@/app/components/layouts/Navbar";
import { APP_CONFIG } from '@/app/config/constants';
import '@/app/styles/datasheet.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_CONFIG.name,
  description: "一个基于FastAPI的二维码生成服务",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className} style={{ backgroundColor: '#f5f5f5' }}>
        <ThemeRegistry>
          <Navbar />
          <main style={{ 
            flex: '1 0 auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {children}
          </main>
        </ThemeRegistry>
      </body>
    </html>
  );
}
