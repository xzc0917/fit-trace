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
  const token = useAuthStore((state) => state.token);
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

  useEffect(() => { loadExercises(); }, []);

  const strengthExercises = exercises.filter((ex) => ex.category === 'strength');
  const cardioExercises = exercises.filter((ex) => ex.category === 'cardio');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage('');
    if (!newName) { setMessage('请填写动作名称'); return; }
    setSubmitting(true);
    try {
      await createCustomExercise({ name: newName, category: newCategory });
      setNewName(''); setShowForm(false); loadExercises(); setMessage('✅ 自定义动作添加成功');
    } catch (err: any) { setMessage(err.response?.data?.error || '添加失败'); } finally { setSubmitting(false); }
  };

  const handleEdit = (ex: Exercise) => { setEditingExercise(ex); setEditName(ex.name); setEditCategory(ex.category); };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingExercise) return; setMessage(''); setSubmitting(true);
    try {
      await updateCustomExercise(editingExercise.id, { name: editName, category: editCategory });
      setMessage('✅ 动作更新成功'); setEditingExercise(null); setEditName(''); setEditCategory('strength'); loadExercises();
    } catch (err: any) { setMessage(err.response?.data?.error || '更新失败'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除此动作吗？')) return; setMessage('');
    try { await deleteCustomExercise(id); setMessage('✅ 动作已删除'); loadExercises(); } catch (err: any) { setMessage(err.response?.data?.error || '删除失败'); }
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', margin: 0 }}>动作库 📚</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/record" style={{ padding: '10px 20px', border: '3px solid #2b2b2b', borderRadius: 30, background: '#fff', color: '#2b2b2b', fontWeight: 700, textDecoration: 'none', boxShadow: '3px 3px 0 #2b2b2b' }}>📝 去记录</Link>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', border: '3px solid #2b2b2b', borderRadius: 30, background: '#4ecdc4', color: '#2b2b2b', fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{showForm ? '取消添加' : '➕ 添加动作'}</button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>✨ 添加自定义动作</h3>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>动作名称</label><input className="input-field" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="例如：引体向上" style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>类型</label><select className="input-field" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15, background: '#fff' }}><option value="strength">力量训练</option><option value="cardio">有氧运动</option></select></div>
            </div>
            <button type="submit" disabled={submitting} style={{ marginTop: 20, padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{submitting ? 'AI 估算中...' : '保存动作'}</button>
          </form>
          {message && <p style={{ marginTop: 15, fontWeight: 600 }}>{message}</p>}
        </div>
      )}

      {editingExercise && (
        <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>✏️ 编辑动作</h3>
          <form onSubmit={handleUpdate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>动作名称</label><input className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>类型</label><select className="input-field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15, background: '#fff' }}><option value="strength">力量训练</option><option value="cardio">有氧运动</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={submitting} style={{ padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{submitting ? 'AI 估算中...' : '保存修改'}</button>
              <button type="button" onClick={() => setEditingExercise(null)} style={{ padding: '12px 24px', background: '#fff', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer' }}>取消</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, color: '#ff6b9d', marginBottom: 15 }}>💪 力量训练</h2>
        {loading ? <p>加载中...</p> : strengthExercises.length === 0 ? <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 30, textAlign: 'center', boxShadow: '4px 4px 0 #2b2b2b' }}>暂无力量训练动作</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 15 }}>
            {strengthExercises.map((ex) => (
              <div key={ex.id} style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 18, boxShadow: '3px 3px 0 #2b2b2b' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{ex.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}><span>MET {ex.met}</span><span>{ex.isCustom ? '自定义' : '系统'}</span></div>
                {ex.isCustom && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => handleEdit(ex)} style={{ flex: 1, padding: '6px 10px', border: '3px solid #2b2b2b', borderRadius: 15, background: '#ffe66d', fontWeight: 700, cursor: 'pointer' }}>修改</button>
                    <button onClick={() => handleDelete(ex.id)} style={{ flex: 1, padding: '6px 10px', border: '3px solid #2b2b2b', borderRadius: 15, background: '#ff5e5b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>删除</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontSize: 24, color: '#4ecdc4', marginBottom: 15 }}>🏃 有氧运动</h2>
        {loading ? <p>加载中...</p> : cardioExercises.length === 0 ? <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 30, textAlign: 'center', boxShadow: '4px 4px 0 #2b2b2b' }}>暂无有氧运动动作</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 15 }}>
            {cardioExercises.map((ex) => (
              <div key={ex.id} style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 18, boxShadow: '3px 3px 0 #2b2b2b' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{ex.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 13 }}><span>MET {ex.met}</span><span>{ex.isCustom ? '自定义' : '系统'}</span></div>
                {ex.isCustom && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button onClick={() => handleEdit(ex)} style={{ flex: 1, padding: '6px 10px', border: '3px solid #2b2b2b', borderRadius: 15, background: '#ffe66d', fontWeight: 700, cursor: 'pointer' }}>修改</button>
                    <button onClick={() => handleDelete(ex.id)} style={{ flex: 1, padding: '6px 10px', border: '3px solid #2b2b2b', borderRadius: 15, background: '#ff5e5b', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>删除</button>
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