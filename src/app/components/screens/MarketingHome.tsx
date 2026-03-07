import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import '../../styles/marketing.css';

const RESTAURANTS = [
  { slug: 'nottingham_bites', handle: '@nottingham_bites', name: 'Nottingham Bites', followers: '2.4K', posts: '84' },
  { slug: 'caffe_lamara', handle: '@caffe_lamara', name: 'Caffè Lamara', followers: '1.8K', posts: '61' },
  { slug: 'hockley_kitchen', handle: '@hockley_kitchen', name: 'Hockley Kitchen', followers: '3.1K', posts: '120' },
  { slug: 'ye_olde_trip', handle: '@ye_olde_trip', name: 'Ye Olde Trip', followers: '5.2K', posts: '203' },
  { slug: 'splendour_nfm', handle: '@splendour_nfm', name: 'Splendour Restaurant', followers: '890', posts: '48' },
];

const HOW_STEPS = [
  { icon: 'mic', title: 'Record your voice', desc: 'Speak naturally for two minutes. Whisper transcription and NLP extracts your vocabulary, tone, sentence patterns, and topics.' },
  { icon: 'link', title: 'Connect accounts', desc: 'Log into Instagram, LinkedIn, or X through the visible browser. Cookie sessions persist — no API keys or developer accounts.' },
  { icon: 'target', title: 'Define targets', desc: 'Pick verticals, locations, and message templates. GhostPost searches, qualifies leads, and queues personalised outreach.' },
  { icon: 'eye', title: 'Watch or walk away', desc: 'The browser streams live. Take control to solve CAPTCHAs or respond. Or close your laptop — GhostPost keeps working.' },
];

const FEATURES = [
  { icon: 'brain', title: 'Voice-learned personality', desc: 'Your voice profile shapes every message — vocabulary, sentence length, punctuation habits, emoji usage, topics you gravitate to.' },
  { icon: 'monitor', title: 'Visible browser', desc: "A real Chromium instance streams to your dashboard. Not headless. Not hidden. You see every click, scroll, and keystroke." },
  { icon: 'clock', title: 'Circadian rhythm engine', desc: 'Eight time-window personas model a real daily pattern — morning commute energy, post-lunch dip, evening wind-down.' },
  { icon: 'pen-tool', title: 'Human typing simulation', desc: 'Gaussian keystroke intervals. Occasional typos with backspace corrections. Bezier mouse curves with overshoot.' },
  { icon: 'shield', title: 'Anti-detection architecture', desc: 'Stealth fingerprinting, residential proxy rotation, Poisson-distributed action timing. Built to pass ML behavioural analysis.' },
  { icon: 'bar-chart-2', title: 'Lead qualification', desc: 'Built-in business vertical mapping with 70+ categories. Auto-classifies leads as target, conditional, or skip.' },
];

const COMPARE_ROWS = [
  { label: 'Learns your actual voice & tone', gp: true, dm: false, manual: true },
  { label: 'Visible browser you can take over', gp: true, dm: false, manual: true },
  { label: 'Human typing with typos & corrections', gp: true, dm: false, manual: true },
  { label: 'Circadian activity patterns', gp: true, dm: false, manual: false },
  { label: 'Scales across multiple accounts', gp: true, dm: true, manual: false },
  { label: 'Runs autonomously while you sleep', gp: true, dm: true, manual: false },
  { label: 'Account safety by design', gp: true, dm: false, manual: true },
];

function FeatureIcon({ name }: { name: string }) {
  // Simple monochrome icon representations using CSS shapes
  const iconMap: Record<string, string> = {
    mic: '🎙', link: '🔗', target: '🎯', eye: '👁',
    brain: '🧠', monitor: '🖥', clock: '⏱', 'pen-tool': '✍️',
    shield: '🛡', 'bar-chart-2': '📊',
  };
  return <span style={{ fontSize: 20 }}>{iconMap[name] || '●'}</span>;
}

export function MarketingHome() {
  const navigate = useNavigate();
  const [dmCount, setDmCount] = useState(0);
  const [currentScreen, setCurrentScreen] = useState<'explore' | 'profile' | 'dm'>('explore');
  const [logEntries, setLogEntries] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('instagram.com');
  const [statusText, setStatusText] = useState('Initialising…');
  const [progress, setProgress] = useState(0);
  const animRef = useRef<boolean>(true);

  // Demo animation loop
  useEffect(() => {
    animRef.current = true;
    let count = 0;

    const wait = (ms: number) => new Promise<void>((resolve) => {
      const t = setTimeout(() => { if (animRef.current) resolve(); }, ms);
      return () => clearTimeout(t);
    });

    const addLog = (text: string) => {
      setLogEntries(prev => [...prev.slice(-8), text]);
    };

    const runDemo = async () => {
      while (animRef.current) {
        const restaurant = RESTAURANTS[count % RESTAURANTS.length];
        const idx = count % 5;

        // Reset
        setLogEntries([]);
        setCurrentScreen('explore');
        setCurrentUrl('instagram.com');
        setStatusText('Starting…');

        await wait(600);
        if (!animRef.current) break;

        addLog(`Searching for restaurants — lead ${idx + 1} of 5`);
        setStatusText('Searching tags…');
        await wait(1000);
        if (!animRef.current) break;

        setCurrentUrl('instagram.com/explore/tags/nottinghamfood');
        addLog(`Browsing instagram.com/explore/tags/nottinghamfood`);
        setStatusText('Viewing tag page…');
        await wait(800);
        if (!animRef.current) break;

        addLog('Scrolling down');
        await wait(600);
        if (!animRef.current) break;

        addLog(`Found ${restaurant.handle} — Restaurant, ${restaurant.followers} followers`);
        await wait(900);
        if (!animRef.current) break;

        setCurrentScreen('profile');
        setCurrentUrl(`instagram.com/${restaurant.slug}/`);
        addLog(`Browsing instagram.com/${restaurant.slug}/`);
        setStatusText('Reading profile…');
        await wait(800);
        if (!animRef.current) break;

        addLog('Scrolling down');
        await wait(600);
        if (!animRef.current) break;

        addLog('Vertical: Cafe & Restaurant — GREEN — proceeding');
        await wait(900);
        if (!animRef.current) break;

        setCurrentScreen('dm');
        setCurrentUrl(`instagram.com/direct/t/${restaurant.slug}`);
        addLog('Opening DMs…');
        setStatusText('Typing message…');
        await wait(800);
        if (!animRef.current) break;

        addLog('Typing personalised message…');
        await wait(2500);
        if (!animRef.current) break;

        addLog(`DM sent to ${restaurant.handle}`);
        setStatusText('Message sent ✓');
        const newCount = idx + 1;
        setDmCount(newCount);
        setProgress((newCount / 5) * 100);
        await wait(1500);
        if (!animRef.current) break;

        addLog('Thinking…');
        await wait(2000);
        count++;
      }
    };

    runDemo();
    return () => { animRef.current = false; };
  }, []);

  return (
    <div className="marketing-page">
      {/* Nav */}
      <nav className="mp-nav">
        <div className="mp-nav-inner">
          <div className="mp-brand">
            <span className="mp-logo-mark">G</span>
            <span className="mp-brand-text">GhostPost</span>
          </div>
          <div className="mp-nav-right">
            <div className="mp-nav-links">
              <a href="#how">How it works</a>
              <a href="#features">Features</a>
              <a href="#compare">Compare</a>
            </div>
            <button className="mp-nav-login" onClick={() => navigate('/login')}>Login</button>
            <button className="mp-nav-cta" onClick={() => navigate('/signup')}>Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mp-hero">
        <div className="mp-hero-content">
          <div className="mp-hero-badge">
            <span className="mp-pulse-dot" />
            <span>Now with Instagram & LinkedIn</span>
          </div>
          <h1>It doesn't post for you.<br />It posts <em>as you.</em></h1>
          <p>GhostPost learns your voice from a two-minute recording, then runs social media outreach that's indistinguishable from you doing it yourself.</p>
          <div className="mp-hero-actions">
            <button className="mp-btn mp-btn-primary" onClick={() => navigate('/signup')}>Get started free</button>
            <a className="mp-btn mp-btn-secondary" href="#demo">Watch it work</a>
          </div>
        </div>
      </section>

      {/* Demo */}
      <section className="mp-demo-wrap" id="demo">
        <div className="mp-demo-shell">
          <div className="mp-demo-chrome">
            <div className="mp-dots"><span /><span /><span /></div>
            <div className="mp-chrome-title">GhostPost's Computer</div>
          </div>
          <div className="mp-demo-body">
            {/* Action log */}
            <aside className="mp-action-log">
              <div className="mp-log-head">Outreach: Dojo Cards — Nottingham Restaurants</div>
              <div className="mp-log-list">
                {logEntries.map((entry, i) => (
                  <div key={i} className={`mp-log-entry ${entry.startsWith('DM sent') ? 'mp-log-success' : entry === 'Thinking…' ? 'mp-log-thinking' : ''}`}>
                    {entry}
                  </div>
                ))}
              </div>
              <div className="mp-log-input">
                <span>📎</span>
                <span>Message GhostPost</span>
              </div>
            </aside>

            {/* Browser pane */}
            <div className="mp-browser-pane">
              <div className="mp-browser-head">
                <div className="mp-browser-id">
                  <span className="mp-logo-mark">G</span>
                  <div>
                    <div className="mp-id-title">GhostPost's Computer</div>
                    <div className="mp-id-sub">GhostPost is using Browser</div>
                  </div>
                </div>
                <button className="mp-take-control">Take Control</button>
              </div>
              <div className="mp-browser-status">{statusText}</div>
              <div className="mp-url-row">
                <button>←</button><button>→</button><button>↻</button>
                <div className="mp-url-field">{currentUrl}</div>
              </div>

              {/* Explore screen */}
              {currentScreen === 'explore' && (
                <div className="mp-ig-screen">
                  <div className="mp-ig-topbar">
                    <span className="mp-ig-wordmark">Instagram</span>
                  </div>
                  <div className="mp-ig-tag-header">
                    <div className="mp-ig-tag-avatar" />
                    <div>
                      <div className="mp-ig-tag-name">#nottinghamfood</div>
                      <div className="mp-ig-tag-count">48.2K posts</div>
                    </div>
                  </div>
                  <div className="mp-ig-grid">
                    {['#e8d5c4','#c8dfc8','#f0c4a0','#d4c4e0','#c4d4e8','#e8c4c4','#dce8c4','#e8d4b0','#c4e0d8'].map((bg, i) => (
                      <div key={i} className="mp-ig-post" style={{ background: bg }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Profile screen */}
              {currentScreen === 'profile' && (
                <div className="mp-ig-screen">
                  <div className="mp-ig-topbar">
                    <span>←</span>
                    <span>{RESTAURANTS[dmCount % 5]?.slug || 'nottingham_bites'}</span>
                  </div>
                  <div className="mp-ig-profile-header">
                    <div className="mp-ig-profile-pic" />
                    <div className="mp-ig-profile-stats">
                      <div><strong>{RESTAURANTS[dmCount % 5]?.posts || '84'}</strong><span>posts</span></div>
                      <div><strong>{RESTAURANTS[dmCount % 5]?.followers || '2.4K'}</strong><span>followers</span></div>
                      <div><strong>310</strong><span>following</span></div>
                    </div>
                  </div>
                  <div className="mp-ig-profile-bio">
                    <strong>{RESTAURANTS[dmCount % 5]?.name || 'Nottingham Bites'}</strong>
                    <p>Independent restaurant · Hockley, Nottingham</p>
                  </div>
                  <div className="mp-ig-grid mp-ig-grid-small">
                    {['#e8c49c','#c8dab8','#f0b890','#d4c8e4','#c4d8ec','#ecc8c8'].map((bg, i) => (
                      <div key={i} className="mp-ig-post" style={{ background: bg }} />
                    ))}
                  </div>
                </div>
              )}

              {/* DM screen */}
              {currentScreen === 'dm' && (
                <div className="mp-ig-screen mp-ig-dm">
                  <div className="mp-ig-topbar">
                    <span>←</span>
                    <span>{RESTAURANTS[dmCount % 5]?.slug || 'nottingham_bites'}</span>
                    <span className="mp-ig-active">Active now</span>
                  </div>
                  <div className="mp-ig-chat">
                    <div className="mp-ig-timestamp">Today 11:42 AM</div>
                    <div className="mp-bubble">
                      Hey! Love what you're doing at {RESTAURANTS[dmCount % 5]?.name || 'Nottingham Bites'}.
                      Quick question — are you happy with what you're paying in card processing fees?
                      We've been helping independent places in Nottingham save 30–40%. Happy to chat if you're interested!
                    </div>
                    <div className="mp-bubble-meta">Sent · Delivered</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mp-demo-footer">
            <div className="mp-demo-footer-left">
              <span className="mp-mini-pulse" />
              <span>GhostPost is working: <strong>DMing restaurants in Nottingham</strong></span>
            </div>
            <div className="mp-demo-footer-right">
              <span className="mp-count">{dmCount} / 5</span>
              <span className="mp-live-badge">live</span>
            </div>
          </div>
          <div className="mp-progress-bar">
            <div className="mp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mp-section mp-section-soft" id="how">
        <div className="mp-container">
          <div className="mp-label">HOW IT WORKS</div>
          <h2>Teach it your voice. Set your targets. Walk away.</h2>
          <p className="mp-subtitle">From a short recording to fully autonomous outreach, GhostPost mirrors how you actually speak and act.</p>
          <div className="mp-card-grid mp-four">
            {HOW_STEPS.map((step) => (
              <article key={step.title} className="mp-card">
                <div className="mp-card-icon"><FeatureIcon name={step.icon} /></div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mp-section" id="features">
        <div className="mp-container">
          <div className="mp-label">CAPABILITIES</div>
          <h2>Not a scheduler. Not a bot. A digital twin.</h2>
          <p className="mp-subtitle">Designed to behave like you do, with observability and control built in.</p>
          <div className="mp-card-grid mp-six">
            {FEATURES.map((feat) => (
              <article key={feat.title} className="mp-card">
                <div className="mp-card-icon"><FeatureIcon name={feat.icon} /></div>
                <h3>{feat.title}</h3>
                <p>{feat.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Compare */}
      <section className="mp-section mp-section-soft" id="compare">
        <div className="mp-container mp-narrow">
          <div className="mp-label">WHY GHOSTPOST</div>
          <h2>The gap between you and a bot is everything</h2>
          <table className="mp-compare-table">
            <thead>
              <tr><th></th><th>GhostPost</th><th>DM tools</th><th>Manual</th></tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td className={row.gp ? 'mp-chk' : 'mp-dash'}>{row.gp ? '✓' : '–'}</td>
                  <td className={row.dm ? 'mp-chk' : 'mp-dash'}>{row.dm ? '✓' : '–'}</td>
                  <td className={row.manual ? 'mp-chk' : 'mp-dash'}>{row.manual ? '✓' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="mp-final-cta">
        <div className="mp-cta-glow" />
        <div className="mp-container mp-cta-content">
          <h2>Your voice. Their inbox. <span>Zero effort.</span></h2>
          <p>GhostPost is in private beta. Create your account and start running outreach in under two minutes.</p>
          <button className="mp-btn mp-cta-btn" onClick={() => navigate('/signup')}>Get started free →</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mp-footer">
        <div className="mp-container mp-foot">
          <div className="mp-brand">
            <span className="mp-logo-mark">G</span>
            <span className="mp-brand-text">GhostPost</span>
          </div>
          <div className="mp-foot-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
