import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { LogIn, AlertCircle } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[420px]" style={{ background: '#333333', borderRadius: 24, padding: '40px 36px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <GhostPostLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
        </div>

        <h1 className="text-center mb-1.5" style={{ fontSize: 20, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>
          Welcome back
        </h1>
        <p className="text-center mb-7" style={{ fontSize: 13, color: '#aaaaaa' }}>
          Sign in to your GhostPost account
        </p>

        {error && (
          <div className="flex items-center gap-2 mb-5" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle size={14} strokeWidth={1.5} className="text-[#ef4444] shrink-0" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#f87171' }}>{error}</span>
          </div>
        )}

        <div className="space-y-3 mb-5">
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }} className="block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors"
              style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}
              onFocus={(e) => e.target.style.borderColor = '#d4a853'}
              onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }} className="block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors"
              style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}
              onFocus={(e) => e.target.style.borderColor = '#d4a853'}
              onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
            />
          </div>
        </div>

        <GhostButton
          variant="gold"
          size="xl"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          icon={<LogIn size={15} strokeWidth={2} />}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </GhostButton>

        <p className="text-center mt-6" style={{ fontSize: 12, color: '#999999' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#d4a853', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
