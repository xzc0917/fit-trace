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
        const fromStr = from.toISOString().slice(0, 10);
        const toStr = today.toISOString().slice(0, 10);

        const hist = await getHistory(fromStr, toStr);
        setHistory(hist);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, [range]);

  const stats = summary ? [
  { label: '运动消耗', value: `${Number(summary.totalBurned).toFixed(1)} kcal`, icon: '🔥', color: '#00ff88', valueColor: '#fff' },
  { label: '饮食摄入', value: `${Number(summary.totalIntake).toFixed(1)} kcal`, icon: '🍔', color: '#ff6b35', valueColor: '#fff' },
  { 
    label: summary.netCalories >= 0 ? '热量盈余' : '热量缺口',
    value: `${Math.abs(Math.round(summary.netCalories))} kcal`,
    icon: '⚖️',
    color: summary.netCalories >= 0 ? '#ff6b6b' : '#00ff88',
    valueColor: summary.netCalories >= 0 ? '#ff6b6b' : '#00ff88' // 数字颜色同状态
  },
  { label: '今日体重', value: summary.weight ? `${Number(summary.weight).toFixed(1)} kg` : '未记录', icon: '📏', color: '#8b5cf6', valueColor: '#fff' },
] : [];

  const pieData = summary ? [
  { name: '蛋白质', value: Number(summary.protein.toFixed(1)) },
  { name: '碳水', value: Number(summary.carbs.toFixed(1)) },
  { name: '脂肪', value: Number(summary.fat.toFixed(1)) },
] : [];

  const COLORS = ['#00ff88', '#8b5cf6', '#ff6b35'];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 5 }}>首页</h1>
<p style={{ color: '#a0a0b0' }}>你好，{user?.nickname} 👋，这是你今天的健康数据概览</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate('/record')} style={{ width: 'auto', padding: '10px 20px' }}>
          ➕ 快速记录
        </button>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 30 }}>
        {stats.map((s, i) => (
          <div key={i} className="glass-card" style={{ borderLeft: `4px solid ${s.color}`, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 32 }}>{s.icon}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#a0a0b0', fontSize: 15, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 30, fontWeight: 700, color: s.valueColor }}>{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 范围切换 */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <button
          className={range === 7 ? 'btn-primary' : 'btn-secondary'}
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => setRange(7)}
        >
          最近7天
        </button>
        <button
          className={range === 30 ? 'btn-primary' : 'btn-secondary'}
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => setRange(30)}
        >
          最近30天
        </button>
      </div>

      {/* 图表标签页切换 */}
      <div className="glass-card" style={{ padding: 25 }}>
        {/* 标签按钮 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <button
            className={activeTab === 'weight' ? 'btn-primary' : 'btn-secondary'}
            style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}
            onClick={() => setActiveTab('weight')}
          >
            📈 体重趋势
          </button>
          <button
            className={activeTab === 'calories' ? 'btn-primary' : 'btn-secondary'}
            style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}
            onClick={() => setActiveTab('calories')}
          >
            🔥 热量趋势
          </button>
          <button
            className={activeTab === 'nutrition' ? 'btn-primary' : 'btn-secondary'}
            style={{ width: 'auto', padding: '8px 16px', fontSize: 14 }}
            onClick={() => setActiveTab('nutrition')}
          >
            🥗 营养占比
          </button>
        </div>

        {/* 图表内容 */}
        <div style={{ minHeight: 280 }}>
          {activeTab === 'weight' && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#a0a0b0" fontSize={12} />
                <YAxis domain={['auto', 'auto']} stroke="#a0a0b0" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="weight" stroke="#8b5cf6" name="体重(kg)" connectNulls strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'calories' && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="date" stroke="#a0a0b0" fontSize={12} />
                <YAxis stroke="#a0a0b0" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="caloriesIntake" fill="#ff6b35" name="摄入(kcal)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="caloriesBurned" fill="#00ff88" name="消耗(kcal)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'nutrition' && (
            summary && (summary.protein + summary.carbs + summary.fat) > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#fff',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280, color: '#666' }}>
                暂无营养数据，请先记录今日饮食
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}