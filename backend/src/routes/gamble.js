import express from 'express';
import { supabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// 今日のチェック状況と連続日数を取得
// GET /api/gamble/status
router.get('/status', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 今日のチェック状況
    const { data: todayCheck } = await supabase
      .from('gamble_tracker')
      .select('*')
      .eq('user_id', req.user.userId)
      .eq('check_date', today)
      .single();

    // 連続禁止日数を計算
    const { data: records } = await supabase
      .from('gamble_tracker')
      .select('check_date, did_gamble')
      .eq('user_id', req.user.userId)
      .order('check_date', { ascending: false });

    let streak = 0;
    if (records) {
      for (const record of records) {
        if (record.did_gamble) break;
        streak++;
      }
    }

    res.json({
      checkedToday: !!todayCheck,
      didGambleToday: todayCheck?.did_gamble || false,
      streak
    });
  } catch (error) {
    console.error('ギャンブル状況取得エラー:', error);
    res.status(500).json({ error: 'ステータス取得に失敗しました' });
  }
});

// 今日のチェックイン
// POST /api/gamble/checkin
router.post('/checkin', async (req, res) => {
  try {
    const { did_gamble } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('gamble_tracker')
      .upsert({
        user_id: req.user.userId,
        check_date: today,
        did_gamble: did_gamble || false
      }, {
        onConflict: 'user_id,check_date'
      })
      .select()
      .single();

    if (error) throw error;

    // 連続日数を再計算
    const { data: records } = await supabase
      .from('gamble_tracker')
      .select('check_date, did_gamble')
      .eq('user_id', req.user.userId)
      .order('check_date', { ascending: false });

    let streak = 0;
    if (records) {
      for (const record of records) {
        if (record.did_gamble) break;
        streak++;
      }
    }

    res.json({
      message: did_gamble ? '記録しました' : 'おめでとう！今日もギャンブルしませんでした！',
      streak,
      data
    });
  } catch (error) {
    console.error('チェックインエラー:', error);
    res.status(500).json({ error: 'チェックインに失敗しました' });
  }
});

export default router;
