import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getExercises, createCustomExercise, updateCustomExercise, deleteCustomExercise } from '../api/exercises';
import { useAuthStore } from '../store/authStore';

interface Exercise {
  id: number;
  name: string;
  category: string;
  met: number;
  isCustom: boolean;
}

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('strength');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('strength');

  const loadExercises = async () => {
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (err) {
      console.error(err);
      setMessage('加载动作库失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  const strengthExercises = exercises.filter((ex) => ex.category === 'strength');
  const cardioExercises = exercises.filter((ex) => ex.category === 'cardio');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!newName) {
      setMessage('请填写动作名称');
      return;
    }
    setSubmitting(true);
    try {
      await createCustomExercise({ name: newName, category: newCategory });
      setNewName('');
      setShowForm(false);
      loadExercises();
      setMessage('✅ 自定义动作添加成功');
    } catch (err: any) {
      setMessage(err.response?.data?.error || '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ex: Exercise) => {
    setEditingExercise(ex);
    setEditName(ex.name);
    setEditCategory(ex.category);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExercise) return;
    setMessage('');
    setSubmitting(true);
    try {
      await updateCustomExercise(editingExercise.id, {
        name: editName,
        category: editCategory,
      });
      setMessage('✅ 动作更新成功');
      setEditingExercise(null);
      setEditName('');
      setEditCategory('strength');
      loadExercises();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '更新失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此动作吗？')) return;
    setMessage('');
    try {
      await deleteCustomExercise(id);
      setMessage('✅ 动作已删除');
      loadExercises();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '删除失败');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 5 }}>动作库</h1>
          <p style={{ color: '#a0a0b0' }}>浏览所有可用动作，也可以添加自定义动作（MET 值由 AI 自动估算）</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/record" className="btn-secondary" style={{ padding: '10px 20px' }}>📝 去记录</Link>
          <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => setShowForm(!showForm)}>
            {showForm ? '取消添加' : '➕ 添加动作'}
          </button>
        </div>
      </div>

      {/* 添加自定义动作表单 */}
      {showForm && (
        <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
          <h3 style={{ marginBottom: 20, fontSize: 18 }}>✨ 添加自定义动作</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>动作名称</label>
                <input
                  className="input-field"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如：引体向上"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>类型</label>
                <select className="input-field" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="strength">力量训练</option>
                  <option value="cardio">有氧运动</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 20 }}>
              {submitting ? 'AI 估算中...' : '保存动作'}
            </button>
          </form>
          {message && <p style={{ marginTop: 15, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}
        </div>
      )}

      {/* 编辑动作表单 */}
      {editingExercise && (
        <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
          <h3 style={{ marginBottom: 20, fontSize: 18 }}>✏️ 编辑动作</h3>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>动作名称</label>
                <input
                  className="input-field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>类型</label>
                <select className="input-field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  <option value="strength">力量训练</option>
                  <option value="cardio">有氧运动</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'AI 估算中...' : '保存修改'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setEditingExercise(null)}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 力量训练动作 */}
      <div style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 20, marginBottom: 15, color: '#fff' }}>💪 力量训练</h2>
        {loading ? (
          <p style={{ color: '#666' }}>加载中...</p>
        ) : strengthExercises.length === 0 ? (
          <div className="glass-card" style={{ padding: 30, textAlign: 'center', color: '#666' }}>
            暂无力量训练动作
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 15 }}>
            {strengthExercises.map((ex) => (
              <div key={ex.id} className="glass-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{ex.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#a0a0b0' }}>MET {ex.met}</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: ex.isCustom ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.06)', color: ex.isCustom ? '#00ff88' : '#a0a0b0' }}>
                    {ex.isCustom ? '自定义' : '系统'}
                  </span>
                </div>
                {ex.isCustom && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: '5px 10px', fontSize: 12 }}
                      onClick={() => handleEdit(ex)}
                    >
                      修改
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: '5px 10px', fontSize: 12, color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
                      onClick={() => handleDelete(ex.id)}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 有氧运动动作 */}
      <div>
        <h2 style={{ fontSize: 20, marginBottom: 15, color: '#fff' }}>🏃 有氧运动</h2>
        {loading ? (
          <p style={{ color: '#666' }}>加载中...</p>
        ) : cardioExercises.length === 0 ? (
          <div className="glass-card" style={{ padding: 30, textAlign: 'center', color: '#666' }}>
            暂无有氧运动动作
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 15 }}>
            {cardioExercises.map((ex) => (
              <div key={ex.id} className="glass-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.3 }}>{ex.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#a0a0b0' }}>MET {ex.met}</span>
                  <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 10, background: ex.isCustom ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.06)', color: ex.isCustom ? '#00ff88' : '#a0a0b0' }}>
                    {ex.isCustom ? '自定义' : '系统'}
                  </span>
                </div>
                {ex.isCustom && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: '5px 10px', fontSize: 12 }}
                      onClick={() => handleEdit(ex)}
                    >
                      修改
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ flex: 1, padding: '5px 10px', fontSize: 12, color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }}
                      onClick={() => handleDelete(ex.id)}
                    >
                      删除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}