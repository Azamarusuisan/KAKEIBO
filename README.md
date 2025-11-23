# 月3万円守護神・家計簿

個人用の超シンプル家計簿Webアプリケーション。月の支出が30,000円を超えると警告を表示します。

## 技術スタック

- **Frontend**: React + Vite, Chart.js
- **Backend**: Node.js 20 + Express
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Render (Web Service + Static Site)

## プロジェクト構造

```
家計簿/
├── backend/     # Node.js + Express API サーバー
├── frontend/    # React + Vite フロントエンド
└── docs/        # 設定・デプロイ手順
```

## ローカル開発手順

### 1. Supabase セットアップ

`docs/DATABASE_SETUP.md` を参照してSupabaseプロジェクトを作成し、テーブルをセットアップしてください。

### 2. バックエンドのセットアップ

```bash
cd backend
npm install
cp .env.example .env
# .env に DATABASE_URL を設定
npm run dev
```

### 3. フロントエンドのセットアップ

```bash
cd frontend
npm install
cp .env.example .env
# .env に VITE_API_BASE を設定
npm run dev
```

### 4. ブラウザでアクセス

http://localhost:5173 にアクセスしてアプリを使用できます。

## デプロイ

デプロイ手順は `docs/DEPLOY.md` を参照してください。

## 主な機能

### 家計簿機能
- 支出の登録（日付・カテゴリ・金額・メモ）
- 月次サマリー表示
- カテゴリ別円グラフ
- 30,000円超過時の警告表示
- 超過後の入力制限

### ギャンブルトラッカー
- 毎日のギャンブル有無チェックイン
- 連続禁止日数のカウント表示
- 確認ダイアログで誤操作防止

### 欲しいもの目標機能
- 欲しいものを登録（名前・画像・URL・目標金額・メモ）
- 「ギャンブルやめれたね！」祝福バナー（ストリーク1日以上で表示）
- Louis Vuitton / Prada へのクイックリンク
- 目標のために節約するモチベーション機能

## ライセンス

MIT
