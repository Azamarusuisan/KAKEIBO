/**
 * Supabase Management API を使ってwishlistテーブルを作成するスクリプト
 */

import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_PROJECT_REF = 'uilvmqbfzdrjpwsjlzcj';
const SUPABASE_ACCESS_TOKEN = 'sbp_11b0acfdd613edbfc5ef718d0ee79e705a8f35a7';

const SQL = `
-- wishlist テーブルの作成
CREATE TABLE IF NOT EXISTS public.wishlist (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  target_url TEXT,
  target_amount INTEGER,
  memo TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_wishlist_user
  ON public.wishlist(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_active
  ON public.wishlist(user_id, is_active);

-- コメント追加
COMMENT ON TABLE public.wishlist IS '欲しいものリスト（目標管理）';
`.trim();

async function createTable() {
  console.log('📦 wishlistテーブル作成を開始します...\n');

  try {
    // Supabase Management API でSQL実行
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: SQL })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API エラー: ${response.status} - ${error}`);
    }

    const result = await response.json();

    console.log('✅ テーブルの作成に成功しました！\n');
    console.log('結果:', JSON.stringify(result, null, 2));

    // テーブル確認
    console.log('\n📊 テーブルの存在確認中...');

    const { supabase } = await import('./database.js');

    const { data, error } = await supabase
      .from('wishlist')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        console.log('⚠️ テーブルがまだ認識されていません。数秒待ってから再試行してください。');
      } else {
        throw error;
      }
    } else {
      console.log('✅ テーブルが正常に動作しています！');
    }

    console.log('\n🎉 セットアップ完了！');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message);

    console.log('\n💡 代替方法: Supabaseダッシュボードで以下のSQLを実行してください:');
    console.log('━'.repeat(80));
    console.log(SQL);
    console.log('━'.repeat(80));

    process.exit(1);
  }
}

createTable();
