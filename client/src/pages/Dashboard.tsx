import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getSummary } from '../api/summary';
import { getHistory } from '../api/history';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [range, setRange] = useState(7);
  const [activeTab, setActiveTab] = useState<'weight' | 'calories' | 'nutrition'>('weight');

  useEffect(() => {
    const loadData = async () => {
      try {
        const sum = await getSummary();
        setSummary(sum);
        const today = new Date();
        const from = new Date(today);
        from.setDate(today.getDate() - (range - 1));
        const hist = await getHistory(from.toISOString().slice(0,10), today.toISOString().slice(0,10));
        setHistory(hist);
      } catch (err) { console.error(err); }
    };
    loadData();
  }, [range]);

  const stats = summary ? [
    { label: '运动消耗', value: `${Number(summary.totalBurned).toFixed(1)} kcal`, icon: '🔥', color: '#ff6b9d' },
    { label: '饮食摄入', value: `${Number(summary.totalIntake).toFixed(1)} kcal`, icon: '🍔', color: '#4ecdc4' },
    { label: summary.netCalories >= 0 ? '热量盈余' : '热量缺口', value: `${Math.abs(Math.round(summary.netCalories))} kcal`, icon: '⚡', color: summary.netCalories >= 0 ? '#ff6b9d' : '#4ecdc4' },
    { label: '今日体重', value: summary.weight ? `${Number(summary.weight).toFixed(1)} kg` : '未记录', icon: '🎯', color: '#ffb347' },
  ] : [];

  return (
    <div style={{ background: '#fff3e0', minHeight: '100vh', padding: 20, fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      {/* 顶部 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 40, margin: 0, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b' }}>HEY! {user?.nickname} ✨</h1>
          <p style={{ color: '#2b2b2b', marginTop: 8, fontSize: 18 }}>今天也要元气满满哦～</p>
        </div>
        <button
          onClick={() => navigate('/record')}
          style={{ background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', padding: '12px 24px', borderRadius: 30, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}
        >
          ➕ 快速记录
        </button>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 20, marginBottom: 30 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: s.color, border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ color: '#fff', fontSize: 14, marginBottom: 8, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#2b2b2b' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* 范围切换 */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button onClick={() => setRange(7)} style={{ padding: '10px 20px', border: '3px solid #2b2b2b', borderRadius: 20, background: range===7 ? '#ffe66d' : '#fff', color: '#2b2b2b', fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>7天</button>
        <button onClick={() => setRange(30)} style={{ padding: '10px 20px', border: '3px solid #2b2b2b', borderRadius: 20, background: range===30 ? '#ffe66d' : '#fff', color: '#2b2b2b', fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>30天</button>
      </div>

      {/* 图表卡片 */}
      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {['weight', 'calories', 'nutrition'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} style={{ padding: '8px 16px', border: '3px solid #2b2b2b', borderRadius: 20, background: activeTab===tab ? '#ff6b9d' : '#fff', color: '#2b2b2b', fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>
              {tab === 'weight' ? '📈 体重' : tab === 'calories' ? '🔥 热量' : '🥗 营养'}
            </button>
          ))}
        </div>
        <div style={{ minHeight: 250 }}>
          {activeTab === 'weight' && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="date" stroke="#2b2b2b" />
                <YAxis stroke="#2b2b2b" />
                <Tooltip contentStyle={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, color: '#2b2b2b' }} />
                <Line type="monotone" dataKey="weight" stroke="#ff6b9d" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
          {activeTab === 'calories' && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                <XAxis dataKey="date" stroke="#2b2b2b" />
                <YAxis stroke="#2b2b2b" />
                <Tooltip contentStyle={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, color: '#2b2b2b' }} />
                <Bar dataKey="caloriesIntake" fill="#4ecdc4" name="摄入" radius={[6,6,0,0]} />
                <Bar dataKey="caloriesBurned" fill="#ffb347" name="消耗" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {activeTab === 'nutrition' && summary && (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={[
                  { name: '蛋白质', value: summary.protein },
                  { name: '碳水', value: summary.carbs },
                  { name: '脂肪', value: summary.fat },
                ]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#ff6b9d" />
                  <Cell fill="#ffe66d" />
                  <Cell fill="#4ecdc4" />
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, color: '#2b2b2b' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}