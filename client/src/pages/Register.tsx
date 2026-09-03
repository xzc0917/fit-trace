import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser({ email, password, nickname });
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 80% 20%, #1a1a2e, #0f0f13 70%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '15%', right: '8%', fontSize: 80, opacity: 0.05, transform: 'rotate(20deg)' }}>🥗</div>
      <div style={{ position: 'absolute', bottom: '10%', left: '5%', fontSize: 100, opacity: 0.05, transform: 'rotate(-10deg)' }}>🏃</div>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 460,
        padding: 40,
        borderRadius: 20,
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🌟</div>
          <h1 style={{ fontSize: 32, marginBottom: 5 }}>
            越减越<span style={{ color: '#00ff88' }}>肥</span>
          </h1>
          <p style={{ color: '#a0a0b0' }}>创建账户，开启燃脂之旅</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>昵称</label>
            <input
              className="input-field"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="怎么称呼你？"
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>邮箱</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, color: '#a0a0b0', fontSize: 14 }}>密码</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置密码（至少6位）"
              required
              minLength={6}
            />
          </div>
          {error && <p style={{ color: '#ff6b6b', marginBottom: 15, fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '创建中...' : '注 册'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#a0a0b0', fontSize: 14 }}>
          已有账号？ <Link to="/login" style={{ color: '#00ff88', fontWeight: 600 }}>去登录</Link>
        </p>
      </div>
    </div>
  );
}