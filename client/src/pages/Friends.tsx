import { useEffect, useState } from 'react';
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  getFriends,
  getFriendRequests,
  getRanking,
  likeFriend,
  getReceivedLikes, 
} from '../api/friends';

export default function Friends() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [receivedLikes, setReceivedLikes] = useState<any[]>([]);    
  const loadData = async () => {
    try {
      const [friendList, rank, reqList, LikeList] = await Promise.all([
        getFriends(),
        getRanking(),
        getFriendRequests(),
        getReceivedLikes(),
      ]);
      setFriends(friendList);
      setRanking(rank);
      setRequests(reqList);
      setReceivedLikes(LikeList);
    } catch (err) {
      console.error('加载数据失败:', err);
      setMessage('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setMessage('');
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
      if (results.length === 0) {
        setMessage('未找到匹配的用户');
      }
    } catch (err) {
      console.error(err);
      setMessage('搜索失败');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (userId: string) => {
    setMessage('');
    try {
      await sendFriendRequest(userId);
      setMessage('✅ 好友请求已发送');
      setSearchResults([]);
    } catch (err: any) {
      setMessage(err.response?.data?.error || '请求发送失败');
    }
  };

  const handleAccept = async (userId: string) => {
    setMessage('');
    try {
      await acceptFriendRequest(userId);
      setMessage('✅ 已接受好友请求');
      loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.error || '接受失败');
    }
  };
  const handleLike = async (friendId: string) => {
  try {
    await likeFriend(friendId);
    const rank = await getRanking();
    setRanking(rank);
    // 刷新收到的点赞
    const likesList = await getReceivedLikes();
    setReceivedLikes(likesList);
    setMessage('✅ 点赞成功');
  } catch (err: any) {
    setMessage(err.response?.data?.error || '点赞失败');
  }
};

  // 排行榜前三名特殊奖牌
  const medalMap: Record<number, string> = {
    0: '🥇',
    1: '🥈',
    2: '🥉',
  };

  return (
    <div>
      <div style={{ marginBottom: 30 }}>
        <h1 className="page-title" style={{ marginBottom: 5 }}>好友与排行榜</h1>
        <p style={{ color: '#a0a0b0' }}>添加好友一起训练，在排行榜中互相激励</p>
      </div>

      {/* 搜索用户 */}
      <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
        <h3 style={{ marginBottom: 15, fontSize: 18 }}>🔍 查找好友</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="input-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入昵称或邮箱搜索用户"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }} onClick={handleSearch} disabled={searching}>
            {searching ? '搜索中...' : '搜索'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{ marginTop: 15, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {searchResults.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{u.nickname}</div>
                  <div style={{ fontSize: 13, color: '#a0a0b0' }}>{u.email}</div>
                </div>
                <button className="btn-secondary" style={{ width: 'auto', padding: '8px 15px' }} onClick={() => handleAdd(u.id)}>
                  添加好友
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 好友请求 */}
      {requests.length > 0 && (
        <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
          <h3 style={{ marginBottom: 15, fontSize: 18 }}>📨 好友请求</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {requests.map((req) => (
              <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: 'rgba(0,255,136,0.05)', borderRadius: 8, border: '1px solid rgba(0,255,136,0.2)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{req.nickname}</div>
                  <div style={{ fontSize: 13, color: '#a0a0b0' }}>{req.email}</div>
                </div>
                <button className="btn-primary" style={{ width: 'auto', padding: '8px 15px' }} onClick={() => handleAccept(req.id)}>
                  接受
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 点赞消息 */}
{receivedLikes.length > 0 && (
  <div className="glass-card" style={{ padding: 20, marginBottom: 30 }}>
    <h3 style={{ marginBottom: 15, fontSize: 18 }}>❤️ 收到的点赞</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {receivedLikes.map((like) => (
        <div key={like.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: 18 }}>👍</span>
          <span style={{ fontWeight: 600 }}>{like.user.nickname}</span>
          <span style={{ color: '#a0a0b0', fontSize: 13 }}>刚刚</span>
        </div>
      ))}
    </div>
  </div>
)}
      {message && <p style={{ marginBottom: 20, color: message.includes('✅') ? '#00ff88' : '#ff6b6b' }}>{message}</p>}

      {/* 排行榜 */}
      <div className="glass-card" style={{ padding: 25, marginBottom: 30 }}>
        <h3 style={{ marginBottom: 20, fontSize: 18 }}>🏆 本周运动消耗排行榜</h3>
        {loading ? (
          <p style={{ color: '#666' }}>加载中...</p>
        ) : ranking.length === 0 ? (
          <p style={{ color: '#666' }}>暂无数据</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ranking.map((r, index) => {
  const isFirst = index === 0 && r.totalBurned > 0;
  return (
    <div
      key={r.userId}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 20px',
        background: isFirst
          ? 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(139,92,246,0.15))'
          : r.isMe ? 'rgba(0,255,136,0.08)' : 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        border: isFirst ? '1px solid rgba(0,255,136,0.4)' : r.isMe ? '1px solid rgba(0,255,136,0.3)' : '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <div style={{ fontSize: 24, width: 40, textAlign: 'center' }}>
          {medalMap[index] || <span style={{ color: '#a0a0b0', fontSize: 16 }}>#{index + 1}</span>}
        </div>
        {/* 头像/首字母 */}
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.avatarUrl ? `url(${r.avatarUrl})` : 'linear-gradient(135deg, #00ff88, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {r.avatarUrl ? '' : r.nickname.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {r.nickname}
            {r.isMe && <span style={{ marginLeft: 8, fontSize: 12, color: '#00ff88' }}>(我)</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#00ff88' }}>
          {r.totalBurned.toFixed(0)} <span style={{ fontSize: 13, color: '#a0a0b0' }}>kcal</span>
        </div>
        {/* 点赞按钮，只有好友（非自己）才显示 */}
        {!r.isMe && (
          <button
            className="btn-secondary"
            style={{ padding: '5px 10px', fontSize: 12, color: r.liked ? '#00ff88' : '#a0a0b0', borderColor: r.liked ? 'rgba(0,255,136,0.4)' : 'rgba(255,255,255,0.1)' }}
            onClick={() => handleLike(r.userId)}
            disabled={r.liked}
          >
            {r.liked ? '已点赞' : '点赞'}
          </button>
        )}
      </div>
    </div>
  );
})}
          </div>
        )}
      </div>

      {/* 好友列表 */}
      <div className="glass-card" style={{ padding: 25 }}>
        <h3 style={{ marginBottom: 15, fontSize: 18 }}>👥 我的好友 ({friends.length})</h3>
        {friends.length === 0 ? (
          <p style={{ color: '#666' }}>暂无好友，快去添加吧！</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 15 }}>
            {friends.map((f) => (
              <div key={f.id} style={{ padding: 15, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>👤</div>
                <div style={{ fontWeight: 600 }}>{f.nickname}</div>
                <div style={{ fontSize: 13, color: '#a0a0b0' }}>{f.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}