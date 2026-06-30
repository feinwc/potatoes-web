import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 1. 初始化 Supabase 與 OpenAI (確保環境變數都有讀到)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // 💡 建議用 Service Role 權限更穩
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // 3. 呼叫 Supabase RPC (精心調整參數型態，防範 500 錯誤)
    const { data: recommendations, error: rpcError } = await supabase
      .rpc('match_products', {
        query_embedding: queryVector,
        match_threshold: 0.1, // 👈 確保是標準浮點數
        match_count: 6        // 👈 確保是標準整數
      });

    // 💡 如果 Supabase 報錯，直接在終端機印出具體原因，不再瞎猜！
    if (rpcError) {
      console.error('❌ Supabase RPC 執行失敗，具體原因如下：');
      console.error('錯誤代碼:', rpcError.code);
      console.error('錯誤訊息:', rpcError.message);
      console.error('錯誤詳情:', rpcError.details);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // 4. 成功回傳資料
    return NextResponse.json({ data: recommendations });

  } catch (error: any) {
    console.error('❌ API 路由發生未預期崩潰：', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}