import { createBrowserRouter, redirect } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './components/screens/Login';
import { Signup } from './components/screens/Signup';
import { Welcome } from './components/screens/Welcome';
import { Recording } from './components/screens/Recording';
import { Processing } from './components/screens/Processing';
import { VoiceProfile } from './components/screens/VoiceProfile';
import { PersonaSchedule } from './components/screens/PersonaSchedule';
import { Dashboard } from './components/screens/Dashboard';
import { BrowserView } from './components/screens/BrowserView';
import { Approvals } from './components/screens/Approvals';
import { TrackedProfiles } from './components/screens/TrackedProfiles';
import { Personas } from './components/screens/Personas';
import { AIComposition } from './components/screens/AIComposition';
import { Simulation } from './components/screens/Simulation';
import { Settings } from './components/screens/Settings';

export const router = createBrowserRouter([
  { path: '/', loader: () => redirect('/login') },
  { path: '/login', Component: Login },
  { path: '/signup', Component: Signup },

  { path: '/onboarding/welcome', Component: Welcome },
  { path: '/onboarding/recording', Component: Recording },
  { path: '/onboarding/processing', Component: Processing },
  { path: '/onboarding/voice-profile', Component: VoiceProfile },
  { path: '/onboarding/persona-schedule', Component: PersonaSchedule },

  {
    Component: AppLayout,
    children: [
      { path: '/dashboard', Component: Dashboard },
      { path: '/browser', Component: BrowserView },
      { path: '/approvals', Component: Approvals },
      { path: '/tracked-profiles', Component: TrackedProfiles },
      { path: '/personas', Component: Personas },
      { path: '/ai-composition', Component: AIComposition },
      { path: '/simulation', Component: Simulation },
      { path: '/settings', Component: Settings },
    ],
  },
]);
