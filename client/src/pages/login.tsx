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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff3e0', fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '3px solid #2b2b2b', borderRadius: 30, padding: 40, boxShadow: '6px 6px 0 #2b2b2b' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>💪</div>
          <h1 style={{ fontSize: 34, margin: 0, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b' }}>越减越肥</h1>
          <p style={{ color: '#2b2b2b', marginTop: 10 }}>记录每一次进步，遇见更好的自己</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#2b2b2b' }}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
              style={{ width: '100%', padding: 14, border: '3px solid #2b2b2b', borderRadius: 20, fontSize: 16, outline: 'none', background: '#fff' }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#2b2b2b' }}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              style={{ width: '100%', padding: 14, border: '3px solid #2b2b2b', borderRadius: 20, fontSize: 16, outline: 'none', background: '#fff' }}
            />
          </div>
          {error && <p style={{ color: '#ff5e5b', marginBottom: 15, fontWeight: 600 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: 14, background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: '#2b2b2b' }}>
          还没有账号？ <Link to="/register" style={{ color: '#ff6b9d', fontWeight: 700 }}>立即注册</Link>
        </p>
      </div>
    </div>
  );
}