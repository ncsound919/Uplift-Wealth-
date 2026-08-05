import React, { useMemo, useState, useEffect } from 'react';
import { PlayCircle, ExternalLink, RefreshCw, AlertCircle, Tv, Volume2, VolumeX, Pause, Play, RotateCcw, CheckCircle2 } from 'lucide-react';

interface YouTubeVideoPlayerProps {
  videoId: string;
  title?: string;
  description?: string;
  className?: string;
}

export function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId) return null;
  const input = urlOrId.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;

  try {
    const url = new URL(input);

    if (url.hostname === 'youtu.be') {
      const id = url.pathname.slice(1);
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      url.hostname.includes('youtube.com') ||
      url.hostname.includes('youtube-nocookie.com')
    ) {
      const v = url.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const parts = url.pathname.split('/');
      const embedIndex = parts.findIndex((p) => p === 'embed' || p === 'v' || p === 'shorts');
      if (embedIndex >= 0) {
        const id = parts[embedIndex + 1];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    const match = input.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    return match?.[1] ?? null;
  }

  return null;
}

export function YouTubeVideoPlayer({
  videoId,
  title = 'Fintech Educational Masterclass',
  description,
  className = ''
}: YouTubeVideoPlayerProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [playerMode, setPlayerMode] = useState<'youtube' | 'simulation' | 'direct'>('youtube');
  
  // Interactive Simulation Stream states
  const [isPlayingSim, setIsPlayingSim] = useState(true);
  const [simProgress, setSimProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const cleanId = extractYouTubeId(videoId);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (playerMode === 'simulation' && isPlayingSim) {
      timer = setInterval(() => {
        setSimProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      }, 300);
    }
    return () => clearInterval(timer);
  }, [playerMode, isPlayingSim]);

  const embedUrl = useMemo(() => {
    if (!cleanId) return null;

    const params = new URLSearchParams({
      autoplay: '0',
      rel: '0',
      playsinline: '1',
      enablejsapi: '0'
    });

    return `https://www.youtube-nocookie.com/embed/${cleanId}?${params.toString()}`;
  }, [cleanId]);

  const directWatchUrl = cleanId
    ? `https://www.youtube.com/watch?v=${cleanId}`
    : null;

  const handleRefresh = () => setReloadKey((prev) => prev + 1);

  if (!cleanId) {
    return (
      <div className={`bg-slate-950 rounded-2xl border border-slate-800 p-5 text-slate-100 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Invalid Video Resource</h4>
            <p className="text-xs text-slate-400 mt-1">
              Please specify a valid YouTube Video ID or URL.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-100 ${className}`}>
      {/* Header bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0">
            <PlayCircle className="w-4 h-4 fill-current" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/50">
                Fintech Masterclass
              </span>
            </div>
            <h4 className="text-xs md:text-sm font-bold text-white truncate mt-0.5">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Reload video player"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Reload Video Player"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Reload</span>
          </button>

          <a
            href={directWatchUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main View Screen */}
      {playerMode === 'youtube' && (
        <div className="aspect-video bg-black relative overflow-hidden group">
          <iframe
            key={reloadKey}
            className="w-full h-full border-0"
            src={embedUrl!}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      )}

      {/* Control bar / Player mode switcher */}
      <div className="bg-slate-900 border-t border-slate-800 p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPlayerMode('youtube')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              playerMode === 'youtube'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>YouTube Embed</span>
          </button>

          <button
            type="button"
            onClick={() => setPlayerMode('simulation')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
              playerMode === 'simulation'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Interactive Lecture</span>
          </button>
        </div>

        <a
          href={directWatchUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 underline transition-colors"
        >
          <span>If video is blocked in iframe, click here to watch directly on YouTube</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {playerMode === 'simulation' && (
        <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden flex flex-col justify-between p-6">
          {/* Animated Background Graphic */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Top Status Banner */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-mono text-emerald-300 font-bold uppercase tracking-wider">
                Simulated Masterclass Lecture
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              ID: {cleanId}
            </span>
          </div>

          {/* Center Content Simulation Card */}
          <div className="my-auto z-10 max-w-xl mx-auto text-center space-y-3 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-xs shadow-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Visual Educational Sandbox Lecture</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {description || 'Comprehensive financial technology architecture masterclass covering ledger design, compliance API patterns, and underwriting logic.'}
            </p>
          </div>

          {/* Bottom Interactive Controls Scrubber */}
          <div className="z-10 space-y-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = ((e.clientX - rect.left) / rect.width) * 100;
              setSimProgress(Math.min(100, Math.max(0, pct)));
            }}>
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300" 
                style={{ width: `${simProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPlayingSim(!isPlayingSim)} 
                  className="text-slate-200 hover:text-white cursor-pointer"
                >
                  {isPlayingSim ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button 
                  type="button" 
                  onClick={() => setSimProgress(0)} 
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
              <span className="font-mono text-xs text-slate-400">
                {Math.floor((simProgress / 100) * 12)}:{(Math.floor((simProgress % 10) * 6)).toString().padStart(2, '0')} / 12:00
              </span>
            </div>
          </div>
        </div>
      )}

      {playerMode === 'direct' && (
        <div className="aspect-video bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center animate-pulse">
            <Tv className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400">
              YouTube embed policies may restrict playback in cross-origin sandboxed preview frames.
            </p>
          </div>
          <a
            href={directWatchUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <span>Launch Masterclass on YouTube</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Mode Toggle Controls */}
      <div className="bg-slate-900/60 p-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          {description && (
            <p className="text-slate-300 font-medium leading-relaxed">{description}</p>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>If YouTube restricts embedded playback in sandboxed frames, switch to Simulated Masterclass mode or open directly on YouTube.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setPlayerMode('youtube')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              playerMode === 'youtube'
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            YouTube Embed
          </button>
          <button
            type="button"
            onClick={() => setPlayerMode('simulation')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              playerMode === 'simulation'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Lecture
          </button>
          <button
            type="button"
            onClick={() => setPlayerMode('direct')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
              playerMode === 'direct'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct Link
          </button>
        </div>
      </div>
    </div>
  );
}

