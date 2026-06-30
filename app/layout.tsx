import type { Metadata } from "next";
import Link from "next/link"; // 引入 Link 用於跳轉搜尋
import "./globals.css";

export const metadata: Metadata = {
  title: "Potatoes | AI-powered Packaging Search Engine",
  description: "Find your packaging for your brand with AI!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 定義你的 5 個類別
  const categories = ["Food Bags", "Food Paper", "Paper Bags", "Cups", "Stickers"];

  return (
    <html lang="zh-TW">
      <body className="antialiased bg-gray-50">
        
        {/* --- 咖啡色橫幅區塊 --- */}
        <header className="w-full bg-[#856A5D] py-2 flex flex-col justify-center items-center shadow-md">
          <Link href="/">
            <h1 
              style={{ fontFamily: '"Apple Braille", sans-serif' }} 
              className="text-white text-2xl font-medium tracking-wider cursor-pointer hover:opacity-90"
            >
              Potatoes
            </h1>
          </Link>

          {/* --- 新增：橫幅下方的類別快捷鍵 --- */}
          <div className="flex flex-wrap justify-center gap-3 mt-4 px-4 max-w-4xl">
            {categories.map((cat) => (
              <Link 
                key={cat} 
                href={`/?search=${encodeURIComponent(cat)}`} // 點擊時，網頁網址會變成 /?search=Cups
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-1.5 rounded-full transition-all border border-white/20 font-light"
              >
                {cat}
              </Link>
            ))}
          </div>
        </header>

        <main>
          {children}
        </main>
      </body>
    </html>
  );
}