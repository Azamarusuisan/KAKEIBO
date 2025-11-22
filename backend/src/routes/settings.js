import express from 'express';
import { supabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// ユーザー設定を取得
// GET /api/settings
router.get('/', async (req, res) => {
  try {
    let { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.userId)
      .single();

    // 設定がなければデフォルト値で作成
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from('user_settings')
        .insert({
          user_id: req.user.userId,
          monthly_limit: 30000,
          warning_threshold: 25000
        })
        .select()
        .single();

      if (insertError) throw insertError;
      data = newData;
    }

    res.json(data);
  } catch (error) {
    console.error('設定取得エラー:', error);
    res.status(500).json({ error: '設定の取得に失敗しました' });
  }
});

// ユーザー設定を更新
// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { monthly_limit, warning_threshold } = req.body;

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: req.user.userId,
        monthly_limit: monthly_limit || 30000,
        warning_threshold: warning_threshold || 25000,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ message: '設定を保存しました', data });
  } catch (error) {
    console.error('設定更新エラー:', error);
    res.status(500).json({ error: '設定の更新に失敗しました' });
  }
});

export default router;
