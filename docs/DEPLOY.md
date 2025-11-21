# Render デプロイ手順

このドキュメントでは、家計簿アプリを Render にデプロイする手順を説明します。

## 前提条件

- Supabase プロジェクトが作成済みで、`expenses` テーブルが存在すること
- GitHub リポジトリにコードがプッシュされていること
- Render アカウントが作成済みであること

---

## 手順1: バックエンドのデプロイ（Web Service）

### 1-1. Render ダッシュボードにアクセス

1. https://render.com にログイン
2. **New +** ボタンをクリック → **Web Service** を選択

### 1-2. リポジトリの接続

1. GitHub リポジトリを選択（例: `Azamarusuisan/KAKEIBO`）
2. **Connect** をクリック

### 1-3. サービス設定

以下の設定を入力：

| 項目 | 設定値 |
|------|--------|
| **Name** | `kakeibo-backend`（任意） |
| **Region** | `Singapore (Southeast Asia)` または `Oregon (US West)` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 1-4. 環境変数の設定

**Environment Variables** セクションで以下を追加：

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `eyJhbGci...（あなたのサービスロールキー）` |

⚠️ **注意**: `SUPABASE_SERVICE_KEY` は秘密鍵なので慎重に扱ってください。

### 1-5. デプロイ実行

1. **Create Web Service** をクリック
2. デプロイが完了するまで待つ（3〜5分）
3. デプロイ成功後、公開URLをメモする
   - 例: `https://kakeibo-backend.onrender.com`

### 1-6. 動作確認

ブラウザで以下にアクセス：
```
https://kakeibo-backend.onrender.com/health
```

以下のレスポンスが返ればOK：
```json
{
  "status": "ok",
  "message": "家計簿APIサーバー稼働中"
}
```

---

## 手順2: フロントエンドのデプロイ（Static Site）

### 2-1. Render ダッシュボードにアクセス

1. **New +** ボタンをクリック → **Static Site** を選択

### 2-2. リポジトリの接続

1. 同じ GitHub リポジトリを選択
2. **Connect** をクリック

### 2-3. サービス設定

| 項目 | 設定値 |
|------|--------|
| **Name** | `kakeibo-frontend`（任意） |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 2-4. 環境変数の設定

**Environment Variables** セクションで以下を追加：

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://kakeibo-backend.onrender.com`（手順1でメモしたバックエンドURL） |

### 2-5. デプロイ実行

1. **Create Static Site** をクリック
2. デプロイが完了するまで待つ（3〜5分）
3. デプロイ成功後、公開URLをメモする
   - 例: `https://kakeibo-frontend.onrender.com`

### 2-6. 動作確認

ブラウザで公開URLにアクセスし、以下を確認：

- [ ] ヘッダーに「家計簿（上限3万円）」と表示される
- [ ] 支出登録フォームが表示される
- [ ] カテゴリ別支出グラフが表示される（データがあれば）
- [ ] 今月の支出一覧が表示される（データがあれば）

---

## 手順3: 支出を登録してテスト

1. フロントエンドのURLにアクセス
2. 支出登録フォームに以下を入力：
   - 日付: 今日の日付
   - カテゴリ: 食費
   - 金額: 5000
   - メモ: テスト支出
3. 「登録する」をクリック
4. 一覧に表示されることを確認
5. 合計金額が更新されることを確認
6. 円グラフに反映されることを確認

---

## 手順4: 30,000円超過アラートのテスト

1. 合計が30,000円を超えるまで支出を登録
2. 赤い警告メッセージが表示されることを確認：
   - 「⚠️ もうお金使ってはいけません！上限3万円を超えています。」
3. 「登録する」ボタンが「もう登録できません」に変わり、無効化されることを確認

---

## トラブルシューティング

### バックエンドが起動しない

**原因**: 環境変数が正しく設定されていない

**解決策**:
1. Render のバックエンドサービスページで **Environment** タブを開く
2. `SUPABASE_URL` と `SUPABASE_SERVICE_KEY` が正しく設定されているか確認
3. 設定を変更した場合は、**Manual Deploy** → **Deploy latest commit** で再デプロイ

### フロントエンドからAPIにアクセスできない

**原因**: CORS エラーまたは環境変数の設定ミス

**解決策**:
1. ブラウザの開発者ツール（F12）でコンソールエラーを確認
2. `VITE_API_BASE` がバックエンドの正しいURLに設定されているか確認
3. バックエンドのログで CORS エラーがないか確認

### 無料プランの制限について

Render の無料プランには以下の制限があります：
- 15分間アクセスがないとサーバーがスリープ
- 次回アクセス時に起動まで30秒〜1分かかる

**対策**:
- 有料プランにアップグレード（月$7〜）
- 定期的にアクセスするCronジョブを設定（別途設定が必要）

---

## 再デプロイ方法

コードを更新した場合の再デプロイ手順：

1. コードを変更
2. Git にコミット & プッシュ
   ```bash
   git add .
   git commit -m "機能追加"
   git push origin main
   ```
3. Render が自動的に検知してデプロイ開始
4. デプロイ完了を待つ

手動で再デプロイする場合：
1. Render のサービスページを開く
2. **Manual Deploy** → **Deploy latest commit** をクリック

---

## セキュリティチェックリスト

デプロイ後、以下を確認してください：

- [ ] `SUPABASE_SERVICE_KEY` が GitHub にコミットされていない
- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] Supabase の RLS（Row Level Security）が将来的に有効化できる設計になっている
- [ ] バックエンドのエラーメッセージに機密情報が含まれていない

---

## 次のステップ

デプロイが完了したら、以下を検討してください：

1. **カスタムドメインの設定**
   - Render で独自ドメインを設定可能

2. **認証機能の追加**
   - Supabase Auth を使ってユーザー認証を実装
   - RLS を有効化してマルチユーザー対応

3. **データのバックアップ**
   - Supabase の自動バックアップ機能を確認
   - 定期的に手動エクスポートも検討

4. **モニタリング**
   - Render のログを定期的に確認
   - エラーが発生していないかチェック
