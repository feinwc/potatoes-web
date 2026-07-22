import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 1. 初始化 Supabase 與 OpenAI
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==========================================
// 🟢 處理【單一商品詳細頁】的 GET 請求
// ==========================================
export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const rawId = searchParams.get('id');
  
      console.log('============ 📡 後端收到 GET 請求 (詳細頁) ============');
      console.log('原始接收到的 id 參數:', rawId);
  
      if (!rawId || rawId === 'undefined' || rawId === '[id]') {
        return NextResponse.json({ success: false, error: '缺少或無效的產品 ID' }, { status: 400 });
      }
  
      // 自動轉換數字型別
      const isNumeric = !isNaN(Number(rawId)) && rawId.trim() !== '';
      const queryId = isNumeric ? Number(rawId) : rawId;
  
      // 💡 修正核心：只針對確定存在的 'id' 欄位進行精準查詢，避免 42703 欄位不存在錯誤
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', queryId) // 🎯 改回最單純的 eq 查詢
        .maybeSingle();
  
      if (error) {
        console.error('💥 Supabase GET 查詢失敗:', error);
        throw error;
      }
  
      if (!data) {
        return NextResponse.json({ success: false, data: null, message: '資料庫中找不到該商品' });
      }
  
      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('❌ GET 撈取單一產品發生致命錯誤:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

// ==========================================
// 🔵 處理【首頁關鍵字向量搜尋】的 POST 請求
// ==========================================
export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: '請輸入關鍵字' }, { status: 400 });
    }

    // 2. 向 OpenAI 請求關鍵字的向量
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: keyword,
    });

    const queryVector = embeddingResponse.data[0].embedding;

    // 3. 呼叫 Supabase RPC
    const { data: recommendations, error: rpcError } = await supabase
      .rpc('match_products', {
        query_embedding: queryVector,
        match_threshold: 0.1, 
        match_count: 6        
      });

    if (rpcError) {
      console.error('❌ Supabase RPC 執行失敗，具體原因如下：');
      console.error('錯誤代碼:', rpcError.code);
      console.error('錯誤訊息:', rpcError.message);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // 4. 成功回傳資料
    return NextResponse.json({ success: true, data: recommendations });

  } catch (error: any) {
    console.error('❌ API 路由發生未預期崩潰：', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}