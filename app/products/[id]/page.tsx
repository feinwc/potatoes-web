'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

// 隨機價格計算函數 (台幣計價)
const calculatePrice = (quantity: number, seedId: string) => {
  const basePrice = 5 + (seedId.length % 10); 
  let discount = 1;
  if (quantity >= 100) discount = 0.9;
  if (quantity >= 500) discount = 0.8;
  return Math.ceil(quantity * basePrice * discount);
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(10);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 💡 修正：呼叫剛剛建立的精準撈取 API
  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      try {
        // 改用 GET 請求，並帶上商品 ID
        const response = await fetch(`/api/products?id=${id}`);
        const resData = await response.json();
        
        if (resData.success && resData.data) {
          setProduct(resData.data);
        } else {
          console.error("找不到該產品資料");
        }
      } catch (error) {
        console.error("載入產品失敗", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/?search=${encodeURIComponent(searchKeyword)}`);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading Product...</div>;
  if (!product) return <div className="text-center py-20 text-slate-400">找不到該產品，或商品 ID 不存在</div>;

  const totalPrice = calculatePrice(quantity, product.id || '1');

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* 1. 保留搜尋列 */}
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
            <button type="submit" className="px-8 py-3 bg-amber-800 hover:bg-amber-900 text-white font-medium rounded-2xl shadow-sm transition-all">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 2. 產品詳細佈局網格：左側 2/3 照片，右側 1/3 資訊 */}
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

          {/* 下方購買按鈕 */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => alert(`已將 ${quantity} 個 ${product.name} 加入購物車`)}
              className="py-4 bg-white hover:bg-slate-100 text-amber-950 font-bold rounded-2xl border-2 border-slate-300 transition-all text-center"
            >
              放入購物車
            </button>
            <button 
              onClick={() => alert(`立即結帳：總金額 NT$ ${totalPrice}`)}
              className="py-4 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-2xl shadow-md transition-all text-center"
            >
              立即結帳
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}