'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// 💡 建立一個內層組件來安全地使用 useSearchParams
function SearchContent() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // 💡 核心搜尋邏輯：獨立成一個可重複呼叫的函數
  const performSearch = async (searchWord: string) => {
    if (!searchWord.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchWord }),
      });
      const resData = await response.json();
      setResults(resData.data || []);
    } catch (error) {
      console.error('搜尋失敗：', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ 新增：監聽網址 URL 參數變化（當使用者點擊上方橫幅的類別時）
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setKeyword(urlSearch);       // 讓輸入框文字同步改變
      performSearch(urlSearch);    // 自動觸發搜尋
    }
  }, [searchParams]);

  // 表單送出處理（手動輸入關鍵字後按 Enter 或按鈕）
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(keyword);
    // 同步更新網址，維持體驗一致性
    router.push(`/?search=${encodeURIComponent(keyword)}`);
  };

  // ✅ 點擊下方莫蘭迪色系方框，同步填入輸入框並「直接觸發搜尋」
  const handleQuickSearch = (style: string) => {
    setKeyword(style);       
    performSearch(style);    
    router.push(`/?search=${encodeURIComponent(style)}`);
  };

  return (
    <main className="min-h-screen bg-white text-slate-800">
      
      {/* ────────────────────────────────────────────────────────────
          1. 頂部居中區：原始圖片 (放大三倍、無特效) + 搜尋欄
          ──────────────────────────────────────────────────────────── */}
      <div className="pt-20 pb-12 px-6 flex flex-col items-center text-center">
        
        {/* Logo 圖片區域 */}
        <div className="mb-6 select-none">
          <img 
            src="https://atqmngtzukfzosnsenyy.supabase.co/storage/v1/object/public/product-images/logo.jpeg" 
            alt="Potatoes Packaging Logo" 
            className="hidden h-48 w-auto object-contain"
          />
        </div>

        <p className="hidden text-slate-400 text-xs mb-10 tracking-widest">
          AI-POWERED PACKAGING SEARCH ENGINE
        </p> 

        {/* 搜尋框 */}
        <div className="w-full max-w-2xl mb-14">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Scadi Style, backery, food bag..."
              className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-md focus:outline-none focus:ring-1 focus:ring-amber-800 text-base transition-all"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-2xl shadow-sm transition-all disabled:bg-amber-600 transform active:scale-98"
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
        </div>

        {/* ────────────────────────────────────────────────────────────
            2. 四個莫蘭迪色系方框（點擊直達搜尋）
            ──────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {[
            { title: 'Coffee', tag: 'Coffee', bg: '#D1C7BD' }, 
            { title: 'Food Bag', tag: 'Food Bag', bg: '#BFA89E' }, 
            { title: 'Bakery', tag: 'Bakery', bg: '#A38A7E' }, 
            { title: 'Festive', tag: 'Festive', bg: '#856A5D' }, 
          ].map((cat) => (
            <div
              key={cat.title}
              onClick={() => handleQuickSearch(cat.tag)}
              style={{ backgroundColor: cat.bg }}
              className="aspect-[4/3] p-5 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:brightness-95 flex flex-col justify-end items-start group shadow-sm"
            >
              <h4 className="font-black text-xl text-white tracking-wide transition-transform group-hover:translate-x-1">
                {cat.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          3. 搜尋結果產品網格
          ──────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-12 border-t border-slate-200">
            {results.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-2xl transition-all duration-500 flex flex-col group">
                {/* 產品圖片 */}
                <div className="aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/600x600/f1f5f9/475569?text=Potatoes+Package";
                    }}
                  />
                  {/* 相似度標籤 */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-amber-900 text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                    {Math.round(item.similarity * 100)}% matched
                  </div>
                </div>

                {/* 產品內文 */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-3 text-slate-900 leading-tight">
                      {item.name}
                    </h3>
                    
                    {/* 顏色資訊 */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 bg-slate-50 px-3 py-2 rounded-xl w-fit border border-slate-100">
                      <span className="font-medium">顏色：{item.color_name || '預設'}</span>
                      <span 
                        className="w-4 h-4 rounded-full border border-slate-200 shadow-inner"
                        style={{ backgroundColor: item.color_code || '#cbd5e1' }}
                      />
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6">
                      {item.raw_description}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">MOQ: 100+</span>
                    <button className="text-sm font-bold text-amber-700 hover:text-amber-950 group-hover:translate-x-1 transition-transform">