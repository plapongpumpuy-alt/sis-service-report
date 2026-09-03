import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Service Report App",
  description: "Field Service Report Web App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-800 selection:bg-blue-200">
        <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-4 shadow-lg sticky top-0 z-50 flex justify-between items-center border-b border-blue-400">
          <h1 className="text-xl font-extrabold tracking-tight">SIS Service</h1>
          <nav className="flex space-x-5 text-sm font-semibold">
            <a href="/" className="hover:text-blue-100 transition-colors">สร้างรายงาน</a>
            <a href="/history" className="hover:text-blue-100 transition-colors">ประวัติ</a>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
