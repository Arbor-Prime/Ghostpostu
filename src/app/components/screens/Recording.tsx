import { useState, useEffect, useRef } from 'react';
import { Mic, Pause, Square, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';

const prompts = ['Tell me about yourself...', 'What do you do for work?', 'What are you passionate about?', 'How do you talk to friends?', 'What topics get you excited?', 'Describe your communication style...'];

export function Recording() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const levelRef = useRef<number>(0);
  const levelAnimRef = useRef<number>(0);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (isRecording && !isPaused) { intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000); }
    else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording, isPaused]);

  useEffect(() => { const t = setInterval(() => setPromptIndex((i) => (i + 1) % prompts.length), 4000); return () => clearInterval(t); }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1,
        }
      });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(1000);
      setIsRecording(true);

      // Audio level analyser for visual feedback
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        const normalized = Math.min(1, avg / 80);
        levelRef.current = normalized;
        setAudioLevel(normalized);
        levelAnimRef.current = requestAnimationFrame(updateLevel);
      };
      levelAnimRef.current = requestAnimationFrame(updateLevel);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Could not access microphone: ' + err.message);
      }
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) { mediaRecorderRef.current.resume(); }
    else { mediaRecorderRef.current.pause(); }
    setIsPaused(!isPaused);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsRecording(false);
    setIsPaused(false);
  };

  const handleDone = async () => {
    // Kill timer IMMEDIATELY — don't wait for React state batching
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (levelAnimRef.current) { cancelAnimationFrame(levelAnimRef.current); levelAnimRef.current = 0; }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    analyserRef.current = null;
    setAudioLevel(0);
    setIsRecording(false);
    setIsPaused(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    await new Promise(r => setTimeout(r, 300));

    if (chunksRef.current.length === 0) {
      navigate('/onboarding/processing');
      return;
    }

    setUploading(true);
    if (!user?.id) {
      setError('Not logged in. Please refresh and try again.');
      setUploading(false);
      return;
    }
    const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
    console.log(`[Recording] Blob: ${(blob.size / 1024).toFixed(0)}KB, ${chunksRef.current.length} chunks, type: ${blob.type}`);
    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');
    formData.append('userId', String(user?.id));

    try {
      await api.upload(`/voice/upload?userId=${user?.id}`, formData);
      console.log('[Recording] Upload complete, navigating...');
      navigate('/onboarding/processing');
    } catch (err) {
      console.error('Voice upload failed:', err);
      setError('Upload failed: ' + (err as Error).message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#2b2b2b' }}>
      <div className="w-full max-w-[460px] flex flex-col items-center" style={{ background: '#333333', borderRadius: 24, padding: '44px 40px', border: '1px solid #444444' }}>
        <div className="flex items-center gap-2.5 mb-12">
          <GhostPostLogo size={22} />
          <span style={{ fontWeight: 700, fontSize: 15, color: '#e5e5e5' }}>GhostPost</span>
        </div>

        <p className="mb-8 transition-opacity duration-500" style={{ fontSize: 15, color: '#aaaaaa', fontWeight: 500 }}>{prompts[promptIndex]}</p>

        {error && (
          <div className="flex items-center gap-2 mb-6 w-full" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertCircle size={14} strokeWidth={1.5} className="text-[#ef4444] shrink-0" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#f87171' }}>{error}</span>
          </div>
        )}

        <div className="relative mb-6">
          {isRecording && !isPaused && <div className="absolute inset-[-8px] rounded-full animate-ping opacity-20" style={{ border: '2px solid #d4a853' }} />}
          {isRecording && <div className="absolute rounded-full" style={{ inset: -4 - audioLevel * 20, border: `2px solid rgba(212,168,83,${0.1 + audioLevel * 0.5})`, borderRadius: '50%', transition: 'all 0.1s ease' }} />}
          <div className="flex items-center justify-center" style={{ width: 110, height: 110, borderRadius: '50%', border: isRecording ? '2px solid #d4a853' : '2px solid #505050', background: isRecording ? `rgba(212,168,83,${0.04 + audioLevel * 0.08})` : '#3a3a3a' }}>
            <Mic size={34} strokeWidth={1.5} className={isRecording ? 'text-[#d4a853]' : 'text-[#999999]'} />
          </div>
        </div>

        <div className="mb-6" style={{ fontSize: 32, fontWeight: 700, color: '#e5e5e5', letterSpacing: '-0.02em' }}>{formatTime(seconds)}</div>

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <GhostButton variant="gold" size="lg" onClick={startRecording} icon={<Mic size={18} strokeWidth={2} />}>
              Record
            </GhostButton>
          ) : (
            <>
              <GhostButton variant="glass" size="md" onClick={pauseRecording} icon={<Pause size={15} strokeWidth={1.5} />}>
                {isPaused ? 'Resume' : 'Pause'}
              </GhostButton>
              <GhostButton variant="danger" size="md" onClick={stopRecording} icon={<Square size={14} strokeWidth={2} />}>
                Stop
              </GhostButton>
            </>
          )}
          {seconds >= 10 && (
            <GhostButton variant="success" size="md" onClick={handleDone} disabled={uploading} icon={<Check size={14} strokeWidth={2.5} />}>
              {uploading ? 'Uploading...' : 'Done'}
            </GhostButton>
          )}
        </div>
      </div>
    </div>
  );
}
