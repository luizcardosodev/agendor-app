import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { BreadcrumbProvider } from '@/context/BreadcrumbContext';
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className={`${outfit.className} bg-secondary`}>
        <ThemeProvider>
          <SidebarProvider>
            <BreadcrumbProvider>
              {children}
            </BreadcrumbProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
