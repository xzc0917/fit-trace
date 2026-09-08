import { useEffect, useState } from 'react';
import { addFoodEntry, getFoodEntries } from '../api/food';

interface FoodEntry { id: number; mealType: string; foodName: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number; }

const mealTypeLabels: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' };

export default function DietLog() {
  const [mealType, setMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const loadEntries = async () => { try { const data = await getFoodEntries(today); setEntries(data); } catch (err) { console.error(err); } };
  useEffect(() => { loadEntries(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    if (!foodName || !quantity) { setMessage('请填写食物名称和分量'); return; }
    setLoading(true);
    try {
      const newEntry = await addFoodEntry({ date: today, mealType, foodName, quantity: Number(quantity), unit });
      setMessage(`✅ 已添加：${newEntry.foodName}，估算热量 ${newEntry.calories.toFixed(0)} kcal`);
      setFoodName(''); setQuantity(''); loadEntries();
    } catch (err: any) { setMessage(err.response?.data?.error || '添加失败'); } finally { setLoading(false); }
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', marginBottom: 20 }}>饮食记录 🥗</h1>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>餐次</label>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }}>
                <option value="breakfast">早餐</option><option value="lunch">午餐</option><option value="dinner">晚餐</option><option value="snack">加餐</option>
              </select>
            </div>
            <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>食物名称</label><input value={foodName} onChange={(e) => setFoodName(e.target.value)} placeholder="例如：鸡胸肉、米饭" style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
            <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>分量</label><input type="number" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="例如：200" style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
            <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>单位</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }}>
                <option value="g">克</option><option value="ml">毫升</option><option value="个">个</option><option value="份">份</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 20, padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{loading ? 'AI 分析中...' : '添加食物'}</button>
        </form>
        {message && <p style={{ marginTop: 15, fontWeight: 600 }}>{message}</p>}
      </div>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
          <h3 style={{ fontSize: 20, margin: 0 }}>今日饮食</h3>
          <span style={{ fontWeight: 800, color: '#ff6b9d' }}>{totalCalories.toFixed(0)} kcal</span>
        </div>
        {entries.length === 0 ? <p>暂无记录</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map((e) => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '2px dashed #ddd' }}>
                <span>{mealTypeLabels[e.mealType]} - {e.foodName} {e.quantity}{e.unit}</span>
                <span style={{ color: '#4ecdc4', fontWeight: 700 }}>{e.calories.toFixed(1)} kcal</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}