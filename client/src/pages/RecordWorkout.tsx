import { useEffect, useState } from 'react';
import { getExercises } from '../api/exercises';
import { addRecord, getRecords, deleteRecord } from '../api/record';
import { useAuthStore } from '../store/authStore';

interface Exercise { id: number; name: string; category: string; met: number; }
interface Record { id: number; exercise: Exercise; sets: number | null; reps: number | null; weight: number | null; durationMin: number | null; caloriesBurned: number; }

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
  const token = useAuthStore((state) => state.token);

  const loadData = async () => {
    try {
      const [exData, recData] = await Promise.all([getExercises(), getRecords(today)]);
      setExercises(exData);
      setRecords(recData);
    } catch (err) { console.error(err); setMessage('加载数据失败'); }
  };

  useEffect(() => { loadData(); }, []);

  const selectedExercise = exercises.find((ex) => ex.id === Number(selectedExerciseId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!selectedExerciseId) { setMessage('请选择动作'); return; }
    const payload: any = { exerciseId: Number(selectedExerciseId), date: today };
    if (selectedExercise?.category === 'strength') {
      if (!sets || !reps) { setMessage('力量训练请填写组数和次数'); return; }
      payload.sets = Number(sets); payload.reps = Number(reps);
      if (weight) payload.weight = Number(weight);
    } else {
      if (!durationMin) { setMessage('有氧运动请填写时长（分钟）'); return; }
      payload.durationMin = Number(durationMin);
    }
    setLoading(true);
    try {
      const newRecord = await addRecord(payload);
      setMessage(`✅ 记录成功！消耗 ${newRecord.caloriesBurned.toFixed(1)} kcal`);
      setSelectedExerciseId(''); setSets(''); setReps(''); setWeight(''); setDurationMin('');
      const recData = await getRecords(today); setRecords(recData);
    } catch (err: any) { setMessage(err.response?.data?.error || '记录失败'); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这条运动记录吗？')) return;
    try { await deleteRecord(id); const recData = await getRecords(today); setRecords(recData); setMessage('✅ 已删除该记录'); } catch (err: any) { setMessage(err.response?.data?.error || '删除失败'); }
  };

  const totalCalories = records.reduce((sum, rec) => sum + rec.caloriesBurned, 0);

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', marginBottom: 20 }}>运动记录 🏋️</h1>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>选择动作</label>
              <select value={selectedExerciseId} onChange={(e) => setSelectedExerciseId(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15, background: '#fff' }}>
                <option value="">-- 请选择 --</option>
                {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name} ({ex.category === 'strength' ? '力量' : '有氧'})</option>)}
              </select>
            </div>
            {selectedExercise?.category === 'strength' ? (
              <>
                <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>组数</label><input type="number" value={sets} onChange={(e) => setSets(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
                <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>每组次数</label><input type="number" value={reps} onChange={(e) => setReps(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
                <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>重量(kg) 可选</label><input type="number" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
              </>
            ) : (
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>时长（分钟）</label><input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
            )}
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: 20, padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{loading ? '提交中...' : '添加记录'}</button>
        </form>
        {message && <p style={{ marginTop: 15, fontWeight: 600 }}>{message}</p>}
      </div>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
          <h3 style={{ fontSize: 20, margin: 0 }}>今日记录</h3>
          <span style={{ fontWeight: 800, color: '#ff6b9d' }}>{totalCalories.toFixed(0)} kcal</span>
        </div>
        {records.length === 0 ? <p>暂无记录</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {records.map((rec) => (
              <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottom: '2px dashed #ddd' }}>
                <span>{rec.exercise.name} - {rec.exercise.category === 'strength' ? `${rec.sets}组x${rec.reps}次 ${rec.weight ? `(${rec.weight}kg)` : ''}` : `${rec.durationMin}分钟`}</span>
                <span style={{ color: '#4ecdc4', fontWeight: 700 }}>{rec.caloriesBurned.toFixed(1)} kcal</span>
                <button onClick={() => handleDelete(rec.id)} style={{ background: 'transparent', border: '2px solid #ff5e5b', color: '#ff5e5b', borderRadius: 10, padding: '4px 8px', cursor: 'pointer' }}>删除</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}