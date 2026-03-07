import { Navigate, useLocation } from 'react-router';
import { useAuth } from './auth-context';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#2b2b2b' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="animate-spin"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '2px solid #444444',
              borderTopColor: '#d4a853',
            }}
          />
          <span style={{ fontSize: 13, color: '#999999', fontWeight: 500 }}>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding not complete, redirect to onboarding (unless already there)
  const isOnboarding = location.pathname.startsWith('/onboarding');
  if (!user.onboarding_complete && !isOnboarding) {
    return <Navigate to="/onboarding/recording" replace />;
  }

  return <>{children}</>;
}
