import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const navGroups = [
  {
    title: '运动训练',
    icon: '🏋️',
    items: [
      { path: '/record', label: '运动记录', icon: '📝' },
      { path: '/exercises', label: '动作库', icon: '📚' },
      { path: '/templates', label: '训练模板', icon: '📋' },
    ],
  },
  {
    title: '饮食与身体',
    icon: '🥗',
    items: [
      { path: '/diet', label: '饮食记录', icon: '🍽️' },
      { path: '/weight', label: '体重记录', icon: '⚖️' },
    ],
  },
  {
    title: '社交与账户',
    icon: '👥',
    items: [
      { path: '/friends', label: '好友与排行', icon: '🏆' },
      { path: '/profile', label: '个人资料', icon: '👤' },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div>
      {/* 移动端顶部栏 */}
      <div className="mobile-header">
        <button className="hamburger" onClick={toggleSidebar}>
          ☰
        </button>
        <span style={{ color: '#fff', fontWeight: 700 }}>
          越减越<span style={{ color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b' }}>肥</span>
        </span>
      </div>

      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, padding: '0 16px', color: '#fff' }}>
          越减越<span style={{ color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b' }}>肥</span>
        </div>

        <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeSidebar}>
          <span>🏠</span>
          <span>首页</span>
        </Link>

        {navGroups.map((group) => (
          <div key={group.title} style={{ marginTop: 16 }}>
            <div style={{ padding: '0 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, color: '#666', marginBottom: 8 }}>
              {group.icon} {group.title}
            </div>
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={closeSidebar}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div style={{ padding: '10px 16px', color: '#a0a0b0', fontSize: 14 }}>
            {user?.nickname}
          </div>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#a0a0b0',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            🚪 退出登录
          </button>
        </div>
      </aside>

      {/* 遮罩层，点击关闭侧边栏 */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      {/* 主内容 */}
      <main className="main-content">
        {children}
      </main>

      {/* 移动端底部导航 */}
      <nav className="mobile-nav">
        <Link to="/">🏠 首页</Link>
        <Link to="/record">🏋️ 运动</Link>
        <Link to="/diet">🥗 饮食</Link>
        <Link to="/weight">⚖️ 体重</Link>
        <Link to="/friends">👥 好友</Link>
      </nav>
    </div>
  );
}