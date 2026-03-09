import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Mic, Check, Pause, Square, AlertTriangle, Upload } from 'lucide-react';
import { GhostPostLogo } from '../layout/GhostPostLogo';
import { GhostButton } from '../ui/GhostButton';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';

const prompts = [
  'Tell me about yourself...',
  'What do you do for work?',
  'How do you talk to friends?',
  'What gets you excited?',
  'Describe your communication style...',
  'What topics fire you up?',
];

export function Recording() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [peakLevel, setPeakLevel] = useState(0);
  const [lowAudioWarning, setLowAudioWarning] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(40).fill(0));

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const levelAnimRef = useRef<number>(0);
  const peakTracker = useRef(0);
  const lowAudioTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Accept common audio formats
    const validTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/x-m4a', 'audio/aac'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExts = ['webm', 'mp4', 'm4a', 'mp3', 'wav', 'ogg', 'aac', 'opus'];

    if (!validTypes.includes(file.type) && !validExts.includes(ext || '')) {
      setError('Unsupported format. Use MP3, M4A, WAV, WebM, or MP4 audio.');
      return;
    }

    if (file.size < 50000) {
      setError('File too small — needs to be at least a 30-second recording.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File too large — maximum 25MB.');
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('audio', file, file.name);

    try {
      await api.upload('/voice/upload', formData);
      navigate('/onboarding/processing');
    } catch (err) {
      console.error('File upload failed:', err);
      setError('Upload failed: ' + (err as Error).message);
      setUploading(false);
    }

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording, isPaused]);

  // Prompt rotation
  useEffect(() => {
    const t = setInterval(() => setPromptIndex(i => (i + 1) % prompts.length), 4000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = async () => {
    setError('');
    setLowAudioWarning(false);
    setPeakLevel(0);
    peakTracker.current = 0;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
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

      // Audio analyser with waveform
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.fftSize);
      const waveArray = new Uint8Array(analyser.fftSize);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        // Time-domain RMS for accurate voice level
        analyserRef.current.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const normalized = Math.min(1, rms * 5);
        setAudioLevel(normalized);

        // Track peak
        if (normalized > peakTracker.current) {
          peakTracker.current = normalized;
          setPeakLevel(normalized);
        }

        // Time domain data for waveform bars
        analyserRef.current.getByteTimeDomainData(waveArray);
        const bars: number[] = [];
        const step = Math.floor(waveArray.length / 40);
        for (let i = 0; i < 40; i++) {
          const val = Math.abs(waveArray[i * step] - 128) / 128;
          bars.push(val);
        }
        setWaveformData(bars);

        levelAnimRef.current = requestAnimationFrame(updateLevel);
      };
      levelAnimRef.current = requestAnimationFrame(updateLevel);

      // Low audio warning after 10 seconds
      lowAudioTimer.current = setTimeout(() => {
        if (peakTracker.current < 0.02) {
          setLowAudioWarning(true);
        }
      }, 10000);

    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
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

  const handleDone = async () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (levelAnimRef.current) { cancelAnimationFrame(levelAnimRef.current); levelAnimRef.current = 0; }
    if (lowAudioTimer.current) { clearTimeout(lowAudioTimer.current); }
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
    analyserRef.current = null;
    setAudioLevel(0);
    setIsRecording(false);
    setIsPaused(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    await new Promise(r => setTimeout(r, 500));

    if (chunksRef.current.length === 0) {
      setError('No audio recorded. Please try again.');
      return;
    }

    setUploading(true);
    if (!user?.id) {
      setError('Not logged in. Please refresh and try again.');
      setUploading(false);
      return;
    }

    const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
    console.log(`[Recording] Blob: ${(blob.size / 1024).toFixed(0)}KB, ${chunksRef.current.length} chunks, peak level: ${peakTracker.current.toFixed(2)}`);

    if (blob.size < 50000) {
      setError('Recording too short or too quiet. Please speak closer to your microphone.');
      setUploading(false);
      return;
    }

    const formData = new FormData();
    formData.append('audio', blob, 'recording.webm');

    try {
      await api.upload('/voice/upload', formData);
      navigate('/onboarding/processing');
    } catch (err) {
      console.error('Voice upload failed:', err);
      setError('Upload failed: ' + (err as Error).message);
      setUploading(false);
    }
  };

  // Mic quality indicator
  const getMicStatus = () => {
    if (!isRecording) return { text: 'Press Record to begin', color: '#666' };
    if (audioLevel > 0.15) return { text: 'Great — I can hear you clearly', color: '#22c55e' };
    if (audioLevel > 0.05) return { text: 'Good — keep talking', color: '#d4a853' };
    if (audioLevel > 0.01) return { text: 'Quiet — try speaking louder or move closer', color: '#f59e0b' };
    return { text: 'Very quiet — check your microphone', color: '#ef4444' };
  };

  const micStatus = getMicStatus();

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#1a1a1a' }}>
      <div className="w-full max-w-[500px] flex flex-col items-center">

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-8">
          <GhostPostLogo size={20} />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#e5e5e5' }}>GhostPost</span>
        </div>

        {/* Rotating prompt */}
        <p className="mb-6 text-center transition-opacity duration-500" style={{ fontSize: 16, color: '#999', fontWeight: 500, minHeight: 24 }}>
          {prompts[promptIndex]}
        </p>

        {error && (
          <div className="flex items-center gap-2 mb-4 w-full" style={{ background: 'rgba(239,68,68,0.08)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={14} className="text-[#ef4444] shrink-0" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#f87171' }}>{error}</span>
          </div>
        )}

        {lowAudioWarning && isRecording && (
          <div className="flex items-center gap-2 mb-4 w-full" style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 12, padding: '10px 14px', border: '1px solid rgba(245,158,11,0.15)' }}>
            <AlertTriangle size={14} className="text-[#f59e0b] shrink-0" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#fbbf24' }}>Can't hear much. Try speaking louder or moving closer to your mic.</span>
          </div>
        )}

        {/* Waveform visualiser */}
        <div className="w-full flex items-center justify-center gap-px mb-6" style={{ height: 60 }}>
          {waveformData.map((val, i) => (
            <div
              key={i}
              style={{
                width: 4,
                borderRadius: 2,
                background: isRecording
                  ? val > 0.15 ? '#d4a853' : val > 0.05 ? 'rgba(212,168,83,0.4)' : 'rgba(212,168,83,0.15)'
                  : '#333',
                height: isRecording ? Math.max(3, val * 56) : 3,
                transition: 'height 0.08s ease, background 0.15s ease',
              }}
            />
          ))}
        </div>

        {/* Mic status indicator */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full" style={{ background: micStatus.color, boxShadow: isRecording && audioLevel > 0.1 ? `0 0 8px ${micStatus.color}` : 'none' }} />
          <span style={{ fontSize: 12, color: micStatus.color, fontWeight: 500, transition: 'color 0.3s ease' }}>{micStatus.text}</span>
        </div>

        {/* Timer */}
        <div className="mb-6" style={{ fontSize: 42, fontWeight: 800, color: '#e5e5e5', letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(seconds)}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <GhostButton variant="gold" size="lg" onClick={startRecording} icon={<Mic size={16} strokeWidth={2} />}>
              Record
            </GhostButton>
          ) : (
            <>
              <GhostButton variant="glass" size="md" onClick={pauseRecording} icon={<Pause size={13} strokeWidth={2} />}>
                {isPaused ? 'Resume' : 'Pause'}
              </GhostButton>
              <GhostButton variant="gold" size="md" onClick={handleDone} disabled={uploading || seconds < 30} icon={<Check size={14} strokeWidth={2.5} />}>
                {uploading ? 'Uploading...' : seconds < 30 ? `${30 - seconds}s more` : 'Done'}
              </GhostButton>
            </>
          )}
        </div>

        {/* Minimum time hint */}
        {isRecording && seconds < 30 && (
          <p className="mt-3" style={{ fontSize: 11, color: '#666' }}>
            Minimum 30 seconds. 2-3 minutes is ideal.
          </p>
        )}
        {isRecording && seconds >= 30 && seconds < 120 && (
          <p className="mt-3" style={{ fontSize: 11, color: '#555' }}>
            Good. Keep going for a richer profile.
          </p>
        )}
        {isRecording && seconds >= 120 && (
          <p className="mt-3" style={{ fontSize: 11, color: '#22c55e' }}>
            Great length. Hit Done whenever you're ready.
          </p>
        )}

        {/* Upload file option */}
        {!isRecording && !uploading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-3" style={{ width: 200 }}>
              <div style={{ flex: 1, height: 1, background: '#444' }} />
              <span style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#444' }} />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.webm,.mp4,.m4a,.mp3,.wav,.ogg,.aac"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <GhostButton variant="glass" size="sm" onClick={() => fileInputRef.current?.click()} icon={<Upload size={13} strokeWidth={1.5} />}>
              Upload a recording
            </GhostButton>
            <p className="mt-2" style={{ fontSize: 10, color: '#555' }}>
              MP3, M4A, WAV, WebM — max 25MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
