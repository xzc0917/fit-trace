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
  const [receivedLikes, setReceivedLikes] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const loadData = async () => {
    try {
      const [friendList, rank, reqList, likesList] = await Promise.all([
        getFriends(),
        getRanking(),
        getFriendRequests(),
        getReceivedLikes(),
      ]);
      setFriends(friendList);
      setRanking(rank);
      setRequests(reqList);
      setReceivedLikes(likesList);
    } catch (err) {
      console.error('加载数据失败:', err);
      setMessage('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setMessage('');
    try {
      const results = await searchUsers(query);
      setSearchResults(results);
      if (results.length === 0) setMessage('未找到匹配的用户');
    } catch (err) { console.error(err); setMessage('搜索失败'); } finally { setSearching(false); }
  };

  const handleAdd = async (userId: string) => {
    setMessage('');
    try { await sendFriendRequest(userId); setMessage('✅ 好友请求已发送'); setSearchResults([]); } catch (err: any) { setMessage(err.response?.data?.error || '请求发送失败'); }
  };

  const handleAccept = async (userId: string) => {
    setMessage('');
    try { await acceptFriendRequest(userId); setMessage('✅ 已接受好友请求'); loadData(); } catch (err: any) { setMessage(err.response?.data?.error || '接受失败'); }
  };

  const handleLike = async (friendId: string) => {
    try {
      await likeFriend(friendId);
      const rank = await getRanking(); setRanking(rank);
      const likesList = await getReceivedLikes(); setReceivedLikes(likesList);
      setMessage('✅ 点赞成功');
    } catch (err: any) { setMessage(err.response?.data?.error || '点赞失败'); }
  };

  const medalMap: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' };

  return (
    <div style={{ fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif", color: '#2b2b2b' }}>
      <h1 style={{ fontSize: 32, color: '#ff6b9d', textShadow: '2px 2px 0 #2b2b2b', marginBottom: 20 }}>好友与排行 🏆</h1>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, marginBottom: 15 }}>🔍 查找好友</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="输入昵称或邮箱搜索用户" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} style={{ flex: 1, padding: 12, border: '3px solid #2b2b2b', borderRadius: 15 }} />
          <button onClick={handleSearch} disabled={searching} style={{ padding: '10px 20px', background: '#4ecdc4', color: '#2b2b2b', border: '3px solid #2b2b2b', borderRadius: 30, fontWeight: 700, cursor: 'pointer', boxShadow: '3px 3px 0 #2b2b2b' }}>{searching ? '搜索中...' : '搜索'}</button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 15 }}>
            {searchResults.map((u) => (
              <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottom: '2px dashed #ddd' }}>
                <div><div style={{ fontWeight: 700 }}>{u.nickname}</div><div style={{ fontSize: 13, color: '#6b705c' }}>{u.email}</div></div>
                <button onClick={() => handleAdd(u.id)} style={{ background: '#ffe66d', color: '#2b2b2b', border: '2px solid #2b2b2b', borderRadius: 15, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>添加好友</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {requests.length > 0 && (
        <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>📨 好友请求</h3>
          {requests.map((req) => (
            <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottom: '2px dashed #ddd' }}>
              <div><div style={{ fontWeight: 700 }}>{req.nickname}</div><div style={{ fontSize: 13, color: '#6b705c' }}>{req.email}</div></div>
              <button onClick={() => handleAccept(req.id)} style={{ background: '#4ecdc4', color: '#2b2b2b', border: '2px solid #2b2b2b', borderRadius: 15, padding: '6px 12px', fontWeight: 700, cursor: 'pointer' }}>接受</button>
            </div>
          ))}
        </div>
      )}

      {receivedLikes.length > 0 && (
        <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
          <h3 style={{ fontSize: 20, marginBottom: 15 }}>❤️ 收到的点赞</h3>
          {receivedLikes.map((like) => (
            <div key={like.id} style={{ padding: 8, borderBottom: '2px dashed #ddd' }}>
              <span style={{ fontWeight: 700 }}>{like.user.nickname}</span> 赞了你
            </div>
          ))}
        </div>
      )}

      {message && <p style={{ fontWeight: 600, marginBottom: 15 }}>{message}</p>}

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b', marginBottom: 20 }}>
        <h3 style={{ fontSize: 20, marginBottom: 15 }}>🏆 本周运动消耗排行榜</h3>
        {loading ? <p>加载中...</p> : ranking.length === 0 ? <p>暂无数据</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ranking.map((r, index) => (
              <div key={r.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: r.isMe ? '#fff3e0' : '#fff', border: '2px solid #2b2b2b', borderRadius: 15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{medalMap[index] || `#${index + 1}`}</span>
                  <span style={{ fontWeight: 700 }}>{r.nickname}{r.isMe ? ' (我)' : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, color: '#ff6b9d' }}>{r.totalBurned.toFixed(0)} kcal</span>
                  {!r.isMe && (
                    <button onClick={() => handleLike(r.userId)} disabled={r.liked} style={{ background: r.liked ? '#ddd' : '#ffe66d', color: '#2b2b2b', border: '2px solid #2b2b2b', borderRadius: 15, padding: '4px 10px', fontWeight: 700, cursor: 'pointer' }}>
                      {r.liked ? '已点赞' : '点赞'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: '#fff', border: '3px solid #2b2b2b', borderRadius: 20, padding: 20, boxShadow: '4px 4px 0 #2b2b2b' }}>
        <h3 style={{ fontSize: 20, marginBottom: 15 }}>👥 我的好友 ({friends.length})</h3>
        {friends.length === 0 ? <p>暂无好友</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {friends.map((f) => (
              <div key={f.id} style={{ padding: 10, border: '2px solid #2b2b2b', borderRadius: 15, textAlign: 'center' }}>
                <div style={{ fontWeight: 700 }}>{f.nickname}</div>
                <div style={{ fontSize: 12, color: '#6b705c' }}>{f.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}