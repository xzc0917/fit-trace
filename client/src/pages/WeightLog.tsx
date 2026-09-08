import { useEffect, useState } from 'react';
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

  useEffect(() => { loadLogs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    if (!weight) { setMessage('请输入体重'); return; }
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await addWeightLog({ date: today, weight: Number(weight) });
      setMessage('✅ 体重记录成功'); setWeight(''); loadLogs();
    } catch (err: any) { setMessage(err.response?.data?.error || '记录失败'); } finally { setLoading(false); }
  };

  const latestWeight = logs.length > 0 ? logs[logs.length - 1].weight : null;
  const firstWeight = logs.length > 0 ? logs[0].weight : null;
  const weightChange = latestWeight !== null && firstWeight !== null ? (latestWeight - firstWeight).toFixed(1) : null;

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', marginBottom: 20 }}>体重记录 ⚖️</h1>

      {logs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 20 }}>
          <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '3px 3px 0 #2b2b2b' }}>
            <div style={{ color: '#2b2b2b', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>最新体重</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#4ecdc4' }}>{latestWeight} kg</div>
          </div>
          <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '3px 3px 0 #2b2b2b' }}>
            <div style={{ color: '#2b2b2b', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>起始体重</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ffb347' }}>{firstWeight} kg</div>
          </div>
          <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '3px 3px 0 #2b2b2b' }}>
            <div style={{ color: '#2b2b2b', fontWeight: 700, fontSize: 13, marginBottom: 6 }}>总变化</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: Number(weightChange) > 0 ? '#ff5e5b' : '#4ecdc4' }}>
              {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
            </div>
          </div>
        </div>
      )}

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, marginBottom: 15 }}>⚖️ 记录今日体重</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>今日体重 (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="例如：70.5" style={{ width: '100%', padding: 14, border: '3px solid #2b2b2b', borderRadius: 20, fontSize: 16 }} />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 20, padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{loading ? '保存中...' : '保存记录'}</button>
        </form>
        {message && <p style={{ marginTop: 15, fontWeight: 600 }}>{message}</p>}
      </div>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
        <h3 style={{ fontSize: 20, marginBottom: 15 }}>📋 最近记录</h3>
        {logs.length === 0 ? <p>暂无记录</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {logs.slice().reverse().map((log) => (
              <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '2px dashed #ddd' }}>
                <span>{log.date}</span>
                <span style={{ fontWeight: 700, color: '#4ecdc4' }}>{log.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}