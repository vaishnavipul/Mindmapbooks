import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Search, Mic, Type, Circle, Square, Diamond,
  Highlighter, Undo2, Redo2, Copy, Scissors, Trash2, Upload, Link2,
  LogOut, BookOpen, Loader2, ArrowLeft, Mail, Play, Pause,
  FileText, ClipboardList, Map, Plus, Settings, Trash, CheckCircle2, XCircle,
  Volume2, Rewind, FastForward
} from 'lucide-react';

const SUPABASE_URL = 'https://ilwhybrthnvcoyigtuth.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsd2h5YnJ0aG52Y295aWd0dXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwMzQ5MzEsImV4cCI6MjA5NzYxMDkzMX0.cNSMWwsjnf5ClQ25jxQ-Mtm4y-LUUcCY0rJPZdkXdc8';
const ADMIN_EMAIL = 'jayawantvipul@gmail.com';

const sb = {
  async signUp(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },
  async resetPassword(email, redirectTo) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ email, options: { redirect_to: redirectTo } }),
    });
    if (res.status === 204 || res.ok) return { ok: true };
    return res.json();
  },
  async updatePassword(accessToken, newPassword) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ password: newPassword }),
    });
    return res.json();
  },
  async rest(path, { method = 'GET', token, body, query = '' } = {}) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}${query}`, {
      method,
      headers: {
        'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        Prefer: method === 'POST' ? 'return=representation,resolution=merge-duplicates' : 'return=representation',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) { const errText = await res.text(); throw new Error(`Supabase error (${res.status}): ${errText}`); }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  },
  async uploadFile(token, bucket, path, file) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY, 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`);
    return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  },
  async uploadImage(token, userId, file) {
    const path = `${userId}/${Date.now()}_${file.name}`;
    return sb.uploadFile(token, 'board-images', path, file);
  },
};

const ASSET_LIBRARY = [
  { id: 'e001', glyph: '💪', theme: 'health', tags: ['strength','muscle','workout','exercise','fitness','willpower','discipline'] },
  { id: 'e002', glyph: '🏃', theme: 'health', tags: ['run','running','cardio','exercise','habit','morning routine'] },
  { id: 'e003', glyph: '🧘', theme: 'health', tags: ['meditation','calm','mindfulness','yoga','peace','stillness'] },
  { id: 'e004', glyph: '🥗', theme: 'health', tags: ['salad','diet','nutrition','healthy eating','food'] },
  { id: 'e005', glyph: '😴', theme: 'health', tags: ['sleep','rest','recovery','tired','night routine'] },
  { id: 'e006', glyph: '💊', theme: 'health', tags: ['medicine','pill','treatment','illness','cure'] },
  { id: 'e007', glyph: '🩺', theme: 'health', tags: ['doctor','checkup','health check','diagnosis'] },
  { id: 'e008', glyph: '🚭', theme: 'health', tags: ['quit smoking','bad habit','addiction','stop'] },
  { id: 'e009', glyph: '💧', theme: 'health', tags: ['water','hydration','drink','cleanse'] },
  { id: 'e010', glyph: '🧠', theme: 'health', tags: ['brain','mind','mental health','thinking','focus','psychology'] },
  { id: 'e011', glyph: '💰', theme: 'wealth', tags: ['money','wealth','savings','finance','rich','abundance'] },
  { id: 'e012', glyph: '💵', theme: 'wealth', tags: ['cash','dollar','income','salary','money'] },
  { id: 'e013', glyph: '📈', theme: 'wealth', tags: ['growth','investment','stocks','profit','increase','progress'] },
  { id: 'e014', glyph: '📉', theme: 'wealth', tags: ['loss','decline','recession','debt','decrease'] },
  { id: 'e015', glyph: '🏦', theme: 'wealth', tags: ['bank','savings','loan','finance','institution'] },
  { id: 'e016', glyph: '💳', theme: 'wealth', tags: ['credit card','spending','debt','payment','expense'] },
  { id: 'e017', glyph: '🪙', theme: 'wealth', tags: ['coin','savings','small wins','compounding'] },
  { id: 'e018', glyph: '🏠', theme: 'wealth', tags: ['house','home','asset','property','real estate','security'] },
  { id: 'e019', glyph: '🎯', theme: 'wealth', tags: ['goal','target','financial goal','focus','aim'] },
  { id: 'e020', glyph: '⚖️', theme: 'wealth', tags: ['balance','budget','scale','fairness','trade-off'] },
  { id: 'e021', glyph: '❤️', theme: 'love', tags: ['love','heart','romance','affection','care'] },
  { id: 'e022', glyph: '💑', theme: 'love', tags: ['couple','relationship','partner','together','marriage'] },
  { id: 'e023', glyph: '💔', theme: 'love', tags: ['heartbreak','breakup','loss','grief','pain','divorce'] },
  { id: 'e024', glyph: '💍', theme: 'love', tags: ['marriage','commitment','engagement','ring','wedding'] },
  { id: 'e025', glyph: '🌹', theme: 'love', tags: ['romance','rose','gift','courtship','flower'] },
  { id: 'e026', glyph: '🤗', theme: 'love', tags: ['hug','comfort','support','warmth','embrace'] },
  { id: 'e027', glyph: '💌', theme: 'love', tags: ['love letter','message','expression','communication'] },
  { id: 'e028', glyph: '👨‍👩‍👧', theme: 'relationship', tags: ['family','parents','children','home','relationship'] },
  { id: 'e029', glyph: '🤝', theme: 'relationship', tags: ['handshake','agreement','trust','partnership','deal','respect'] },
  { id: 'e030', glyph: '🗣️', theme: 'relationship', tags: ['communication','talking','speak up','conversation','voice'] },
  { id: 'e031', glyph: '👂', theme: 'relationship', tags: ['listening','empathy','attention','understanding'] },
  { id: 'e032', glyph: '😡', theme: 'relationship', tags: ['conflict','anger','argument','fight','frustration'] },
  { id: 'e033', glyph: '🙏', theme: 'relationship', tags: ['apology','respect','request','thanks','humility','prayer','gratitude','faith'] },
  { id: 'e034', glyph: '👥', theme: 'relationship', tags: ['people','social','friends','network','community'] },
  { id: 'e035', glyph: '💼', theme: 'career', tags: ['job','work','office','business','career','briefcase'] },
  { id: 'e036', glyph: '📊', theme: 'career', tags: ['report','data','presentation','analysis','performance'] },
  { id: 'e037', glyph: '🏆', theme: 'career', tags: ['achievement','success','win','award','promotion','milestone'] },
  { id: 'e038', glyph: '📝', theme: 'career', tags: ['resume','notes','writing','task','to-do','plan'] },
  { id: 'e039', glyph: '⏰', theme: 'career', tags: ['deadline','time management','urgency','schedule','punctual'] },
  { id: 'e040', glyph: '🪜', theme: 'career', tags: ['ladder','promotion','growth','climbing','progress','advancement'] },
  { id: 'e041', glyph: '💻', theme: 'job', tags: ['computer','remote work','laptop','office work','digital'] },
  { id: 'e042', glyph: '📞', theme: 'job', tags: ['call','interview','meeting','communication','phone'] },
  { id: 'e043', glyph: '🧑‍💼', theme: 'career', tags: ['professional','manager','employee','boss','worker'] },
  { id: 'e044', glyph: '🕯️', theme: 'spiritual', tags: ['candle','prayer','ritual','calm','meditation','light'] },
  { id: 'e046', glyph: '☯️', theme: 'spiritual', tags: ['balance','yin yang','duality','harmony','philosophy'] },
  { id: 'e047', glyph: '🕉️', theme: 'spiritual', tags: ['om','hinduism','spirituality','sacred','mantra'] },
  { id: 'e048', glyph: '✨', theme: 'spiritual', tags: ['enlightenment','magic','transformation','awakening','shine'] },
  { id: 'e049', glyph: '🌙', theme: 'spiritual', tags: ['moon','night','reflection','cycle','rest'] },
  { id: 'e050', glyph: '☀️', theme: 'spiritual', tags: ['sun','energy','new day','clarity','positivity'] },
  { id: 'e051', glyph: '🌳', theme: 'nature', tags: ['tree','forest','growth','roots','nature','stability'] },
  { id: 'e052', glyph: '🌲', theme: 'nature', tags: ['pine tree','forest','woods','nature'] },
  { id: 'e053', glyph: '🌴', theme: 'nature', tags: ['palm tree','tropical','nature','vacation','calm'] },
  { id: 'e054', glyph: '🪓', theme: 'nature', tags: ['axe','woodcutter','chop','cutting','tool','labor','lumberjack'] },
  { id: 'e055', glyph: '🪚', theme: 'nature', tags: ['saw','cutting','woodcutter','tool','carpenter'] },
  { id: 'e056', glyph: '🌊', theme: 'nature', tags: ['wave','ocean','flow','change','water'] },
  { id: 'e057', glyph: '⛰️', theme: 'nature', tags: ['mountain','challenge','climb','obstacle','achievement'] },
  { id: 'e058', glyph: '🌱', theme: 'nature', tags: ['seed','sprout','growth','beginning','new habit','small start'] },
  { id: 'e059', glyph: '🌻', theme: 'nature', tags: ['sunflower','flower','growth','bloom','positivity'] },
  { id: 'e060', glyph: '🐦', theme: 'nature', tags: ['bird','freedom','flight','nature','early bird'] },
  { id: 'e061', glyph: '🙌', theme: 'gratitude', tags: ['thankful','celebration','praise','appreciation','grateful'] },
  { id: 'e062', glyph: '🌟', theme: 'gratitude', tags: ['star','highlight','special','appreciation','shine'] },
  { id: 'e063', glyph: '📔', theme: 'gratitude', tags: ['journal','gratitude journal','diary','reflection','writing'] },
  { id: 'e064', glyph: '🎁', theme: 'gratitude', tags: ['gift','blessing','abundance','receiving','appreciation'] },
  { id: 'e065', glyph: '🚶', theme: 'habit', tags: ['man walking','person','journey','progress','step'] },
  { id: 'e066', glyph: '🧍', theme: 'habit', tags: ['person standing','man','figure','stickman','person'] },
  { id: 'e067', glyph: '👨', theme: 'habit', tags: ['man','boy','male','person','character'] },
  { id: 'e068', glyph: '👩', theme: 'habit', tags: ['woman','girl','female','person','character'] },
  { id: 'e069', glyph: '🔁', theme: 'habit', tags: ['repeat','cycle','loop','routine','habit loop'] },
  { id: 'e070', glyph: '🔑', theme: 'habit', tags: ['key','solution','answer','unlock','important point'] },
  { id: 'e071', glyph: '💡', theme: 'habit', tags: ['idea','insight','lightbulb','realization','key takeaway'] },
  { id: 'e072', glyph: '🧩', theme: 'habit', tags: ['puzzle','piece','solution','fit','problem solving'] },
  { id: 'e073', glyph: '⚡', theme: 'habit', tags: ['energy','trigger','spark','motivation','sudden change'] },
  { id: 'e074', glyph: '🛤️', theme: 'habit', tags: ['path','track','journey','direction','route'] },
  { id: 'e075', glyph: '🚧', theme: 'habit', tags: ['obstacle','barrier','challenge','blocker','construction'] },
];

const SHAPE_TYPES = [
  { type: 'rect', label: 'Box', Icon: Square },
  { type: 'circle', label: 'Circle', Icon: Circle },
  { type: 'diamond', label: 'Diamond', Icon: Diamond },
];

const COLORS = {
  cream: '#FBF6EE', ink: '#2A2A2A', accent: '#C2456B',
  accentSoft: '#F3D9DE', line: '#E3D7C5', sand: '#F4EEE0',
};

let idCounter = 1;
const nextId = (prefix = 'n') => `${prefix}_${idCounter++}_${Date.now()}`;

function FieldInput({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>{label}</label>
      <input {...props} style={{ width: '100%', padding: '10px 12px', marginTop: 6, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  );
}
function PrimaryButton({ children, loading, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled} style={{
      width: '100%', padding: '11px 0', borderRadius: 10, border: 'none',
      background: COLORS.accent, color: '#fff', fontSize: 14, fontWeight: 700,
      cursor: loading ? 'default' : 'pointer', opacity: (loading || props.disabled) ? 0.7 : 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      {loading && <Loader2 size={15} className="spin" />}
      {children}
    </button>
  );
}
function AuthShell({ children }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: COLORS.cream, fontFamily: "'Poppins', 'Segoe UI', sans-serif", padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 32, width: '100%', maxWidth: 340, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: `1px solid ${COLORS.line}` }}>
        {children}
        <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
function SignInScreen({ onAuth, goTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const result = await sb.signIn(email, password);
      if (result.error || result.error_description) {
        setError(result.error_description || result.msg || 'Could not sign in. Check your email and password.');
        setLoading(false); return;
      }
      onAuth({ token: result.access_token, user: result.user });
    } catch (err) { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <AuthShell>
      <div>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🧠</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, margin: '0 0 4px' }}>MindBoard</h1>
        <p style={{ fontSize: 13, color: '#8A8070', margin: '0 0 22px' }}>Welcome back. Sign in to continue.</p>
        <FieldInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <FieldInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }} placeholder="••••••••" minLength={6} />
        <div style={{ textAlign: 'right', marginBottom: 14, marginTop: -6 }}>
          <button type="button" onClick={() => goTo('forgot')} style={{ background: 'none', border: 'none', color: COLORS.accent, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>Forgot password?</button>
        </div>
        {error && <div style={{ fontSize: 12.5, color: COLORS.accent, marginBottom: 14, lineHeight: 1.4 }}>{error}</div>}
        <PrimaryButton type="button" onClick={handleSubmit} loading={loading}>Sign in</PrimaryButton>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#8A8070' }}>
          No account? <button type="button" onClick={() => goTo('signup')} style={{ color: COLORS.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign up</button>
        </div>
      </div>
    </AuthShell>
  );
}

function SignUpScreen({ onAuth, goTo }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      const result = await sb.signUp(email, password);
      if (result.error || result.error_description) {
        setError(result.error_description || result.msg || 'Could not create account.');
        setLoading(false); return;
      }
      if (!result.access_token) { setInfo('Account created! Check your email to confirm, then sign in.'); setLoading(false); return; }
      onAuth({ token: result.access_token, user: result.user });
    } catch (err) { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <AuthShell>
      <div>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🧠</div>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: COLORS.ink, margin: '0 0 4px' }}>Create your account</h1>
        <p style={{ fontSize: 13, color: '#8A8070', margin: '0 0 22px' }}>Start mapping what you learn.</p>
        <FieldInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <FieldInput label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }} placeholder="At least 6 characters" minLength={6} />
        {error && <div style={{ fontSize: 12.5, color: COLORS.accent, marginBottom: 14, lineHeight: 1.4 }}>{error}</div>}
        {info && <div style={{ fontSize: 12.5, color: '#2F8F6F', marginBottom: 14, lineHeight: 1.4 }}>{info}</div>}
        <PrimaryButton type="button" onClick={handleSubmit} loading={loading}>Create account</PrimaryButton>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#8A8070' }}>
          Have an account? <button type="button" onClick={() => goTo('signin')} style={{ color: COLORS.accent, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Sign in</button>
        </div>
      </div>
    </AuthShell>
  );
}

function ForgotPasswordScreen({ goTo }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined' ? window.location.href : undefined;
      const result = await sb.resetPassword(email, redirectTo);
      if (result.error) setError(result.error_description || result.msg || 'Could not send reset email.');
      else setSent(true);
    } catch (err) { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <AuthShell>
      <button onClick={() => goTo('signin')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8A8070', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 18 }}>
        <ArrowLeft size={14} /> Back to sign in
      </button>
      {!sent ? (
        <div>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🔑</div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: COLORS.ink, margin: '0 0 4px' }}>Reset your password</h1>
          <p style={{ fontSize: 13, color: '#8A8070', margin: '0 0 22px', lineHeight: 1.4 }}>Enter your email and we'll send a link to reset your password.</p>
          <FieldInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }} placeholder="you@example.com" />
          {error && <div style={{ fontSize: 12.5, color: COLORS.accent, marginBottom: 14, lineHeight: 1.4 }}>{error}</div>}
          <PrimaryButton type="button" onClick={handleSubmit} loading={loading}>Send reset link</PrimaryButton>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <Mail size={32} color={COLORS.accent} style={{ marginBottom: 10 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink, margin: '0 0 8px' }}>Check your email</h2>
          <p style={{ fontSize: 13, color: '#8A8070', lineHeight: 1.5 }}>If an account exists for <strong>{email}</strong>, a reset link is on its way. Click it to set a new password.</p>
        </div>
      )}
    </AuthShell>
  );
}

function UpdatePasswordScreen({ recoveryToken, onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const result = await sb.updatePassword(recoveryToken, password);
      if (result.error) setError(result.error_description || result.msg || 'Could not update password.');
      else { setDone(true); setTimeout(onDone, 1800); }
    } catch (err) { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <AuthShell>
      {!done ? (
        <div>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🔑</div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: COLORS.ink, margin: '0 0 4px' }}>Set a new password</h1>
          <p style={{ fontSize: 13, color: '#8A8070', margin: '0 0 22px' }}>Choose something you haven't used before.</p>
          <FieldInput label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} />
          <FieldInput label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }} placeholder="Repeat password" minLength={6} />
          {error && <div style={{ fontSize: 12.5, color: COLORS.accent, marginBottom: 14, lineHeight: 1.4 }}>{error}</div>}
          <PrimaryButton type="button" onClick={handleSubmit} loading={loading}>Update password</PrimaryButton>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: COLORS.ink, margin: '0 0 8px' }}>Password updated</h2>
          <p style={{ fontSize: 13, color: '#8A8070' }}>Taking you to your library...</p>
        </div>
      )}
    </AuthShell>
  );
}
function BookLibraryScreen({ auth, onOpenBook, onLogout, onOpenAdmin }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAdmin = auth.user.email === ADMIN_EMAIL;

  useEffect(() => {
    (async () => {
      try {
        const rows = await sb.rest('books', { token: auth.token, query: '?select=id,title,author,cover_url,description,audio_url&order=title.asc' });
        setBooks(rows || []);
      } catch (err) { setError('Could not load your library. Pull to refresh or check your connection.'); }
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.cream, fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <div style={{ padding: '14px 18px', background: '#fff', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: COLORS.accent }}>🧠 MindBoard</div>
          <div style={{ fontSize: 11.5, color: '#998F80' }}>{auth.user.email}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isAdmin && (
            <button onClick={onOpenAdmin} title="Admin panel" style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600 }}>
              <Settings size={15} /> Admin
            </button>
          )}
          <button onClick={onLogout} title="Log out" style={{ background: 'none', border: 'none', color: '#998F80', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: COLORS.ink, margin: '4px 0 14px' }}>Your library</h2>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#998F80', fontSize: 13 }}>
            <Loader2 size={16} className="spin" /> Loading books...
            <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {error && <div style={{ fontSize: 13, color: COLORS.accent }}>{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {books.map((book) => (
            <button key={book.id} onClick={() => onOpenBook(book)} style={{
              textAlign: 'left', background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 14,
              padding: 14, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ width: '100%', height: 90, borderRadius: 10, background: COLORS.sand, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {book.cover_url ? <img src={book.cover_url} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <BookOpen size={28} color="#C8BCA8" />}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink, lineHeight: 1.25 }}>{book.title}</div>
                {book.author && <div style={{ fontSize: 11.5, color: '#998F80', marginTop: 2 }}>{book.author}</div>}
                {!book.audio_url && <div style={{ fontSize: 10, color: '#C8956B', marginTop: 4 }}>Audio coming soon</div>}
              </div>
            </button>
          ))}
        </div>

        {!loading && books.length === 0 && !error && (
          <div style={{ fontSize: 13, color: '#998F80', textAlign: 'center', marginTop: 40 }}>
            {isAdmin ? 'No books yet. Tap Admin above to add your first one.' : 'No books yet. Check back soon!'}
          </div>
        )}
      </div>
    </div>
  );
}
function AudioPlayer({ book }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnd);
    };
  }, [book.audio_url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };
  const skip = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };
  const onSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Number(e.target.value);
    setCurrentTime(Number(e.target.value));
  };
  const cycleRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2, 0.75];
    const idx = rates.indexOf(rate);
    const next = rates[(idx + 1) % rates.length];
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!book.audio_url) {
    return (
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, textAlign: 'center', border: `1px solid ${COLORS.line}` }}>
        <Volume2 size={24} color="#C8BCA8" style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 13, color: '#998F80' }}>Audio for this book is coming soon.</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}` }}>
      <audio ref={audioRef} src={book.audio_url} preload="metadata" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: '#998F80', minWidth: 36 }}>{fmt(currentTime)}</span>
        <input type="range" min={0} max={duration || 0} value={currentTime} onChange={onSeek}
          style={{ flex: 1, accentColor: COLORS.accent }} />
        <span style={{ fontSize: 11, color: '#998F80', minWidth: 36, textAlign: 'right' }}>{fmt(duration)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <button onClick={() => skip(-15)} title="Back 15s" style={{ background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Rewind size={20} />
        </button>
        <button onClick={togglePlay} style={{
          width: 52, height: 52, borderRadius: '50%', border: 'none', background: COLORS.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(194,69,107,0.3)',
        }}>
          {playing ? <Pause size={22} /> : <Play size={22} />}
        </button>
        <button onClick={() => skip(15)} title="Forward 15s" style={{ background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <FastForward size={20} />
        </button>
        <button onClick={cycleRate} title="Playback speed" style={{ background: COLORS.sand, border: 'none', borderRadius: 14, padding: '4px 10px', color: COLORS.ink, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
          {rate}x
        </button>
      </div>
    </div>
  );
}

function WorkbookTab({ auth, book }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [draftAnswers, setDraftAnswers] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const qs = await sb.rest('workbook_questions', { token: auth.token, query: `?book_id=eq.${book.id}&order=question_order.asc` });
        setQuestions(qs || []);
        const rs = await sb.rest('workbook_responses', { token: auth.token, query: `?user_id=eq.${auth.user.id}&question_id=in.(${(qs || []).map((q) => q.id).join(',') || 'null'})` });
        const map = {};
        (rs || []).forEach((r) => { map[r.question_id] = r; });
        setResponses(map);
      } catch (err) { console.error('Workbook load error:', err); }
      setLoading(false);
    })();
  }, [book.id]);

  const submitReflection = async (q) => {
    const text = draftAnswers[q.id] ?? responses[q.id]?.answer_text ?? '';
    if (!text.trim()) return;
    setSavingId(q.id);
    try {
      const saved = await sb.rest('workbook_responses', {
        method: 'POST', token: auth.token,
        body: { user_id: auth.user.id, question_id: q.id, answer_text: text, points_earned: q.points || 10 },
      });
      setResponses((r) => ({ ...r, [q.id]: saved[0] }));
      await bumpPoints(auth, q.points || 10);
    } catch (err) { console.error('Save reflection error:', err); }
    setSavingId(null);
  };

  const submitQuiz = async (q, optionIndex) => {
    if (responses[q.id]) return; // already answered
    setSavingId(q.id);
    const isCorrect = optionIndex === q.correct_index;
    try {
      const saved = await sb.rest('workbook_responses', {
        method: 'POST', token: auth.token,
        body: {
          user_id: auth.user.id, question_id: q.id, selected_index: optionIndex,
          answer_text: (q.options || [])[optionIndex] ?? '', is_correct: isCorrect,
          points_earned: isCorrect ? (q.points || 10) : 0,
        },
      });
      setResponses((r) => ({ ...r, [q.id]: saved[0] }));
      if (isCorrect) await bumpPoints(auth, q.points || 10);
    } catch (err) { console.error('Save quiz error:', err); }
    setSavingId(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#998F80', fontSize: 13, padding: 20 }}><Loader2 size={16} className="spin" /> Loading workbook...</div>;
  }
  if (questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 30, color: '#998F80' }}>
        <ClipboardList size={26} color="#C8BCA8" style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 13 }}>No workbook questions yet for this book.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {questions.map((q, idx) => {
        const response = responses[q.id];
        return (
          <div key={q.id} style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${COLORS.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {q.type === 'quiz' ? `Quiz · ${idx + 1}` : `Reflection · ${idx + 1}`}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink, marginBottom: 12, lineHeight: 1.4 }}>{q.prompt}</div>

            {q.type === 'reflection' ? (
              <>
                <textarea
                  defaultValue={response?.answer_text || ''}
                  onChange={(e) => setDraftAnswers((d) => ({ ...d, [q.id]: e.target.value }))}
                  placeholder="Write your answer..."
                  disabled={!!response}
                  style={{ width: '100%', minHeight: 70, padding: 10, borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', background: response ? COLORS.sand : '#fff' }}
                />
                {!response && (
                  <button onClick={() => submitReflection(q)} disabled={savingId === q.id} style={{ marginTop: 8, padding: '7px 16px', borderRadius: 8, border: 'none', background: COLORS.accent, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                    {savingId === q.id ? 'Saving...' : `Submit (+${q.points || 10} pts)`}
                  </button>
                )}
                {response && <div style={{ fontSize: 11.5, color: '#2F8F6F', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={13} /> Answered · +{response.points_earned} pts</div>}
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(q.options || []).map((opt, i) => {
                  const isSelected = response?.selected_index === i;
                  const showResult = !!response;
                  const isCorrectOpt = i === q.correct_index;
                  let bg = '#fff', border = COLORS.line, textColor = COLORS.ink;
                  if (showResult) {
                    if (isCorrectOpt) { bg = '#EAF6EE'; border = '#2F8F6F'; textColor = '#2F8F6F'; }
                    else if (isSelected) { bg = '#FBEAEA'; border = COLORS.accent; textColor = COLORS.accent; }
                  }
                  return (
                    <button key={i} onClick={() => submitQuiz(q, i)} disabled={!!response || savingId === q.id}
                      style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${border}`, background: bg, color: textColor, fontSize: 13, cursor: response ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{opt}</span>
                      {showResult && isCorrectOpt && <CheckCircle2 size={15} />}
                      {showResult && isSelected && !isCorrectOpt && <XCircle size={15} />}
                    </button>
                  );
                })}
                {response && (
                  <div style={{ fontSize: 11.5, color: response.is_correct ? '#2F8F6F' : COLORS.accent, marginTop: 4 }}>
                    {response.is_correct ? `Correct! +${response.points_earned} pts` : 'Not quite — the correct answer is highlighted.'}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

async function bumpPoints(auth, amount) {
  try {
    const existing = await sb.rest('user_points', { token: auth.token, query: `?user_id=eq.${auth.user.id}` });
    if (existing && existing.length > 0) {
      await sb.rest(`user_points?user_id=eq.${auth.user.id}`, {
        method: 'PATCH', token: auth.token, body: { total_points: existing[0].total_points + amount, updated_at: new Date().toISOString() },
      });
    } else {
      await sb.rest('user_points', { method: 'POST', token: auth.token, body: { user_id: auth.user.id, total_points: amount } });
    }
  } catch (err) { console.error('Points update error:', err); }
}

function BookDetailScreen({ auth, book, onBack, onLogout, onOpenMindMap }) {
  const [tab, setTab] = useState('listen'); // listen | read | workbook
  const [points, setPoints] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const rows = await sb.rest('user_points', { token: auth.token, query: `?user_id=eq.${auth.user.id}&select=total_points` });
        setPoints(rows && rows.length > 0 ? rows[0].total_points : 0);
      } catch (err) { console.error('Points load error:', err); }
    })();
  }, [tab]);

  const TABS = [
    { key: 'listen', label: 'Listen', Icon: Volume2 },
    { key: 'read', label: 'Read', Icon: FileText },
    { key: 'workbook', label: 'Workbook', Icon: ClipboardList },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.cream, fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', display: 'flex', flexShrink: 0 }}><ArrowLeft size={19} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</div>
          <div style={{ fontSize: 11, color: '#998F80' }}>{book.author}</div>
        </div>
        {points !== null && (
          <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.accent, background: COLORS.accentSoft, padding: '4px 10px', borderRadius: 12, flexShrink: 0 }}>
            ⭐ {points} pts
          </div>
        )}
        <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#998F80', cursor: 'pointer', display: 'flex', flexShrink: 0 }}><LogOut size={17} /></button>
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.line}`, background: '#fff' }}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '11px 0', border: 'none', background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 12.5, fontWeight: 700, color: tab === key ? COLORS.accent : '#998F80',
            borderBottom: tab === key ? `2.5px solid ${COLORS.accent}` : '2.5px solid transparent',
          }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'listen' && <AudioPlayer book={book} />}
        {tab === 'read' && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 18, border: `1px solid ${COLORS.line}` }}>
            {book.pdf_url && (
              <a href={book.pdf_url} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10,
                background: COLORS.sand, color: COLORS.ink, fontSize: 13, fontWeight: 600, textDecoration: 'none', marginBottom: 14,
              }}>
                <FileText size={16} /> Open full PDF
              </a>
            )}
            {book.text_content ? (
              <div style={{ fontSize: 13.5, color: COLORS.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{book.text_content}</div>
            ) : !book.pdf_url ? (
              <div style={{ textAlign: 'center', color: '#998F80', padding: 20 }}>
                <FileText size={24} color="#C8BCA8" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>No text content added yet.</div>
              </div>
            ) : null}
          </div>
        )}
        {tab === 'workbook' && <WorkbookTab auth={auth} book={book} />}
      </div>

      <button onClick={onOpenMindMap} style={{
        margin: 16, marginTop: 0, padding: '13px 0', borderRadius: 14, border: 'none',
        background: COLORS.ink, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Map size={16} /> Open mind map for this book
      </button>
    </div>
  );
}
function AdminPanel({ auth, onBack }) {
  const [tab, setTab] = useState('books'); // books | questions
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null); // null = list, 'new' = creating, or a book object
  const [selectedBookForQuestions, setSelectedBookForQuestions] = useState(null);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const rows = await sb.rest('books', { token: auth.token, query: '?select=*&order=title.asc' });
      setBooks(rows || []);
    } catch (err) { console.error('Admin load error:', err); }
    setLoading(false);
  };
  useEffect(() => { loadBooks(); }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: COLORS.cream, fontFamily: "'Poppins', 'Segoe UI', sans-serif" }}>
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', display: 'flex' }}><ArrowLeft size={19} /></button>
        <div style={{ fontWeight: 800, fontSize: 15, color: COLORS.ink }}>Admin panel</div>
      </div>

      <div style={{ display: 'flex', borderBottom: `1px solid ${COLORS.line}`, background: '#fff' }}>
        <button onClick={() => { setTab('books'); setEditingBook(null); setSelectedBookForQuestions(null); }} style={{ flex: 1, padding: '11px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: tab === 'books' ? COLORS.accent : '#998F80', borderBottom: tab === 'books' ? `2.5px solid ${COLORS.accent}` : '2.5px solid transparent' }}>Books</button>
        <button onClick={() => setTab('questions')} style={{ flex: 1, padding: '11px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: tab === 'questions' ? COLORS.accent : '#998F80', borderBottom: tab === 'questions' ? `2.5px solid ${COLORS.accent}` : '2.5px solid transparent' }}>Workbook questions</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {tab === 'books' && (
          editingBook ? (
            <BookEditForm auth={auth} book={editingBook === 'new' ? null : editingBook} onDone={() => { setEditingBook(null); loadBooks(); }} />
          ) : (
            <>
              <button onClick={() => setEditingBook('new')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
                <Plus size={15} /> Add a book
              </button>
              {loading ? <div style={{ color: '#998F80', fontSize: 13 }}>Loading...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {books.map((b) => (
                    <div key={b.id} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: COLORS.ink }}>{b.title}</div>
                        <div style={{ fontSize: 11, color: '#998F80' }}>{b.author} {b.audio_url ? '· 🔊 audio set' : '· no audio'}</div>
                      </div>
                      <button onClick={() => setEditingBook(b)} style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )
        )}

        {tab === 'questions' && (
          selectedBookForQuestions ? (
            <QuestionsEditor auth={auth} book={selectedBookForQuestions} onBack={() => setSelectedBookForQuestions(null)} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12.5, color: '#998F80', marginBottom: 6 }}>Pick a book to manage its workbook questions:</div>
              {books.map((b) => (
                <button key={b.id} onClick={() => setSelectedBookForQuestions(b)} style={{ textAlign: 'left', background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12, fontSize: 13.5, fontWeight: 600, color: COLORS.ink, cursor: 'pointer' }}>
                  {b.title}
                </button>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function BookEditForm({ auth, book, onDone }) {
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [description, setDescription] = useState(book?.description || '');
  const [textContent, setTextContent] = useState(book?.text_content || '');
  const [audioUrl, setAudioUrl] = useState(book?.audio_url || '');
  const [pdfUrl, setPdfUrl] = useState(book?.pdf_url || '');
  const [coverUrl, setCoverUrl] = useState(book?.cover_url || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState('');

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAudio(true);
    try {
      const path = `audio/${Date.now()}_${file.name}`;
      const url = await sb.uploadFile(auth.token, 'book-content', path, file);
      setAudioUrl(url);
    } catch (err) { setError('Audio upload failed: ' + err.message); }
    setUploadingAudio(false);
  };
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const path = `pdf/${Date.now()}_${file.name}`;
      const url = await sb.uploadFile(auth.token, 'book-content', path, file);
      setPdfUrl(url);
    } catch (err) { setError('PDF upload failed: ' + err.message); }
    setUploadingPdf(false);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    try {
      const body = { title, author, description, text_content: textContent, audio_url: audioUrl || null, pdf_url: pdfUrl || null, cover_url: coverUrl || null };
      if (book) {
        await sb.rest(`books?id=eq.${book.id}`, { method: 'PATCH', token: auth.token, body });
      } else {
        await sb.rest('books', { method: 'POST', token: auth.token, body });
      }
      onDone();
    } catch (err) { setError('Save failed: ' + err.message); }
    setSaving(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${COLORS.line}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 14 }}>{book ? 'Edit book' : 'Add a new book'}</div>
      <FieldInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Atomic Habits" />
      <FieldInput label="Author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="James Clear" />
      <FieldInput label="Cover image URL (optional)" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://..." />

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..."
          style={{ width: '100%', minHeight: 60, padding: 10, marginTop: 6, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Audio file</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: COLORS.sand, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: COLORS.ink }}>
            <Upload size={14} /> {uploadingAudio ? 'Uploading...' : 'Upload audio'}
            <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: 'none' }} disabled={uploadingAudio} />
          </label>
          {audioUrl && <span style={{ fontSize: 11, color: '#2F8F6F' }}>✓ Audio set</span>}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>PDF file</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, background: COLORS.sand, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', color: COLORS.ink }}>
            <Upload size={14} /> {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
            <input type="file" accept="application/pdf" onChange={handlePdfUpload} style={{ display: 'none' }} disabled={uploadingPdf} />
          </label>
          {pdfUrl && <span style={{ fontSize: 11, color: '#2F8F6F' }}>✓ PDF set</span>}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Text content (optional excerpt, shown in "Read" tab)</label>
        <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Paste book excerpt or summary text..."
          style={{ width: '100%', minHeight: 120, padding: 10, marginTop: 6, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      {error && <div style={{ fontSize: 12.5, color: COLORS.accent, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save book'}
        </button>
        <button onClick={onDone} style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${COLORS.line}`, background: '#fff', color: COLORS.ink, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function QuestionsEditor({ auth, book, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const rows = await sb.rest('workbook_questions', { token: auth.token, query: `?book_id=eq.${book.id}&order=question_order.asc` });
      setQuestions(rows || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };
  useEffect(() => { load(); }, [book.id]);

  const deleteQuestion = async (id) => {
    try {
      await sb.rest(`workbook_questions?id=eq.${id}`, { method: 'DELETE', token: auth.token });
      load();
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8A8070', fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 12 }}>
        <ArrowLeft size={13} /> Back to book list
      </button>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginBottom: 12 }}>{book.title} — workbook questions</div>

      {adding ? (
        <QuestionForm auth={auth} book={book} nextOrder={questions.length} onDone={() => { setAdding(false); load(); }} />
      ) : (
        <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}>
          <Plus size={15} /> Add question
        </button>
      )}

      {loading ? <div style={{ color: '#998F80', fontSize: 13 }}>Loading...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {questions.map((q) => (
            <div key={q.id} style={{ background: '#fff', border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: COLORS.accent, textTransform: 'uppercase', marginBottom: 3 }}>{q.type}</div>
                  <div style={{ fontSize: 13, color: COLORS.ink }}>{q.prompt}</div>
                  {q.type === 'quiz' && (
                    <div style={{ fontSize: 11, color: '#998F80', marginTop: 4 }}>
                      Options: {(q.options || []).join(' / ')} — correct: {(q.options || [])[q.correct_index]}
                    </div>
                  )}
                </div>
                <button onClick={() => deleteQuestion(q.id)} style={{ background: 'none', border: 'none', color: COLORS.accent, cursor: 'pointer', flexShrink: 0 }}>
                  <Trash size={15} />
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && <div style={{ fontSize: 12.5, color: '#998F80' }}>No questions yet.</div>}
        </div>
      )}
    </div>
  );
}

function QuestionForm({ auth, book, nextOrder, onDone }) {
  const [type, setType] = useState('reflection');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [points, setPoints] = useState(10);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!prompt.trim()) { setError('Question prompt is required.'); return; }
    if (type === 'quiz' && options.filter((o) => o.trim()).length < 2) { setError('Add at least 2 options for a quiz question.'); return; }
    setSaving(true); setError('');
    try {
      const body = {
        book_id: book.id, question_order: nextOrder, type, prompt, points,
        options: type === 'quiz' ? options.filter((o) => o.trim()) : null,
        correct_index: type === 'quiz' ? correctIndex : null,
      };
      await sb.rest('workbook_questions', { method: 'POST', token: auth.token, body });
      onDone();
    } catch (err) { setError('Save failed: ' + err.message); }
    setSaving(false);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 16, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <button onClick={() => setType('reflection')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1.5px solid ${type === 'reflection' ? COLORS.accent : COLORS.line}`, background: type === 'reflection' ? COLORS.accentSoft : '#fff', color: type === 'reflection' ? COLORS.accent : COLORS.ink, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Reflection</button>
        <button onClick={() => setType('quiz')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1.5px solid ${type === 'quiz' ? COLORS.accent : COLORS.line}`, background: type === 'quiz' ? COLORS.accentSoft : '#fff', color: type === 'quiz' ? COLORS.accent : COLORS.ink, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Quiz</button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Question prompt</label>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={type === 'quiz' ? 'What is the 1% rule?' : 'How will you apply this principle this week?'}
          style={{ width: '100%', minHeight: 60, padding: 10, marginTop: 6, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
      </div>

      {type === 'quiz' && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.ink }}>Options (tap the radio to mark correct answer)</label>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input type="radio" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
              <input value={opt} onChange={(e) => { const next = [...options]; next[i] = e.target.value; setOptions(next); }} placeholder={`Option ${i + 1}`}
                style={{ flex: 1, padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${COLORS.line}`, fontSize: 13, outline: 'none' }} />
            </div>
          ))}
        </div>
      )}

      <FieldInput label="Points for correct/completing" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />

      {error && <div style={{ fontSize: 12.5, color: COLORS.accent, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: COLORS.accent, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save question'}
        </button>
        <button onClick={onDone} style={{ padding: '10px 16px', borderRadius: 10, border: `1.5px solid ${COLORS.line}`, background: '#fff', color: COLORS.ink, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
function MindBoardScreen({ auth, book, onBack, onLogout }) {
  const [items, setItems] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [search, setSearch] = useState('');
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [listening, setListening] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [boardId, setBoardId] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const [loadingBoard, setLoadingBoard] = useState(true);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const dragRef = useRef(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    (async () => {
      setLoadingBoard(true);
      try {
        const existing = await sb.rest('boards', { token: auth.token, query: `?user_id=eq.${auth.user.id}&book_id=eq.${book.id}&select=id` });
        let bId;
        if (existing && existing.length > 0) { bId = existing[0].id; }
        else {
          const created = await sb.rest('boards', { method: 'POST', token: auth.token, body: { user_id: auth.user.id, book_id: book.id } });
          bId = created[0].id;
        }
        setBoardId(bId);
        const loadedItems = await sb.rest('board_items', { token: auth.token, query: `?board_id=eq.${bId}` });
        const loadedConns = await sb.rest('board_connections', { token: auth.token, query: `?board_id=eq.${bId}` });
        setItems((loadedItems || []).map((it) => ({ ...it, x: Number(it.x), y: Number(it.y), w: Number(it.w), h: Number(it.h) })));
        setConnections((loadedConns || []).map((c) => ({ id: c.id, from: c.from_item, to: c.to_item })));
      } catch (err) { console.error('Load error:', err); }
      setLoadingBoard(false);
    })();
  }, [book.id]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await sb.rest('user_uploads', { token: auth.token, query: `?user_id=eq.${auth.user.id}&select=id,name,storage_path&order=created_at.desc` });
        setUploadedImages((rows || []).map((r) => ({ id: r.id, src: r.storage_path, name: r.name })));
      } catch (err) { console.error('Could not load uploads:', err); }
    })();
  }, []);

  useEffect(() => {
    if (!boardId || loadingBoard) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveBoard(), 900);
    return () => clearTimeout(saveTimer.current);
  }, [items, connections, boardId]);

  const saveBoard = async () => {
    if (!boardId) return;
    setSaveState('saving');
    try {
      await sb.rest(`board_items?board_id=eq.${boardId}`, { method: 'DELETE', token: auth.token });
      if (items.length > 0) await sb.rest('board_items', { method: 'POST', token: auth.token, body: items.map((it) => ({ ...it, board_id: boardId })) });
      await sb.rest(`board_connections?board_id=eq.${boardId}`, { method: 'DELETE', token: auth.token });
      if (connections.length > 0) await sb.rest('board_connections', { method: 'POST', token: auth.token, body: connections.map((c) => ({ id: c.id, board_id: boardId, from_item: c.from, to_item: c.to })) });
      setSaveState('saved');
    } catch (err) { console.error('Save error:', err); setSaveState('error'); }
  };

  const pushHistory = useCallback(() => { setHistory((h) => [...h.slice(-19), { items, connections }]); setFuture([]); }, [items, connections]);

  const filteredAssets = useMemo(() => {
    if (!search.trim()) return ASSET_LIBRARY;
    const q = search.toLowerCase().trim();
    return ASSET_LIBRARY.filter((a) => a.tags.some((t) => t.includes(q)) || a.theme.includes(q));
  }, [search]);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Voice search needs Chrome or another supporting browser.'); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'en-US'; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => setSearch(e.results[0][0].transcript);
    rec.start();
  };

  const addItem = (partial) => {
    pushHistory();
    const id = nextId();
    setItems((its) => [...its, { id, x: 140 + Math.random() * 160, y: 120 + Math.random() * 160, w: 100, h: 70, label: '', highlight: false, ...partial }]);
    setSelectedIds([id]);
  };
  const addEmoji = (asset) => addItem({ type: 'emoji', glyph: asset.glyph, label: asset.tags[0], w: 70, h: 70 });
  const addShape = (shapeType) => addItem({ type: 'shape', shape: shapeType, label: 'Label', color: '#FFF6E9', w: shapeType === 'diamond' ? 90 : 110, h: shapeType === 'diamond' ? 90 : 70 });
  const addText = () => addItem({ type: 'text', label: 'Type here...', w: 140, h: 50 });
  const addImage = (src, name) => addItem({ type: 'image', src, label: name, w: 110, h: 110 });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      try {
        const url = await sb.uploadImage(auth.token, auth.user.id, file);
        setUploadedImages((imgs) => [...imgs, { id: nextId('img'), src: url, name: file.name }]);
        await sb.rest('user_uploads', { method: 'POST', token: auth.token, body: { user_id: auth.user.id, name: file.name, storage_path: url } });
      } catch (err) { console.error('Upload failed:', err); alert('Upload failed: ' + err.message); }
    }
    e.target.value = '';
  };

  const handlePointerDown = (e, item) => {
    e.stopPropagation();
    if (connectMode) {
      if (!connectFrom) setConnectFrom(item.id);
      else if (connectFrom !== item.id) { pushHistory(); setConnections((cs) => [...cs, { id: nextId('c'), from: connectFrom, to: item.id }]); setConnectFrom(null); }
      return;
    }
    const isMulti = e.shiftKey;
    setSelectedIds((prev) => { if (isMulti) return prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]; return [item.id]; });
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = { id: item.id, startX: clientX, startY: clientY, origX: item.x, origY: item.y, moved: false };
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
  };
  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    e.preventDefault?.();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragRef.current.startX;
    const dy = clientY - dragRef.current.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true;
    const { id, origX, origY } = dragRef.current;
    setItems((its) => its.map((it) => it.id === id ? { ...it, x: origX + dx, y: origY + dy } : it));
  };
  const handlePointerUp = () => {
    if (dragRef.current?.moved) pushHistory();
    dragRef.current = null;
    window.removeEventListener('mousemove', handlePointerMove);
    window.removeEventListener('mouseup', handlePointerUp);
    window.removeEventListener('touchmove', handlePointerMove);
    window.removeEventListener('touchend', handlePointerUp);
  };
  const handleCanvasClick = () => { if (!connectMode) setSelectedIds([]); };

  const startEdit = (item) => { if (item.type === 'image' || item.type === 'emoji') return; setEditingId(item.id); setEditingText(item.label); };
  const commitEdit = () => {
    if (editingId) { pushHistory(); setItems((its) => its.map((it) => it.id === editingId ? { ...it, label: editingText } : it)); }
    setEditingId(null);
  };

  const handleHighlight = () => {
    if (!selectedIds.length) return;
    pushHistory();
    setItems((its) => its.map((it) => selectedIds.includes(it.id) ? { ...it, highlight: !it.highlight } : it));
  };
  const handleCopy = () => { if (selectedIds.length) setClipboard(items.filter((it) => selectedIds.includes(it.id))); };
  const handleCut = () => {
    if (!selectedIds.length) return;
    setClipboard(items.filter((it) => selectedIds.includes(it.id)));
    pushHistory();
    setItems((its) => its.filter((it) => !selectedIds.includes(it.id)));
    setConnections((cs) => cs.filter((c) => !selectedIds.includes(c.from) && !selectedIds.includes(c.to)));
    setSelectedIds([]);
  };
  const handlePaste = () => {
    if (!clipboard.length) return;
    pushHistory();
    const newItems = clipboard.map((it) => ({ ...it, id: nextId(), x: it.x + 28, y: it.y + 28 }));
    setItems((its) => [...its, ...newItems]);
    setSelectedIds(newItems.map((i) => i.id));
  };
  const handleDelete = () => {
    if (!selectedIds.length) return;
    pushHistory();
    setItems((its) => its.filter((it) => !selectedIds.includes(it.id)));
    setConnections((cs) => cs.filter((c) => !selectedIds.includes(c.from) && !selectedIds.includes(c.to)));
    setSelectedIds([]);
  };
  const handleUndo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setFuture((f) => [{ items, connections }, ...f]);
    setHistory((h) => h.slice(0, -1));
    setItems(prev.items); setConnections(prev.connections); setSelectedIds([]);
  };
  const handleRedo = () => {
    if (!future.length) return;
    const next = future[0];
    setHistory((h) => [...h, { items, connections }]);
    setFuture((f) => f.slice(1));
    setItems(next.items); setConnections(next.connections); setSelectedIds([]);
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); handleRedo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') handleCopy();
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') handleCut();
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') handlePaste();
      if (e.key === 'Delete' || e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') { setConnectMode(false); setConnectFrom(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, connections, selectedIds, history, future, clipboard]);

  const getCenter = (it) => ({ x: it.x + it.w / 2, y: it.y + it.h / 2 });
  const itemById = (id) => items.find((it) => it.id === id);

  const renderItem = (item) => {
    const isSelected = selectedIds.includes(item.id);
    const isConnectSource = connectFrom === item.id;
    const baseStyle = { position: 'absolute', left: item.x, top: item.y, width: item.w, height: item.h, touchAction: 'none', cursor: connectMode ? 'crosshair' : 'grab' };
    let content;
    if (item.type === 'emoji') {
      content = (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', outline: isSelected ? `2.5px dashed ${COLORS.accent}` : isConnectSource ? `2.5px solid ${COLORS.accent}` : 'none', outlineOffset: 4, borderRadius: 12 }}>
          <div style={{ fontSize: 38, lineHeight: 1 }}>{item.glyph}</div>
          {item.label && <div style={{ fontSize: 10, color: '#6B6258', fontWeight: 600, marginTop: 2 }}>{item.label}</div>}
        </div>
      );
    } else if (item.type === 'shape') {
      const shapeStyle = {
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 600, color: '#2A2A2A', background: item.color || '#FFF6E9',
        border: isSelected ? `2.5px solid ${COLORS.accent}` : isConnectSource ? `2.5px solid ${COLORS.accent}` : '2px solid #D8CDBF',
        boxShadow: isSelected ? `0 0 0 3px rgba(194,69,107,0.15)` : '0 2px 6px rgba(0,0,0,0.08)',
        padding: 8, textAlign: 'center', wordBreak: 'break-word', userSelect: 'none',
        borderRadius: item.shape === 'circle' ? '50%' : item.shape === 'rect' ? 12 : 0,
        transform: item.shape === 'diamond' ? 'rotate(45deg)' : 'none',
      };
      content = <div style={shapeStyle}><span style={{ transform: item.shape === 'diamond' ? 'rotate(-45deg)' : 'none', maxWidth: item.shape === 'diamond' ? '70%' : '100%' }}>{item.label}</span></div>;
    } else if (item.type === 'text') {
      content = (
        <div style={{ width: '100%', height: '100%', padding: '6px 10px', fontSize: 14, fontWeight: 500, color: '#2A2A2A', background: item.highlight ? '#FFF1A8' : 'transparent', border: isSelected ? `2px dashed ${COLORS.accent}` : '1.5px dashed #C8BCA8', borderRadius: 8, userSelect: 'none', whiteSpace: 'pre-wrap', overflow: 'hidden' }}>
          {item.label}
        </div>
      );
    } else if (item.type === 'image') {
      content = (
        <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', border: isSelected ? `2.5px solid ${COLORS.accent}` : '2px solid #D8CDBF', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', background: '#fff' }}>
          <img src={item.src} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable={false} />
        </div>
      );
    }
    return (
      <div key={item.id} style={baseStyle} onMouseDown={(e) => handlePointerDown(e, item)} onTouchStart={(e) => handlePointerDown(e, item)} onDoubleClick={() => startEdit(item)}>
        {content}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', fontFamily: "'Poppins', 'Segoe UI', sans-serif", background: COLORS.cream, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: '#fff', borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onBack} title="Back to book" style={{ background: 'none', border: 'none', color: COLORS.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{book.title}</div>
          <div style={{ fontSize: 10.5, color: '#998F80' }}>{book.author}</div>
        </div>
        <div style={{ flex: 1, minWidth: 100, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, color: '#998F80' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search: man, axe, tree..."
            style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 20, border: `1.5px solid ${COLORS.line}`, fontSize: 13, outline: 'none', background: COLORS.sand }} />
        </div>
        <button onClick={startVoiceSearch} title="Search by voice" style={{ width: 34, height: 34, borderRadius: '50%', border: 'none', background: listening ? COLORS.accent : COLORS.accentSoft, color: listening ? '#fff' : COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Mic size={16} />
        </button>
        <button onClick={() => fileInputRef.current?.click()} title="Upload image" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 20, border: 'none', background: COLORS.ink, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          <Upload size={14} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
        <span style={{ fontSize: 11, color: saveState === 'error' ? COLORS.accent : '#998F80', minWidth: 50, flexShrink: 0 }}>
          {saveState === 'saving' && 'Saving...'}
          {saveState === 'saved' && '✓ Saved'}
          {saveState === 'error' && 'Save failed'}
        </span>
        <button onClick={onLogout} title="Log out" style={{ background: 'none', border: 'none', color: '#998F80', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <LogOut size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: COLORS.sand, borderBottom: `1px solid ${COLORS.line}`, overflowX: 'auto' }}>
        {SHAPE_TYPES.map(({ type, label, Icon }) => (
          <ToolButton key={type} onClick={() => addShape(type)} label={label}><Icon size={16} /></ToolButton>
        ))}
        <ToolButton onClick={addText} label="Text"><Type size={16} /></ToolButton>
        <ToolButton onClick={handleHighlight} label="Highlight"><Highlighter size={16} /></ToolButton>
        <ToolButton onClick={() => { setConnectMode((m) => !m); setConnectFrom(null); }} label="Connect" active={connectMode}><Link2 size={16} /></ToolButton>
        <Divider />
        <ToolButton onClick={handleCopy} label="Copy" disabled={!selectedIds.length}><Copy size={16} /></ToolButton>
        <ToolButton onClick={handleCut} label="Cut" disabled={!selectedIds.length}><Scissors size={16} /></ToolButton>
        <ToolButton onClick={handleDelete} label="Delete" disabled={!selectedIds.length}><Trash2 size={16} /></ToolButton>
        <Divider />
        <ToolButton onClick={handleUndo} label="Undo" disabled={!history.length}><Undo2 size={16} /></ToolButton>
        <ToolButton onClick={handleRedo} label="Redo" disabled={!future.length}><Redo2 size={16} /></ToolButton>
        <Divider />
        <span style={{ fontSize: 11.5, color: '#998F80', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {connectMode ? (connectFrom ? 'Tap second item' : 'Tap first item') : `${items.length} items`}
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div ref={canvasRef} onClick={handleCanvasClick} style={{ flex: 1, position: 'relative', overflow: 'auto', backgroundImage: 'radial-gradient(circle, #E3D7C5 1px, transparent 1px)', backgroundSize: '22px 22px', backgroundColor: COLORS.cream }}>
          {loadingBoard ? (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: '#B8AC98', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Loader2 size={18} className="spin" /> Loading your board...
              <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', minWidth: 1000, minHeight: 1000 }}>
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
                    <polygon points="0 0, 10 4, 0 8" fill={COLORS.accent} />
                  </marker>
                </defs>
                {connections.map((c) => {
                  const fromItem = itemById(c.from);
                  const toItem = itemById(c.to);
                  if (!fromItem || !toItem) return null;
                  const p1 = getCenter(fromItem); const p2 = getCenter(toItem);
                  return <line key={c.id} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={COLORS.accent} strokeWidth={2.5} markerEnd="url(#arrowhead)" />;
                })}
              </svg>
              <div style={{ position: 'relative', width: 1000, height: 1000, minWidth: '100%', minHeight: '100%' }}>
                {items.map(renderItem)}
              </div>
              {items.length === 0 && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', color: '#B8AC98', pointerEvents: 'none', maxWidth: 280 }}>
                  <div style={{ fontSize: 38, marginBottom: 8 }}>🗺️</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Map out "{book.title}"</div>
                  <div style={{ fontSize: 12.5, marginTop: 4 }}>Search an icon below, or tap a shape above, to add your first idea.</div>
                </div>
              )}
              {editingId && (() => {
                const it = itemById(editingId);
                if (!it) return null;
                return (
                  <div style={{ position: 'absolute', left: it.x, top: it.y + it.h + 6, zIndex: 50, background: '#fff', border: `1.5px solid ${COLORS.accent}`, borderRadius: 8, padding: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    <textarea autoFocus value={editingText} onChange={(e) => setEditingText(e.target.value)} onBlur={commitEdit}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); } }}
                      style={{ width: 160, height: 60, fontSize: 13, border: 'none', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
                  </div>
                );
              })()}
            </>
          )}
        </div>

        <div style={{ width: paletteOpen ? 168 : 0, transition: 'width 0.2s', borderLeft: paletteOpen ? `1px solid ${COLORS.line}` : 'none', background: '#fff', overflowY: 'auto', flexShrink: 0 }}>
          {paletteOpen && (
            <div style={{ padding: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#998F80', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {search ? `Results (${filteredAssets.length})` : 'Asset library'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {filteredAssets.slice(0, 60).map((a) => (
                  <button key={a.id} onClick={() => addEmoji(a)} title={a.tags.join(', ')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', borderRadius: 10, border: `1px solid ${COLORS.line}`, background: COLORS.sand, cursor: 'pointer', gap: 2 }}>
                    <span style={{ fontSize: 22 }}>{a.glyph}</span>
                    <span style={{ fontSize: 9, color: '#8A8070', textAlign: 'center', lineHeight: 1.1 }}>{a.tags[0]}</span>
                  </button>
                ))}
                {filteredAssets.length === 0 && <div style={{ fontSize: 12, color: '#B8AC98', gridColumn: '1 / -1', padding: 10, textAlign: 'center' }}>No matches.</div>}
              </div>
              {uploadedImages.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#998F80', margin: '14px 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Your uploads</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {uploadedImages.map((img) => (
                      <button key={img.id} onClick={() => addImage(img.src, img.name)} title={img.name} style={{ padding: 0, borderRadius: 10, border: `1px solid ${COLORS.line}`, overflow: 'hidden', cursor: 'pointer', height: 54, background: '#fff' }}>
                        <img src={img.src} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        <button onClick={() => setPaletteOpen((p) => !p)} style={{ width: 20, border: 'none', borderLeft: `1px solid ${COLORS.line}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#998F80', flexShrink: 0 }}>
          {paletteOpen ? '›' : '‹'}
        </button>
      </div>
    </div>
  );
}

function ToolButton({ children, onClick, label, active, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} title={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, flexShrink: 0, border: active ? `1.5px solid ${COLORS.accent}` : '1.5px solid transparent', background: active ? COLORS.accentSoft : '#fff', color: disabled ? '#CFC6B8' : '#2A2A2A', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  );
}
function Divider() { return <div style={{ width: 1, height: 22, background: '#E3D7C5', margin: '0 4px', flexShrink: 0 }} />; }
export default function MindBoardRoot() {
  const [screen, setScreen] = useState('signin'); // signin | signup | forgot | recovery | library | bookdetail | mindmap | admin
  const [auth, setAuth] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [recoveryToken, setRecoveryToken] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const token = params.get('access_token');
      if (token) { setRecoveryToken(token); setScreen('recovery'); }
    }
  }, []);

  const handleAuth = (a) => { setAuth(a); setScreen('library'); };
  const handleLogout = () => { setAuth(null); setSelectedBook(null); setScreen('signin'); };

  if (screen === 'recovery' && recoveryToken) {
    return <UpdatePasswordScreen recoveryToken={recoveryToken} onDone={() => setScreen('signin')} />;
  }
  if (!auth) {
    if (screen === 'signup') return <SignUpScreen onAuth={handleAuth} goTo={setScreen} />;
    if (screen === 'forgot') return <ForgotPasswordScreen goTo={setScreen} />;
    return <SignInScreen onAuth={handleAuth} goTo={setScreen} />;
  }

  if (screen === 'admin') {
    return <AdminPanel auth={auth} onBack={() => setScreen('library')} />;
  }

  if (screen === 'mindmap' && selectedBook) {
    return <MindBoardScreen auth={auth} book={selectedBook} onBack={() => setScreen('bookdetail')} onLogout={handleLogout} />;
  }

  if (screen === 'bookdetail' && selectedBook) {
    return (
      <BookDetailScreen
        auth={auth}
        book={selectedBook}
        onBack={() => { setSelectedBook(null); setScreen('library'); }}
        onLogout={handleLogout}
        onOpenMindMap={() => setScreen('mindmap')}
      />
    );
  }

  return (
    <BookLibraryScreen
      auth={auth}
      onOpenBook={(b) => { setSelectedBook(b); setScreen('bookdetail'); }}
      onLogout={handleLogout}
      onOpenAdmin={() => setScreen('admin')}
    />
  );
}
