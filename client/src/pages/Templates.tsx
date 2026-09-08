import { useEffect, useState } from 'react';
import { getTemplates, createTemplate, deleteTemplate, applyTemplate } from '../api/templates';
import { getExercises } from '../api/exercises';

interface Exercise {
  id: number;
  name: string;
  category: string;
}

interface TemplateExercise {
  exerciseId: number;
  sets?: number;
  reps?: number;
  weight?: number;
  durationMin?: number;
}

export default function Templates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<TemplateExercise[]>([]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tpls, exs] = await Promise.all([getTemplates(), getExercises()]);
      setTemplates(tpls);
      setExercises(exs);
    } catch (err) {
      console.error(err);
      setMessage('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const addExerciseToTemplate = (exerciseId: number) => {
    if (!selectedExercises.find((e) => e.exerciseId === exerciseId)) {
      setSelectedExercises([...selectedExercises, { exerciseId }]);
    }
  };

  const updateExerciseField = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const removeExerciseFromTemplate = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setMessage('');
    if (!templateName || selectedExercises.length === 0) { setMessage('请填写模板名称并添加动作'); return; }
    setSubmitting(true);
    try {
      await createTemplate({ name: templateName, exercises: selectedExercises });
      setMessage('✅ 模板创建成功'); setTemplateName(''); setSelectedExercises([]); setShowForm(false); loadData();
    } catch (err: any) { setMessage(err.response?.data?.error || '创建失败'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定删除此模板吗？')) { await deleteTemplate(id); loadData(); }
  };

  const handleApply = async (id: number) => {
    setMessage('');
    try {
      const result = await applyTemplate(id);
      setMessage(`✅ 已应用模板，共添加 ${result.count} 个动作到今日记录`);
    } catch (err: any) { setMessage(err.response?.data?.error || '应用失败'); }
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', margin: 0 }}>训练模板 📋</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', border: '3px solid #2b2b2b', borderRadius: 30, background: '#4ecdc4', color: '#2b2b2b', fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{showForm ? '取消创建' : '➕ 新建模板'}</button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>📋 创建训练模板</h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>模板名称</label>
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="例如：胸肩日" style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>添加动作（可多次选择）</label>
            <select onChange={(e) => addExerciseToTemplate(Number(e.target.value))} defaultValue="" style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15, background: '#fff' }}>
              <option value="" disabled>选择动作</option>
              {exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name} ({ex.category === 'strength' ? '力量' : '有氧'})</option>)}
            </select>
          </div>

          {selectedExercises.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 15 }}>
              {selectedExercises.map((se, idx) => {
                const ex = exercises.find((e) => e.id === se.exerciseId);
                return (
                  <div key={idx} style={{ background: '#fff3e0', border: '3px solid #2b2b2b', borderRadius: 15, padding: 15 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <strong>{ex?.name}</strong>
                      <button type="button" onClick={() => removeExerciseFromTemplate(idx)} style={{ background: '#ff5e5b', color: '#fff', border: '2px solid #2b2b2b', borderRadius: 10, padding: '4px 8px', cursor: 'pointer' }}>移除</button>
                    </div>
                    {ex?.category === 'strength' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        <input type="number" placeholder="组数" onChange={(e) => updateExerciseField(idx, 'sets', Number(e.target.value))} style={{ width: '100%', padding: 8, border: '2px solid #2b2b2b', borderRadius: 10 }} />
                        <input type="number" placeholder="次数" onChange={(e) => updateExerciseField(idx, 'reps', Number(e.target.value))} style={{ width: '100%', padding: 8, border: '2px solid #2b2b2b', borderRadius: 10 }} />
                        <input type="number" placeholder="重量" onChange={(e) => updateExerciseField(idx, 'weight', Number(e.target.value))} style={{ width: '100%', padding: 8, border: '2px solid #2b2b2b', borderRadius: 10 }} />
                      </div>
                    ) : (
                      <input type="number" placeholder="时长(分钟)" onChange={(e) => updateExerciseField(idx, 'durationMin', Number(e.target.value))} style={{ width: '100%', padding: 8, border: '2px solid #2b2b2b', borderRadius: 10 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={handleCreate} disabled={submitting} style={{ padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{submitting ? '保存中...' : '保存模板'}</button>
          {message && <p style={{ marginTop: 15, fontWeight: 600 }}>{message}</p>}
        </div>
      )}

      {loading ? <p>加载中...</p> : templates.length === 0 ? <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 30, textAlign: 'center', boxShadow: '4px 4px 0 #2b2b2b' }}>还没有训练模板</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {templates.map((tpl) => (
            <div key={tpl.id} style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                <h3 style={{ fontSize: 18, margin: 0 }}>{tpl.name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleApply(tpl.id)} style={{ background: '#4ecdc4', color: '#2b2b2b', border: '2px solid #2b2b2b', borderRadius: 10, padding: '5px 10px', fontWeight: 700, cursor: 'pointer' }}>应用</button>
                  <button onClick={() => handleDelete(tpl.id)} style={{ background: '#ff5e5b', color: '#fff', border: '2px solid #2b2b2b', borderRadius: 10, padding: '5px 10px', fontWeight: 700, cursor: 'pointer' }}>删除</button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#6b705c', marginBottom: 10 }}>{tpl.exercises.length} 个动作</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tpl.exercises.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{item.exercise.name}</span>
                    <span style={{ color: '#6b705c' }}>{item.exercise.category === 'strength' ? `${item.sets || '-'}组 × ${item.reps || '-'}次 ${item.weight ? item.weight + 'kg' : ''}` : `${item.durationMin || '-'}分钟`}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}