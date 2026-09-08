import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateProfile } from '../api/user';

export default function Profile() {
  const token = useAuthStore((state) => state.token)!;
  const { user } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [_profile, setProfile] = useState<any>(null);

  const genderLabels: Record<string, string> = { male: '男', female: '女', other: '其他' };

  const loadProfile = async () => {
    try {
      const data = await getProfile(token);
      setProfile(data);
      setNickname(data.nickname);
      setHeight(data.height ?? '');
      setWeight(data.weight ?? '');
      setAge(data.age ?? '');
      setGender(data.gender ?? '');
    } catch (err) { console.error(err); setMessage('加载资料失败'); } finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(''); setSaving(true);
    try {
      const data = await updateProfile(token, {
        nickname,
        height: height === '' ? undefined : Number(height),
        weight: weight === '' ? undefined : Number(weight),
        age: age === '' ? undefined : Number(age),
        gender,
      });
      setProfile(data); setNickname(data.nickname); setHeight(data.height ?? ''); setWeight(data.weight ?? ''); setAge(data.age ?? ''); setGender(data.gender ?? '');
      setEditMode(false); setMessage('✅ 保存成功');
    } catch (err: any) { setMessage(err.response?.data?.error || '保存失败'); } finally { setSaving(false); }
  };

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b', maxWidth: 700 }}>
      <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', marginBottom: 20 }}>个人资料 👤</h1>

      {message && <p style={{ fontWeight: 600, marginBottom: 15 }}>{message}</p>}

      {loading ? <p>加载中...</p> : !editMode ? (
        <>
          <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, paddingBottom: 15, borderBottom: '2px dashed #ddd' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#ffe66d', border: '3px solid #2b2b2b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{nickname.charAt(0).toUpperCase()}</div>
              <div><div style={{ fontSize: 20, fontWeight: 800 }}>{nickname}</div><div style={{ fontSize: 13, color: '#6b705c' }}>{user?.email}</div></div>
            </div>
            <InfoRow label="昵称" value={nickname} />
            <InfoRow label="身高" value={height ? `${height} cm` : '未填写'} />
            <InfoRow label="体重" value={weight ? `${weight} kg` : '未填写'} />
            <InfoRow label="年龄" value={age ? `${age} 岁` : '未填写'} />
            <InfoRow label="性别" value={gender ? genderLabels[gender] || gender : '未填写'} />
            <button onClick={() => setEditMode(true)} style={{ marginTop: 20, padding: '12px 24px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>修改信息</button>
          </div>

          <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
            <h3 style={{ fontSize: 20, marginBottom: 15 }}>🔗 绑定与设置</h3>
            <InfoRow label="手机号" value="未绑定" />
            <InfoRow label="微信" value="未绑定" />
            <InfoRow label="Apple Health" value="未连接" />
          </div>
        </>
      ) : (
        <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', maxWidth: 500 }}>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>✏️ 修改信息</h3>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>昵称</label>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>身高 (cm)</label><input type="number" value={height} onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>体重 (kg)</label><input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 15 }}>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>年龄</label><input type="number" value={age} onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} /></div>
              <div><label style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>性别</label><select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: 12, border: '3px solid #2b2b2b', borderRadius: 15, background: '#fff' }}><option value="">请选择</option><option value="male">男</option><option value="female">女</option><option value="other">其他</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: 12, background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{saving ? '保存中...' : '保存'}</button>
              <button type="button" onClick={() => setEditMode(false)} style={{ flex: 1, padding: 12, background: '#fff', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer' }}>取消</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '2px dashed #eee' }}>
      <span style={{ color: '#6b705c', fontWeight: 700 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}