import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Potatoes | AI-powered Serach Engine",
  description: "AI-powered Serach Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = ["Food Bags", "Food Paper", "Paper Bags", "Cups", "Stickers"];

  return (
    <html lang="zh-TW">
      <body className="antialiased bg-gray-50">
        <header className="w-full bg-[#856A5D] py-4 flex flex-col justify-center items-center shadow-md">
          <Link href="/">
            <h1 
              style={{ fontFamily: '"Apple Braille", sans-serif' }} 
              className="text-white text-3xl font-medium tracking-wider cursor-pointer hover:opacity-90"
            >
              Potatoes
            </h1>
          </Link>

          <div className="flex flex-wrap justify-center gap-3 mt-4 px-4 max-w-4xl">
            {categories.map((cat) => (
              <Link 
                key={cat} 
                href={`/?search=${encodeURIComponent(cat)}`}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-1.5 rounded-full transition-all border border-white/20 font-light"
              >
                {cat}
              </Link>
            ))}
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}