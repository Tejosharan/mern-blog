import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token'));
  }, []);
  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
  };
  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
  };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

const styles = {
  nav: { background:'#1a1a2e', padding:'0 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', height:'60px' },
  navBrand: { color:'#e94560', fontWeight:'bold', fontSize:'1.4rem', textDecoration:'none' },
  navLink: { color:'#eee', textDecoration:'none', marginLeft:'1.5rem', fontSize:'0.95rem' },
  btn: { background:'#e94560', color:'#fff', border:'none', padding:'0.5rem 1.2rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
  btnOutline: { background:'transparent', color:'#e94560', border:'1px solid #e94560', padding:'0.5rem 1.2rem', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
  container: { maxWidth:'900px', margin:'2rem auto', padding:'0 1rem' },
  card: { background:'#16213e', borderRadius:'10px', padding:'1.5rem', marginBottom:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.3)' },
  input: { width:'100%', padding:'0.7rem', marginBottom:'1rem', borderRadius:'6px', border:'1px solid #333', background:'#0f3460', color:'#fff', fontSize:'1rem', boxSizing:'border-box' },
  textarea: { width:'100%', padding:'0.7rem', marginBottom:'1rem', borderRadius:'6px', border:'1px solid #333', background:'#0f3460', color:'#fff', fontSize:'1rem', minHeight:'160px', boxSizing:'border-box' },
  tag: { background:'#e94560', color:'#fff', borderRadius:'20px', padding:'2px 10px', fontSize:'0.75rem', marginRight:'6px' },
  error: { color:'#ff6b6b', marginBottom:'1rem' },
  page: { background:'#0f0f23', minHeight:'100vh', color:'#eee', fontFamily:'Inter, sans-serif' }
};

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.navBrand}>✍️ MERN Blog</Link>
      <div>
        {user ? (
          <>
            <Link to="/create" style={styles.navLink}>New Post</Link>
            <span style={{ ...styles.navLink, color:'#aaa' }}>Hi, {user.username}</span>
            <button onClick={logout} style={{ ...styles.btn, marginLeft:'1rem' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/register"><button style={{ ...styles.btn, marginLeft:'1rem' }}>Register</button></Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  useEffect(() => { api.get('/posts').then(r => setPosts(r.data)); }, []);
  const filtered = posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={styles.container}>
      <h1 style={{ marginBottom:'1.5rem' }}>Latest Posts</h1>
      <input style={styles.input} placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)} />
      {filtered.map(post => (
        <div key={post._id} style={styles.card}>
          <h2 style={{ margin:'0 0 0.5rem', color:'#e94560' }}>
            <Link to={`/post/${post._id}`} style={{ color:'#e94560', textDecoration:'none' }}>{post.title}</Link>
          </h2>
          <p style={{ color:'#aaa', margin:'0 0 0.8rem' }}>By {post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}</p>
          <p style={{ margin:'0 0 1rem', lineHeight:'1.6' }}>{post.excerpt || post.content.slice(0, 150)}...</p>
          <div>{post.tags?.map(t => <span key={t} style={styles.tag}>{t}</span>)}</div>
        </div>
      ))}
      {filtered.length === 0 && <p style={{ color:'#aaa' }}>No posts found.</p>}
    </div>
  );
}

function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  useEffect(() => { api.get(`/posts/${id}`).then(r => setPost(r.data)); }, [id]);
  const handleLike = async () => {
    const { data } = await api.post(`/posts/${id}/like`);
    setPost(p => ({ ...p, likes: Array(data.likes).fill(null) }));
  };
  const handleComment = async () => {
    if (!comment.trim()) return;
    const { data } = await api.post(`/posts/${id}/comments`, { text: comment });
    setPost(p => ({ ...p, comments: data }));
    setComment('');
  };
  const handleDelete = async () => {
    if (window.confirm('Delete this post?')) { await api.delete(`/posts/${id}`); navigate('/'); }
  };
  if (!post) return <div style={styles.container}><p>Loading...</p></div>;
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={{ color:'#e94560' }}>{post.title}</h1>
        <p style={{ color:'#aaa' }}>By {post.author?.username} · {new Date(post.createdAt).toLocaleDateString()}</p>
        <div>{post.tags?.map(t => <span key={t} style={styles.tag}>{t}</span>)}</div>
        <p style={{ lineHeight:'1.8', marginTop:'1.5rem', whiteSpace:'pre-wrap' }}>{post.content}</p>
        <div style={{ display:'flex', gap:'1rem', marginTop:'1.5rem' }}>
          {user && <button onClick={handleLike} style={styles.btnOutline}>❤️ {post.likes?.length || 0} Likes</button>}
          {user?._id === post.author?._id && (
            <>
              <Link to={`/edit/${post._id}`}><button style={styles.btn}>Edit</button></Link>
              <button onClick={handleDelete} style={{ ...styles.btn, background:'#c0392b' }}>Delete</button>
            </>
          )}
        </div>
      </div>
      <div style={styles.card}>
        <h3>Comments ({post.comments?.length || 0})</h3>
        {post.comments?.map((c, i) => (
          <div key={i} style={{ borderBottom:'1px solid #333', paddingBottom:'0.8rem', marginBottom:'0.8rem' }}>
            <strong style={{ color:'#e94560' }}>{c.user?.username}</strong>
            <p style={{ margin:'0.3rem 0 0' }}>{c.text}</p>
          </div>
        ))}
        {user && (
          <>
            <textarea style={styles.textarea} placeholder="Add a comment..." value={comment} onChange={e => setComment(e.target.value)} />
            <button onClick={handleComment} style={styles.btn}>Post Comment</button>
          </>
        )}
      </div>
    </div>
  );
}

function PostForm({ editId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title:'', content:'', excerpt:'', tags:'' });
  const [error, setError] = useState('');
  useEffect(() => {
    if (editId) api.get(`/posts/${editId}`).then(r => setForm({ ...r.data, tags: r.data.tags?.join(', ') }));
  }, [editId]);
  const handleSubmit = async () => {
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editId) await api.put(`/posts/${editId}`, payload);
      else await api.post('/posts', payload);
      navigate('/');
    } catch (e) { setError(e.response?.data?.message || 'Error saving post'); }
  };
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{editId ? 'Edit Post' : 'Create New Post'}</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Title" value={form.title} onChange={e => setForm({...form, title:e.target.value})} />
        <input style={styles.input} placeholder="Short excerpt" value={form.excerpt} onChange={e => setForm({...form, excerpt:e.target.value})} />
        <textarea style={styles.textarea} placeholder="Write your post..." value={form.content} onChange={e => setForm({...form, content:e.target.value})} />
        <input style={styles.input} placeholder="Tags (comma separated, e.g. react, node)" value={form.tags} onChange={e => setForm({...form, tags:e.target.value})} />
        <button onClick={handleSubmit} style={styles.btn}>{editId ? 'Update Post' : 'Publish Post'}</button>
      </div>
    </div>
  );
}

function Login() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' }); const [error, setError] = useState('');
  const handle = async () => { try { await login(form.email, form.password); navigate('/'); } catch { setError('Invalid credentials'); } };
  return (
    <div style={{ ...styles.container, maxWidth:'420px' }}>
      <div style={styles.card}>
        <h2>Login</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
        <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
        <button onClick={handle} style={{ ...styles.btn, width:'100%' }}>Login</button>
        <p style={{ textAlign:'center', marginTop:'1rem', color:'#aaa' }}>No account? <Link to="/register" style={{ color:'#e94560' }}>Register</Link></p>
      </div>
    </div>
  );
}

function Register() {
  const { register } = useAuth(); const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'' }); const [error, setError] = useState('');
  const handle = async () => { try { await register(form.username, form.email, form.password); navigate('/'); } catch (e) { setError(e.response?.data?.message || 'Error'); } };
  return (
    <div style={{ ...styles.container, maxWidth:'420px' }}>
      <div style={styles.card}>
        <h2>Register</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} placeholder="Username" value={form.username} onChange={e => setForm({...form, username:e.target.value})} />
        <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} />
        <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password:e.target.value})} />
        <button onClick={handle} style={{ ...styles.btn, width:'100%' }}>Create Account</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={styles.page}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create" element={<PostForm />} />
            <Route path="/edit/:id" element={<PostForm editId={true} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
