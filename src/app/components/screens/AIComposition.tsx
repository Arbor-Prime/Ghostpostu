import { useState, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

export function AIComposition() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    api.get('/stats/topic-breakdown')
      .then(data => setTopics(data.topics || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setDraft('');
    try {
      const result = await api.post('/drafts/generate', { prompt: prompt.trim() });
      setDraft(result.draft?.replyText || result.replyText || result.text || 'Draft generated — check Approvals.');
    } catch (err: any) {
      setDraft('Generation failed: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', marginBottom: 16, border: '1px solid #4a4a4a' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 14 }}>Topic Breakdown</h3>
        {loading ? (
          <Loader2 size={18} className="text-[#d4a853] animate-spin" />
        ) : topics.length === 0 ? (
          <p style={{ fontSize: 12, color: '#999' }}>No topic data yet. Generate some drafts first.</p>
        ) : (
          <div className="space-y-2.5">
            {topics.map((t: any) => (
              <div key={t.topic}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: 12, color: '#ccc' }}>{t.topic}</span>
                  <span style={{ fontSize: 11, color: '#999' }}>{t.percentage}%</span>
                </div>
                <div style={{ height: 5, background: '#555', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${t.percentage}%`, background: '#d4a853', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ background: '#383838', borderRadius: 16, padding: '22px 24px', border: '1px solid #4a4a4a' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e5e5e5', marginBottom: 14 }}>Generate Draft</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the tweet you want to reply to, or paste a tweet URL..."
          rows={3}
          className="w-full placeholder:text-[#777] text-[#e5e5e5] focus:outline-none mb-3"
          style={{ background: '#3a3a3a', border: '1px solid #4a4a4a', borderRadius: 10, padding: '10px 14px', fontSize: 12, resize: 'vertical' }}
        />
        <GhostButton variant="gold" size="md" onClick={handleGenerate} disabled={generating} icon={generating ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} strokeWidth={2} />}>
          {generating ? 'Generating...' : 'Generate'}
        </GhostButton>
        {draft && (
          <div className="mt-4" style={{ background: '#3a3a3a', borderRadius: 10, padding: '14px 16px', border: '1px solid #4a4a4a' }}>
            <p style={{ fontSize: 13, color: '#e5e5e5', lineHeight: 1.6 }}>{draft}</p>
          </div>
        )}
      </div>
    </div>
  );
}
