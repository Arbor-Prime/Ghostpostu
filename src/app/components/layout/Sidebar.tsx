import { useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard, Monitor, CheckCircle, Users,
  UserCircle, Sparkles, FlaskConical, Settings,
} from 'lucide-react';
import { GhostPostLogo } from './GhostPostLogo';

const navItems = [
  { icon: LayoutDashboard, path: '/dashboard', label: 'Dashboard' },
  { icon: Monitor, path: '/browser', label: 'Browser View' },
  { icon: CheckCircle, path: '/approvals', label: 'Approvals', badge: 3 },
  { icon: Users, path: '/tracked-profiles', label: 'Tracked Profiles' },
  { icon: UserCircle, path: '/personas', label: 'Personas' },
  { icon: Sparkles, path: '/ai-composition', label: 'AI Composition' },
  { icon: FlaskConical, path: '/simulation', label: 'Simulation' },
  { icon: Settings, path: '/settings', label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-[66px] shrink-0 pl-[10px]">
      <div
        className="flex flex-col items-center py-4 px-2 gap-1 h-full"
        style={{
          borderRadius: 18,
          width: 50,
          background: '#343434',
          border: '1px solid #444444',
        }}
      >
        <div className="mb-4"><GhostPostLogo size={26} /></div>
        <div className="flex flex-col items-center gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                style={{
                  background: isActive ? 'rgba(212,168,83,0.15)' : 'transparent',
                  color: isActive ? '#d4a853' : '#888888',
                  boxShadow: isActive ? 'inset 0 0 0 1px rgba(212,168,83,0.25)' : 'none',
                }}
                title={item.label}
              >
                <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
                {item.badge && (
                  <div
                    className="absolute -top-0.5 -right-0.5 bg-[#d4a853] text-white rounded-full flex items-center justify-center"
                    style={{ width: 14, height: 14, fontSize: 9, fontWeight: 700 }}
                  >
                    {item.badge}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
