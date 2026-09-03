import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setAuth(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请检查邮箱和密码');
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
      background: 'radial-gradient(circle at 20% 30%, #1a2a1a, #0f0f13 70%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰元素 */}
      <div style={{ position: 'absolute', top: '10%', left: '5%', fontSize: 80, opacity: 0.05, transform: 'rotate(-15deg)' }}>🏋️</div>
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', fontSize: 100, opacity: 0.05, transform: 'rotate(10deg)' }}>💪</div>
      <div style={{ position: 'absolute', top: '20%', right: '15%', fontSize: 60, opacity: 0.05 }}>🔥</div>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: 440,
        padding: 40,
        borderRadius: 20,
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>💪</div>
          <h1 style={{ fontSize: 32, marginBottom: 5 }}>
            越减越<span style={{ color: '#00ff88' }}>肥</span>
          </h1>
          <p style={{ color: '#a0a0b0' }}>记录每一次进步，遇见更好的自己</p>
        </div>

        <form onSubmit={handleSubmit}>
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
              placeholder="请输入密码"
              required
            />
          </div>
          {error && <p style={{ color: '#ff6b6b', marginBottom: 15, fontSize: 14 }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#a0a0b0', fontSize: 14 }}>
          还没有账号？ <Link to="/register" style={{ color: '#00ff88', fontWeight: 600 }}>立即注册</Link>
        </p>
      </div>
    </div>
  );
}