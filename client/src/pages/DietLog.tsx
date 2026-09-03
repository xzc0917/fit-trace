import { useEffect, useState } from 'react';
import { addFoodEntry, getFoodEntries } from '../api/food';

interface FoodEntry {
  id: number;
  mealType: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

export default function DietLog() {
  const [mealType, setMealType] = useState('breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('g');
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  

  // 固定为当天日期
  const today = new Date().toISOString().slice(0, 10);

  const loadEntries = async () => {
    try {
      const data = await getFoodEntries(today);
      setEntries(data);
    } catch (err) {
      console.error(err);
      setMessage('加载饮食记录失败');
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!foodName || !quantity) {
      setMessage('请填写食物名称和分量');
      return;
    }

    setLoading(true);
    try {
      const newEntry = await addFoodEntry({
        date: today,
        mealType,
        foodName,
        quantity: Number(quantity),
        unit,
      });
      setMessage(`✅ 已添加：${newEntry.foodName}，估算热量 ${newEntry.calories.toFixed(0)} kcal`);
      setFoodName('');
      setQuantity('');
      loadEntries();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '添加失败');
    } finally {
      setLoading(false);
    }
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein = entries.reduce((sum, e) => sum + e.protein, 0);
  const totalCarbs = entries.reduce((sum, e) => sum + e.carbs, 0);
  const totalFat = entries.reduce((sum, e) => sum + e.fat, 0);

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 className="page-title" style={{ marginBottom: 5 }}>饮食记录</h1>
        <p style={{ color: '#a0a0b0' }}>记录每天吃的食物，AI 会自动估算热量和营养</p>
      </div>

      {/* 添加食物表单 */}
      <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>🍽️ 添加食物（{today}）</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>餐次</label>
              <select className="input-field" value={mealType} onChange={(e) => setMealType(e.target.value)}>
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">加餐</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>食物名称</label>
              <input
                className="input-field"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="例如：鸡胸肉、米饭"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>分量</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="例如：200"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>单位</label>
              <select className="input-field" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="g">克</option>
                <option value="ml">毫升</option>
                <option value="个">个</option>
                <option value="份">份</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'AI 分析中...' : '添加食物'}
          </button>
        </form>
        {message && <p style={{ marginTop: 15, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}
      </div>

      {/* 今日饮食汇总 */}
      <div className="glass-card" style={{ padding: 25 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h3 style={{ fontSize: 18 }}>📋 {today} 饮食记录</h3>
          <span style={{ color: '#00ff88', fontWeight: 700, fontSize: 18 }}>总 {totalCalories.toFixed(0)} kcal</span>
        </div>

        {entries.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15, marginBottom: 20 }}>
            <div className="glass-card" style={{ padding: 15, textAlign: 'center' }}>
              <div style={{ color: '#a0a0b0', fontSize: 13 }}>蛋白质</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#00ff88' }}>{totalProtein.toFixed(1)}g</div>
            </div>
            <div className="glass-card" style={{ padding: 15, textAlign: 'center' }}>
              <div style={{ color: '#a0a0b0', fontSize: 13 }}>碳水</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6' }}>{totalCarbs.toFixed(1)}g</div>
            </div>
            <div className="glass-card" style={{ padding: 15, textAlign: 'center' }}>
              <div style={{ color: '#a0a0b0', fontSize: 13 }}>脂肪</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#ff6b35' }}>{totalFat.toFixed(1)}g</div>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <p style={{ color: '#666' }}>暂无记录</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>餐次</th>
                <th>食物</th>
                <th>分量</th>
                <th>热量</th>
                <th>蛋白质</th>
                <th>碳水</th>
                <th>脂肪</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td>{mealTypeLabels[e.mealType] || e.mealType}</td>
                  <td>{e.foodName}</td>
                  <td>{e.quantity}{e.unit}</td>
                  <td style={{ color: '#00ff88', fontWeight: 600 }}>{e.calories.toFixed(1)}</td>
                  <td>{e.protein.toFixed(1)}</td>
                  <td>{e.carbs.toFixed(1)}</td>
                  <td>{e.fat.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}