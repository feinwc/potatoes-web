import type { Metadata } from "next";
import "./globals.css";

// 這裡可以修改你之前提到的網頁標籤名稱
export const metadata: Metadata = {
  title: "Potatoes | AI-powered Packaging Search Engine",
  description: "Find your packaging with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {/* --- 新增的咖啡色橫幅區塊 --- */}
        <header className="w-full bg-[#856A5D] py-4 flex justify-center items-center shadow-md">
          <h1 
            style={{ fontFamily: '"Apple Braille", sans-serif' }} 
            className="text-white text-3xl font-medium tracking-wider"
          >
            Potatoes
          </h1>
        </header>
        {/* ------------------------- */}

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}