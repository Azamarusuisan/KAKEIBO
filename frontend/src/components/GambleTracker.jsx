import { useState, useEffect } from 'react';
import { getGambleStatus, gambleCheckin } from '../api';

export default function GambleTracker() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const data = await getGambleStatus();
      setStatus(data);
    } catch (error) {
      console.error('ステータス取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckin = async (didGamble) => {
    // 確認ダイアログ
    if (didGamble) {
      const confirmed = confirm('本当にギャンブルしましたか？\n\n間違いではありませんか？');
      if (!confirmed) return;
    } else {
      const confirmed = confirm('本当にギャンブルしていませんか？\n\n正直に答えてください。');
      if (!confirmed) return;
    }

    setChecking(true);
    try {
      const result = await gambleCheckin(didGamble);
      setStatus({
        checkedToday: true,
        didGambleToday: didGamble,
        streak: result.streak
      });
    } catch (error) {
      alert('チェックインに失敗しました');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return <div className="gamble-tracker">読み込み中...</div>;
  }

  return (
    <div className="gamble-tracker">
      {!status?.checkedToday ? (
        <div className="gamble-question">
          <h3>今日ギャンブルしましたか？</h3>
          <div className="gamble-buttons">
            <button
              className="btn-no-gamble"
              onClick={() => handleCheckin(false)}
              disabled={checking}
            >
              していない
            </button>
            <button
              className="btn-yes-gamble"
              onClick={() => handleCheckin(true)}
              disabled={checking}
            >
              してしまった
            </button>
          </div>
        </div>
      ) : (
        <div className="gamble-result">
          {status.didGambleToday ? (
            <div className="gamble-relapse">
              <p>また明日から頑張りましょう</p>
              <p className="streak-reset">連続記録がリセットされました</p>
            </div>
          ) : (
            <div className="gamble-success">
              <p className="streak-count">{status.streak}日間</p>
              <p className="streak-label">ギャンブルしていません！</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
