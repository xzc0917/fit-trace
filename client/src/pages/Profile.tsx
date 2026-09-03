import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { getProfile, updateProfile } from '../api/user';

export default function Profile() {
  const token = useAuthStore((state) => state.token)!;
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [height, setHeight] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const genderLabels: Record<string, string> = {
    male: '男',
    female: '女',
    other: '其他',
  };

  const loadProfile = async () => {
    try {
      const data = await getProfile(token);
      setProfile(data);
      setNickname(data.nickname);
      setHeight(data.height ?? '');
      setWeight(data.weight ?? '');
      setAge(data.age ?? '');
      setGender(data.gender ?? '');
    } catch (err) {
      console.error(err);
      setMessage('加载资料失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      const data = await updateProfile(token, {
        nickname,
        height: height === '' ? undefined : Number(height),
        weight: weight === '' ? undefined : Number(weight),
        age: age === '' ? undefined : Number(age),
        gender,
      });
      setProfile(data);
      setNickname(data.nickname);
      setHeight(data.height ?? '');
      setWeight(data.weight ?? '');
      setAge(data.age ?? '');
      setGender(data.gender ?? '');
      setEditMode(false);
      setMessage('✅ 保存成功');
    } catch (err: any) {
      setMessage(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 30 }}>
        <h1 className="page-title" style={{ marginBottom: 5 }}>个人资料</h1>
        <p style={{ color: '#a0a0b0' }}>管理你的个人信息和账户设置</p>
      </div>

      {message && <p style={{ marginBottom: 20, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}

      {loading ? (
        <p style={{ color: '#666' }}>加载中...</p>
      ) : !editMode ? (
        <>
          {/* 资料展示模式 */}
          <div className="glass-card" style={{ padding: 25, marginBottom: 20 }}>
            {/* 头像和昵称 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg, #00ff88, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {nickname.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{nickname}</div>
                <div style={{ color: '#a0a0b0', fontSize: 14 }}>{user?.email}</div>
              </div>
            </div>

            {/* 信息列表 */}
            <div style={{ marginTop: 10 }}>
              <InfoRow label="昵称" value={nickname} />
              <InfoRow label="身高" value={height ? `${height} cm` : '未填写'} />
              <InfoRow label="体重" value={weight ? `${weight} kg` : '未填写'} />
              <InfoRow label="年龄" value={age ? `${age} 岁` : '未填写'} />
              <InfoRow label="性别" value={gender ? genderLabels[gender] || gender : '未填写'} />
              <InfoRow label="注册时间" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('zh-CN') : '未知'} />
            </div>

            <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setEditMode(true)}>
              修改信息
            </button>
          </div>

          {/* 未来可扩展的绑定选项 */}
          <div className="glass-card" style={{ padding: 25 }}>
            <h3 style={{ marginBottom: 15, fontSize: 18 }}>🔗 绑定与设置</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>手机号</div>
                  <div style={{ fontSize: 13, color: '#a0a0b0' }}>未绑定</div>
                </div>
                <button className="btn-secondary" style={{ width: 'auto', padding: '8px 15px' }}>绑定</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>微信</div>
                  <div style={{ fontSize: 13, color: '#a0a0b0' }}>未绑定</div>
                </div>
                <button className="btn-secondary" style={{ width: 'auto', padding: '8px 15px' }}>绑定</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Apple Health</div>
                  <div style={{ fontSize: 13, color: '#a0a0b0' }}>未连接</div>
                </div>
                <button className="btn-secondary" style={{ width: 'auto', padding: '8px 15px' }}>连接</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 编辑模式 */
        <div className="glass-card" style={{ padding: 25, maxWidth: 500 }}>
          <h3 style={{ marginBottom: 20, fontSize: 18 }}>✏️ 修改信息</h3>
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>昵称</label>
              <input
                className="input-field"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>身高 (cm)</label>
                <input
                  type="number"
                  className="input-field"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="例如：175"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="例如：70"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 15 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>年龄</label>
                <input
                  type="number"
                  className="input-field"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="例如：25"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>性别</label>
                <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">请选择</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ flex: 1 }}>
                {saving ? '保存中...' : '保存'}
              </button>
              <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setEditMode(false)}>
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// 信息行组件
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#a0a0b0', fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 15 }}>{value}</span>
    </div>
  );
}