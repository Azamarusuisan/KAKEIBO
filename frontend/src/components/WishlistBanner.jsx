import { useState, useEffect } from 'react';
import { getWishlist, addWishlistItem, deleteWishlistItem } from '../api';

export default function WishlistBanner({ gambleStreak }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    target_url: '',
    target_amount: '',
    memo: ''
  });

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (error) {
      console.error('ウィッシュリスト取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('名前を入力してください');
      return;
    }

    try {
      await addWishlistItem({
        name: formData.name,
        image_url: formData.image_url || null,
        target_url: formData.target_url || null,
        target_amount: formData.target_amount ? parseInt(formData.target_amount) : null,
        memo: formData.memo || null
      });
      setFormData({ name: '', image_url: '', target_url: '', target_amount: '', memo: '' });
      setShowAddForm(false);
      await loadWishlist();
    } catch (error) {
      alert('追加に失敗しました');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('この目標を削除しますか？')) return;
    try {
      await deleteWishlistItem(id);
      await loadWishlist();
    } catch (error) {
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="wishlist-section">
      {/* ギャンブルやめれたねバナー */}
      {gambleStreak > 0 && (
        <div className="congrats-banner">
          <p className="congrats-text">ギャンブルやめれたね！</p>
          <p className="congrats-sub">これのために日々頑張りましょう</p>
        </div>
      )}

      {/* ブランドリンク */}
      <div className="brand-links">
        <a href="https://jp.louisvuitton.com/jpn-jp/homepage" target="_blank" rel="noopener noreferrer" className="brand-link vuitton">
          Louis Vuitton
        </a>
        <a href="https://www.prada.com/jp/ja.html" target="_blank" rel="noopener noreferrer" className="brand-link prada">
          Prada
        </a>
      </div>

      {/* 欲しいものリスト */}
      <div className="wishlist-card">
        <div className="wishlist-header">
          <h3>欲しいもの目標</h3>
          <button
            className="add-wishlist-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '閉じる' : '+ 追加'}
          </button>
        </div>

        {/* 追加フォーム */}
        {showAddForm && (
          <form className="wishlist-form" onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="欲しいもの名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="url"
              placeholder="画像URL（任意）"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
            <input
              type="url"
              placeholder="商品ページURL（任意）"
              value={formData.target_url}
              onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
            />
            <input
              type="number"
              placeholder="目標金額（任意）"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            />
            <input
              type="text"
              placeholder="メモ（任意）"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
            />
            <button type="submit" className="submit-wishlist-btn">追加する</button>
          </form>
        )}

        {/* リスト表示 */}
        {wishlist.length > 0 ? (
          <ul className="wishlist-items">
            {wishlist.map((item) => (
              <li key={item.id} className="wishlist-item">
                {item.image_url && (
                  <img src={item.image_url} alt={item.name} className="wishlist-image" />
                )}
                <div className="wishlist-info">
                  <span className="wishlist-name">{item.name}</span>
                  {item.target_amount && (
                    <span className="wishlist-amount">
                      目標: ¥{item.target_amount.toLocaleString()}
                    </span>
                  )}
                  {item.memo && (
                    <span className="wishlist-memo">{item.memo}</span>
                  )}
                </div>
                <div className="wishlist-actions">
                  {item.target_url && (
                    <a
                      href={item.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="wishlist-link-btn"
                    >
                      見る
                    </a>
                  )}
                  <button
                    className="wishlist-delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="wishlist-empty">まだ目標がありません。追加しましょう！</p>
        )}
      </div>
    </div>
  );
}
