import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { UserPlus, AlertCircle, Check } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Passwords match', met: password.length > 0 && password === confirmPassword },
  ];

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/onboarding/welcome');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const fields = [
    { label: 'Full name', type: 'text', value: name, set: setName, ph: 'Your name', autoComplete: 'name' },
    { label: 'Email', type: 'email', value: email, set: setEmail, ph: 'you@company.com', autoComplete: 'email' },
    { label: 'Password', type: 'password', value: password, set: setPassword, ph: 'At least 8 characters', autoComplete: 'new-password' },
    { label: 'Confirm password', type: 'password', value: confirmPassword, set: setConfirmPassword, ph: 'Type it again', autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[420px]" style={{ background: '#333333', borderRadius: 24, padding: '40px 36px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <GhostPostLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
        </div>

        <h1 className="text-center mb-1.5" style={{ fontSize: 20, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.02em' }}>
          Create your account
        </h1>
        <p className="text-center mb-7" style={{ fontSize: 13, color: '#aaaaaa' }}>
          Set up GhostPost in under two minutes
        </p>

        {error && (
          <div className="flex items-center gap-2 mb-5" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle size={14} strokeWidth={1.5} className="text-[#ef4444] shrink-0" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#f87171' }}>{error}</span>
          </div>
        )}

        <div className="space-y-3 mb-4">
          {fields.map((f) => (
            <div key={f.label}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#cccccc' }} className="block mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={f.ph}
                autoComplete={f.autoComplete}
                className="w-full placeholder:text-[#777777] text-[#e5e5e5] focus:outline-none transition-colors"
                style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}
                onFocus={(e) => e.target.style.borderColor = '#d4a853'}
                onBlur={(e) => e.target.style.borderColor = '#4a4a4a'}
              />
            </div>
          ))}
        </div>

        {/* Password strength indicators */}
        {password.length > 0 && (
          <div className="flex gap-4 mb-5">
            {passwordChecks.map((check) => (
              <div key={check.label} className="flex items-center gap-1.5">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 16, height: 16, borderRadius: 5,
                    background: check.met ? 'rgba(34,197,94,0.12)' : '#444444',
                    border: check.met ? '1px solid rgba(34,197,94,0.2)' : '1px solid #505050',
                  }}
                >
                  {check.met && <Check size={9} strokeWidth={3} className="text-[#22c55e]" />}
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, color: check.met ? '#22c55e' : '#999999' }}>{check.label}</span>
              </div>
            ))}
          </div>
        )}

        <GhostButton
          variant="gold"
          size="xl"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          icon={<UserPlus size={15} strokeWidth={2} />}
        >
          {loading ? 'Creating account...' : 'Create account'}
        </GhostButton>

        <p className="text-center mt-6" style={{ fontSize: 12, color: '#999999' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#d4a853', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
