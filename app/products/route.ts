import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '缺少產品 ID' }, { status: 400 });
    }

    // 精準查詢該 ID 的商品
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single(); // 只取單筆資料

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('撈取單一產品失敗:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}