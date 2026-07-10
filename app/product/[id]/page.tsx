'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 隨機價格計算函數 (根據數量乘上隨機單價，並無條件進位)
const calculatePrice = (quantity: number, seedId: string) => {
  // 利用產品 id 的字元長度做一個簡易的固定隨機單價 (例如 5 ~ 15 元之間)
  const basePrice = 5 + (seedId.length % 10); 
  // 數量越多，給點微幅折扣
  let discount = 1;
  if (quantity >= 100) discount = 0.9;
  if (quantity >= 500) discount = 0.8;
  
  return Math.ceil(quantity * basePrice * discount);
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(10); // 預設數量為 10
  const [searchKeyword, setSearchKeyword] = useState('');

  // 1. 模擬或從 API 撈取該 ID 的單一產品資料
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        // 這裡呼叫你的 API，傳入 id 取得單一商品資料
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keyword: id }), // 如果你 API 支援以 id 搜尋
        });
        const resData = await response.json();
        
        // 為了展示，如果 API 沒撈到，我們建立一個符合你之前上架的北歐貼紙資料作為 fallback
        if (resData.data && resData.data.length > 0) {
          setProduct(resData.data[0]);
        } else {
          setProduct({
            id: id,
            name: "北歐幾何 Thank You 圓形連續貼紙捲",
            image_url: "https://atqmngtzukfzosnsenyy.supabase.co/storage/v1/object/public/product-images/logo.jpeg",
            raw_description: "這款貼紙專為注重包裝質感與生活美學的您設計，融合了濃厚的北歐極簡主義（Scandinavian Minimalism），讓每一份感謝都顯得優雅而精緻。",
            color_name: "北歐多色幾何",
            color_code: "#BFA89E"
          });
        }
      } catch (error) {
        console.error("載入產品失敗", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 處理保留的搜尋列送出事件 (跳回首頁搜尋)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/?search=${encodeURIComponent(searchKeyword)}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading Product...</div>;
  if (!product) return <div className="text-center py-20 text-slate-400">找不到該產品</div>;

  // 計算目前總價
  const totalPrice = calculatePrice(quantity, product.id || '1');

  return (
    <main className="min-h-screen bg-white text-slate-800">
      
      {/* ────────────────────────────────────────────────────────────
          1. 保留搜尋列 (與首頁風格一致)
          ──────────────────────────────────────────────────────────── */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜尋其他包裝風格..."
              className="flex-1 px-6 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 shadow-md focus:outline-none focus:ring-1 focus:ring-amber-800 text-base transition-all"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-2xl shadow-sm transition-all"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
          2. 產品詳細佈局網格：左側 2/3 照片，右側 1/3 資訊與控制欄
          ──────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-12 pt-6">
        
        {/* 左側 2/3：照片區域 */}
        <div className="lg:col-span-2">
          <div className="aspect-square w-full bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/800x800/f1f5f9/475569?text=Potatoes+Package";
              }}
            />
          </div>
        </div>

        {/* 右側 1/3：商品資訊、數量、計價與購買按鈕 */}
        <div className="flex flex-col justify-between h-full space-y-8 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
          <div>
            {/* 名稱和敘述在最上方 */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 leading-tight">
              {product.name}
            </h2>
            
            {product.color_name && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-6 bg-white px-3 py-1.5 rounded-xl w-fit border border-slate-200">
                <span>顏色：{product.color_name}</span>
                <span 
                  className="w-4 h-4 rounded-full border border-slate-200 shadow-inner"
                  style={{ backgroundColor: product.color_code || '#cbd5e1' }}
                />
              </div>
            )}

            <p className="text-slate-600 text-base leading-relaxed mb-8 whitespace-pre-line">
              {product.raw_description}
            </p>

            <hr className="border-slate-200 my-6" />

            {/* 數量選擇按鈕 */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                選擇數量 (PCS)
              </label>
              <div className="flex flex-wrap gap-2">
                {[10, 30, 60, 100, 500].map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    className={`flex-1 min-w-[60px] py-2.5 rounded-xl font-bold text-sm border transition-all ${
                      quantity === num
                        ? 'bg-amber-800 border-amber-800 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* 自動生成的台幣價格 */}
            <div className="mt-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-inner">
              <span className="text-xs font-bold text-slate-400 block mb-1">估算總價 (NTD)</span>
              <div className="text-3xl font-black text-amber-900 flex items-baseline gap-1">
                <span className="text-lg font-bold">NT$</span>
                {totalPrice.toLocaleString()}
                <span className="text-xs font-normal text-slate-400 ml-2">
                  (單價約 NT$ {(totalPrice / quantity).toFixed(1)} / 個)
                </span>
              </div>
            </div>
          </div>

          {/* 下方的兩個主動作按鈕 */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => alert(`已將 ${quantity} 個商品加入購物車`)}
              className="py-4 bg-white hover:bg-slate-100 text-amber-950 font-bold rounded-2xl border-2 border-slate-300 transition-all active:scale-98 text-center"
            >
              放入購物車
            </button>
            <button 
              onClick={() => alert(`立即結帳：總金額 NT$ ${totalPrice}`)}
              className="py-4 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-2xl shadow-md transition-all active:scale-98 text-center"
            >
              立即結帳
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}