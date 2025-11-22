import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';

export default function Settings({ onClose, onUpdate }) {
  const [monthlyLimit, setMonthlyLimit] = useState(30000);
  const [warningThreshold, setWarningThreshold] = useState(25000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettings();
      setMonthlyLimit(data.monthly_limit);
      setWarningThreshold(data.warning_threshold);
    } catch (error) {
      console.error('設定取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        monthly_limit: monthlyLimit,
        warning_threshold: warningThreshold
      });
      alert('設定を保存しました');
      onUpdate && onUpdate({ monthlyLimit, warningThreshold });
      onClose && onClose();
    } catch (error) {
      alert('設定の保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-modal">読み込み中...</div>;
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2>設定</h2>

        <div className="settings-form">
          <div className="form-group">
            <label>今月の限度額（円）</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              min="0"
              step="1000"
            />
          </div>

          <div className="form-group">
            <label>警告を出す金額（円）</label>
            <input
              type="number"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              min="0"
              step="1000"
            />
            <small>この金額を超えると警告が表示されます</small>
          </div>

          <div className="settings-buttons">
            <button onClick={onClose} className="btn-cancel">
              キャンセル
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-save">
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
