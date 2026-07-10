import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get('id');

    if (!rawId) {
      return NextResponse.json({ error: '缺少產品 ID' }, { status: 400 });
    }

    // 💡 核心修正：嘗試將 id 轉換為數字。
    // 如果你的資料庫 id 是數字，用 parsedId；如果是 UUID 或字串，就用原本的 rawId
    const isNumeric = !isNaN(Number(rawId));
    const queryId = isNumeric ? Number(rawId) : rawId;

    console.log('🔍 後端正在查詢商品 ID:', queryId, '型別為:', typeof queryId);

    // 精準查詢該 ID 的商品
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', queryId)
      .maybeSingle(); // 💡 換成 maybeSingle()，查不到時會回傳 null 而不噴致命錯誤

    if (error) {
      console.error('Supabase 查詢錯誤:', error);
      throw error;
    }

    if (!data) {
      console.warn(`⚠️ 資料庫中找不到 ID 為 ${queryId} 的商品`);
      return NextResponse.json({ success: false, data: null, message: '找不到該商品' });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('撈取單一產品失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}