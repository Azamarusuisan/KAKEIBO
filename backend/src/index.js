import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './database.js';
import expensesRouter from './routes/expenses.js';
import authRouter from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// APIルート
app.use('/api/auth', authRouter);
app.use('/api', expensesRouter);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '家計簿APIサーバー稼働中' });
});

// 本番環境: フロントエンドの静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));

  // SPA用: すべてのルートをindex.htmlに転送
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('サーバーエラー:', err);
  res.status(500).json({
    error: 'サーバー内部エラーが発生しました',
    details: err.message
  });
});

// サーバー起動
app.listen(PORT, async () => {
  console.log(`🚀 サーバー起動: http://localhost:${PORT}`);
  console.log(`📊 API エンドポイント: http://localhost:${PORT}/api`);

  // Supabase 接続テスト
  await testConnection();
});
