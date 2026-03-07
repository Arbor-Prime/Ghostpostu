import { Outlet, useLocation } from 'react-router';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/browser': 'Browser View',
  '/approvals': 'Approvals',
  '/tracked-profiles': 'Tracked Profiles',
  '/personas': 'Personas',
  '/ai-composition': 'AI Composition',
  '/simulation': 'Simulation',
  '/settings': 'Settings',
};

export function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'GhostPost';
  const isBrowserView = location.pathname === '/browser';

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#2b2b2b', padding: '10px 10px 10px 0' }}>
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{
          background: '#313131',
          borderRadius: 20,
          border: '1px solid #444444',
        }}
      >
        {!isBrowserView && <Header title={title} />}
        <main className={`flex-1 overflow-auto ${isBrowserView ? '' : 'px-7 pb-7'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
