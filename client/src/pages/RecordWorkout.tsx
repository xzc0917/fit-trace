import { useEffect, useState } from 'react';
import { getExercises } from '../api/exercises';
import { addRecord, getRecords, deleteRecord} from '../api/record';
import { useLocation } from 'react-router-dom';
interface Exercise {
  id: number;
  name: string;
  category: string;
  met: number;
}

interface Record {
  id: number;
  exercise: Exercise;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  durationMin: number | null;
  caloriesBurned: number;
}

export default function RecordWorkout() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | ''>('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const location = useLocation();
  const loadData = async () => {
    try {
      const [exData, recData] = await Promise.all([getExercises(), getRecords(today)]);
      setExercises(exData);
      setRecords(recData);
    } catch (err) {
      console.error(err);
      setMessage('加载数据失败');
    }
  };

  useEffect(() => {
  loadData();
  // 检查是否有从模板页面传来的消息
  const state = location.state as { message?: string } | null;
  if (state?.message) {
    setMessage(state.message);
    // 清除 state，防止刷新后重复显示
    window.history.replaceState({}, document.title);
  }
}, []);

  const selectedExercise = exercises.find((ex) => ex.id === Number(selectedExerciseId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedExerciseId) {
      setMessage('请选择动作');
      return;
    }

    const payload: any = {
      exerciseId: Number(selectedExerciseId),
      date: today,
    };

    if (selectedExercise?.category === 'strength') {
      if (!sets || !reps) {
        setMessage('力量训练请填写组数和次数');
        return;
      }
      payload.sets = Number(sets);
      payload.reps = Number(reps);
      if (weight) payload.weight = Number(weight);
    } else {
      if (!durationMin) {
        setMessage('有氧运动请填写时长（分钟）');
        return;
      }
      payload.durationMin = Number(durationMin);
    }

    setLoading(true);
    try {
      const newRecord = await addRecord(payload);
      setMessage(`✅ 记录成功！消耗 ${newRecord.caloriesBurned.toFixed(1)} kcal`);
      setSelectedExerciseId('');
      setSets('');
      setReps('');
      setWeight('');
      setDurationMin('');
      const recData = await getRecords(today);
      setRecords(recData);
    } catch (err: any) {
      setMessage(err.response?.data?.error || '记录失败');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
  if (!confirm('确定删除这条运动记录吗？')) return;
  try {
    await deleteRecord(id);
    setMessage('✅ 已删除该记录');
    const recData = await getRecords(today);
    setRecords(recData);
  } catch (err: any) {
    setMessage(err.response?.data?.error || '删除失败');
  }
};

  const totalCalories = records.reduce((sum, rec) => sum + rec.caloriesBurned, 0);

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 className="page-title" style={{ marginBottom: 5 }}>运动记录</h1>
        <p style={{ color: '#a0a0b0' }}>记录今天的训练内容，系统会自动计算热量消耗</p>
      </div>

      {/* 表单卡片 */}
      <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>🏋️ 添加运动记录</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>选择动作</label>
            <select
              className="input-field"
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value === '' ? '' : Number(e.target.value))}
              required
            >
              <option value="">-- 请选择动作 --</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.category === 'strength' ? '力量' : '有氧'})
                </option>
              ))}
            </select>
          </div>

          {selectedExercise?.category === 'strength' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>组数</label>
                <input type="number" className="input-field" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="例如：4" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>每组次数</label>
                <input type="number" className="input-field" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="例如：12" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>重量 (kg) 可选</label>
                <input type="number" step="0.5" className="input-field" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="例如：20" />
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>时长（分钟）</label>
              <input type="number" className="input-field" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} placeholder="例如：30" />
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? '提交中...' : '添加记录'}
          </button>
        </form>
        {message && <p style={{ marginTop: 15, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}
      </div>

      {/* 今日记录列表 */}
      <div className="glass-card" style={{ padding: 25 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
          <h3 style={{ fontSize: 18 }}>📋 今日记录</h3>
          <span style={{ color: '#00ff88', fontWeight: 700, fontSize: 18 }}>共 {totalCalories.toFixed(0)} kcal</span>
        </div>
        {records.length === 0 ? (
          <p style={{ color: '#666' }}>还没有记录，开始添加吧！</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>动作</th>
                <th>详情</th>
                <th>消耗</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
  <tr key={rec.id}>
    <td>{rec.exercise.name}</td>
    <td>
      {rec.exercise.category === 'strength'
        ? `${rec.sets}组 × ${rec.reps}次 ${rec.weight ? `(${rec.weight}kg)` : ''}`
        : `${rec.durationMin}分钟`}
    </td>
    <td style={{ color: '#00ff88', fontWeight: 600 }}>{rec.caloriesBurned.toFixed(1)} kcal</td>
    <td>
      <button
        className="btn-secondary"
        style={{ width: 'auto', padding: '5px 10px', fontSize: 12, color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
        onClick={() => handleDelete(rec.id)}
      >
        删除
      </button>
    </td>
  </tr>
))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}