import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { addWeightLog, getWeightLogs } from '../api/weight';

export default function WeightLog() {
  const [weight, setWeight] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    try {
      const data = await getWeightLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      setMessage('加载体重记录失败');
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!weight) {
      setMessage('请输入体重');
      return;
    }

    setLoading(true);
    try {
      // 直接使用当天日期
      const today = new Date().toISOString().slice(0, 10);
      await addWeightLog({ date: today, weight: Number(weight) });
      setMessage('✅ 体重记录成功');
      setWeight('');
      loadLogs();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '记录失败');
    } finally {
      setLoading(false);
    }
  };

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : null;
  const firstWeight = logs.length > 0 ? logs[0].weight : null;
  const weightChange = latestWeight !== null && firstWeight !== null
    ? (latestWeight - firstWeight).toFixed(1)
    : null;

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 className="page-title" style={{ marginBottom: 5 }}>体重记录</h1>
        <p style={{ color: '#a0a0b0' }}>每天记录体重，系统会生成趋势图帮你了解身体变化</p>
      </div>

      {/* 统计概览 */}
      {logs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20, marginBottom: 30 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 5 }}>最新体重</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#00ff88' }}>{latestWeight} kg</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 5 }}>起始体重</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{firstWeight} kg</div>
          </div>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 5 }}>总变化</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: Number(weightChange) > 0 ? '#ff6b6b' : '#00ff88' }}>
              {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
            </div>
          </div>
        </div>
      )}

      {/* 记录表单 */}
      <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>⚖️ 记录今日体重</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>今日体重 (kg)</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="例如：70.5"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? '保存中...' : '保存记录'}
          </button>
        </form>
        {message && <p style={{ marginTop: 15, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}
      </div>

      {/* 历史记录 */}
      <div className="glass-card" style={{ padding: 25 }}>
        <h3 style={{ marginBottom: 15, fontSize: 18 }}>📋 最近记录</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#666' }}>还没有体重记录</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>日期</th>
                <th>体重</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice().reverse().map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td style={{ fontWeight: 600 }}>{log.weight} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}