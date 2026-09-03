import { useEffect, useState } from 'react';
import { getTemplates, createTemplate, deleteTemplate, applyTemplate } from '../api/templates';
import { getExercises } from '../api/exercises';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  useEffect(() => {
    loadData();
  }, []);

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
    if (!templateName || selectedExercises.length === 0) {
      setMessage('请填写模板名称并添加动作');
      return;
    }
    setSubmitting(true);
    try {
      await createTemplate({
        name: templateName,
        exercises: selectedExercises,
      });
      setMessage('✅ 模板创建成功');
      setTemplateName('');
      setSelectedExercises([]);
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定删除此模板吗？')) {
      await deleteTemplate(id);
      loadData();
    }
  };

  const handleApply = async (id: number) => {
  setMessage('');
  try {
    const result = await applyTemplate(id);
    // 跳转到运动记录页面，并通过 state 传递成功消息
    navigate('/record', {
      state: { message: `✅ 已应用模板，共添加 ${result.count} 个动作到今日记录` },
    });
  } catch (err: any) {
    setMessage(err.response?.data?.error || '应用失败');
  }
};

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 5 }}>训练模板</h1>
          <p style={{ color: '#a0a0b0' }}>保存常用动作组合，下次训练一键加载</p>
        </div>
        <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? '取消创建' : '➕ 新建模板'}
        </button>
      </div>

      {/* 创建模板表单 */}
      {showForm && (
        <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
          <h3 style={{ marginBottom: 20, fontSize: 18 }}>📋 创建训练模板</h3>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>模板名称</label>
            <input
              className="input-field"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="例如：胸肩日"
            />
          </div>

          <div style={{ marginBottom: 15 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>添加动作（可多次选择）</label>
            <select
              className="input-field"
              onChange={(e) => addExerciseToTemplate(Number(e.target.value))}
              defaultValue=""
            >
              <option value="" disabled>选择动作</option>
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.category === 'strength' ? '力量' : '有氧'})
                </option>
              ))}
            </select>
          </div>

          {selectedExercises.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 15 }}>
              {selectedExercises.map((se, idx) => {
                const ex = exercises.find((e) => e.id === se.exerciseId);
                return (
                  <div key={idx} className="glass-card" style={{ padding: 15 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <strong>{ex?.name}</strong>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
                        onClick={() => removeExerciseFromTemplate(idx)}
                      >
                        移除
                      </button>
                    </div>
                    {ex?.category === 'strength' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#a0a0b0', marginBottom: 4 }}>组数</label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="组数"
                            onChange={(e) => updateExerciseField(idx, 'sets', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#a0a0b0', marginBottom: 4 }}>次数</label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="次数"
                            onChange={(e) => updateExerciseField(idx, 'reps', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 12, color: '#a0a0b0', marginBottom: 4 }}>重量(kg)</label>
                          <input
                            type="number"
                            className="input-field"
                            placeholder="重量"
                            onChange={(e) => updateExerciseField(idx, 'weight', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label style={{ display: 'block', fontSize: 12, color: '#a0a0b0', marginBottom: 4 }}>时长(分钟)</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="时长"
                          onChange={(e) => updateExerciseField(idx, 'durationMin', Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button className="btn-primary" disabled={submitting} onClick={handleCreate}>
            {submitting ? '保存中...' : '保存模板'}
          </button>
          {message && <p style={{ marginTop: 15, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}
        </div>
      )}

      {/* 模板列表 */}
      {loading ? (
        <p style={{ color: '#666' }}>加载中...</p>
      ) : templates.length === 0 ? (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          还没有训练模板，点击上方按钮创建第一个模板吧！
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {templates.map((tpl) => (
            <div key={tpl.id} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                <h3 style={{ fontSize: 18 }}>{tpl.name}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '5px 12px', fontSize: 12 }}
                    onClick={() => handleApply(tpl.id)}
                  >
                    应用
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ width: 'auto', padding: '5px 10px', fontSize: 12 }}
                    onClick={() => handleDelete(tpl.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
              <div style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 10 }}>
                {tpl.exercises.length} 个动作
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tpl.exercises.map((item: any) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <span>{item.exercise.name}</span>
                    <span style={{ color: '#a0a0b0' }}>
                      {item.exercise.category === 'strength'
                        ? `${item.sets || '-'}组 × ${item.reps || '-'}次 ${item.weight ? item.weight + 'kg' : ''}`
                        : `${item.durationMin || '-'}分钟`}
                    </span>
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