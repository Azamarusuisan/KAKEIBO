# Supabase データベースセットアップ

## 1. Supabase プロジェクトの作成

1. https://supabase.com にアクセスしてアカウントを作成（未作成の場合）
2. "New Project" をクリック
3. プロジェクト名を入力（例: kakeibo-app）
4. データベースパスワードを設定（強固なパスワードを推奨）
5. リージョンを選択（日本の場合は "Northeast Asia (Tokyo)" を推奨）
6. "Create new project" をクリック

## 2. データベーステーブルの作成

プロジェクトが作成されたら、左サイドバーから **SQL Editor** を選択し、以下のSQLを実行してください。

```sql
-- expenses テーブルの作成
CREATE TABLE public.expenses (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT 'me',
  spent_at DATE NOT NULL,
  category TEXT NOT NULL,
  amount INTEGER NOT NULL,
  memo TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_expenses_user_spent ON public.expenses(user_id, spent_at DESC);
CREATE INDEX idx_expenses_category ON public.expenses(category);

-- コメント追加
COMMENT ON TABLE public.expenses IS '家計簿の支出データ';
COMMENT ON COLUMN public.expenses.user_id IS '単一ユーザー前提で常に "me"。将来のマルチユーザー拡張用';
COMMENT ON COLUMN public.expenses.spent_at IS '支出日';
COMMENT ON COLUMN public.expenses.category IS 'カテゴリ（食費/交際費/交通費/趣味/固定費/その他）';
COMMENT ON COLUMN public.expenses.amount IS '金額（円）';
COMMENT ON COLUMN public.expenses.memo IS 'メモ（任意）';
```

## 3. RLS（Row Level Security）の設定

現時点では認証なしの単一ユーザー前提のため、**RLS は無効のまま**で構いません。

**将来的にマルチユーザー対応する場合**は、以下のようなRLSポリシーを設定してください：

```sql
-- RLS を有効化（将来の拡張用・現時点では実行しない）
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ポリシー例：自分のデータのみ参照・編集可能（将来の拡張用）
-- CREATE POLICY "Users can view their own expenses"
--   ON public.expenses FOR SELECT
--   USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can insert their own expenses"
--   ON public.expenses FOR INSERT
--   WITH CHECK (auth.uid()::text = user_id);

-- CREATE POLICY "Users can update their own expenses"
--   ON public.expenses FOR UPDATE
--   USING (auth.uid()::text = user_id);

-- CREATE POLICY "Users can delete their own expenses"
--   ON public.expenses FOR DELETE
--   USING (auth.uid()::text = user_id);
```

## 4. 接続情報の取得

1. Supabase プロジェクトの左サイドバーから **Settings** → **Database** を選択
2. "Connection string" セクションで **URI** タブを選択
3. `postgres://postgres:[YOUR-PASSWORD]@...` の形式の接続文字列をコピー
4. `[YOUR-PASSWORD]` の部分を実際のデータベースパスワードに置き換える

**接続文字列の例:**
```
postgres://postgres:your_password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?sslmode=require
```

この接続文字列を `backend/.env` の `DATABASE_URL` に設定します。

## 5. テストデータの挿入（オプション）

動作確認用に以下のテストデータを挿入できます：

```sql
INSERT INTO public.expenses (user_id, spent_at, category, amount, memo) VALUES
  ('me', '2025-11-01', '食費', 3500, 'スーパーで買い物'),
  ('me', '2025-11-05', '交通費', 1200, '電車代'),
  ('me', '2025-11-10', '趣味', 5000, '本購入'),
  ('me', '2025-11-15', '食費', 2800, '外食');
```

## 6. セキュリティ注意事項

- データベースパスワードは絶対に Git リポジトリにコミットしない
- `.env` ファイルは `.gitignore` に追加
- Render などの本番環境では環境変数として安全に管理

## トラブルシューティング

### 接続エラーが出る場合
- パスワードが正しいか確認
- 接続文字列の末尾に `?sslmode=require` が付いているか確認
- Supabase プロジェクトがアクティブ状態か確認

### クエリが遅い場合
- インデックスが正しく作成されているか確認
- `EXPLAIN ANALYZE` でクエリプランを確認
