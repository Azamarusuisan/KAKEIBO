import express from 'express';
import { supabase } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 全ルートに認証を適用
router.use(authenticateToken);

// 欲しいものリスト取得
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*')
      .eq('user_id', req.user.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('wishlist取得エラー:', error);
    res.status(500).json({ error: 'データ取得に失敗しました' });
  }
});

// 欲しいもの追加
router.post('/', async (req, res) => {
  try {
    const { name, image_url, target_url, target_amount, memo } = req.body;

    if (!name) {
      return res.status(400).json({ error: '名前は必須です' });
    }

    const { data, error } = await supabase
      .from('wishlist')
      .insert({
        user_id: req.user.userId,
        name,
        image_url: image_url || null,
        target_url: target_url || null,
        target_amount: target_amount || null,
        memo: memo || null
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('wishlist追加エラー:', error);
    res.status(500).json({ error: '追加に失敗しました' });
  }
});

// 欲しいもの更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image_url, target_url, target_amount, memo } = req.body;

    const { data, error } = await supabase
      .from('wishlist')
      .update({
        name,
        image_url,
        target_url,
        target_amount,
        memo
      })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: '対象が見つかりません' });
    }

    res.json(data);
  } catch (error) {
    console.error('wishlist更新エラー:', error);
    res.status(500).json({ error: '更新に失敗しました' });
  }
});

// 欲しいもの削除（論理削除）
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('wishlist')
      .update({ is_active: false })
      .eq('id', id)
      .eq('user_id', req.user.userId)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: '対象が見つかりません' });
    }

    res.json({ message: '削除しました' });
  } catch (error) {
    console.error('wishlist削除エラー:', error);
    res.status(500).json({ error: '削除に失敗しました' });
  }
});

export default router;
