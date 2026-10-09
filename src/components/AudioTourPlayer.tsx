import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Mic, Sparkles } from 'lucide-react';

export const AudioTourPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'voice' | 'music'>('voice');
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = {
    voice: {
      title: 'Thuyết Minh Giới Thiệu Đắk Song',
      url: 'https://daksong-daknong.vnasw.vn/media/trung-tam-huyen-dak-song-VI.mp3',
      icon: Mic,
    },
    music: {
      title: 'Âm Sắc Đại Ngàn Đắk Song',
      url: 'https://daksong-daknong.vnasw.vn/media/daksong k o loi.mp3',
      icon: Music,
    },
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = tracks[activeTrack].url;
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [activeTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio playback failed or blocked:', e);
        setIsPlaying(false);
      });
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={tracks[activeTrack].url}
        loop={activeTrack === 'music'}
        onEnded={() => {
          if (activeTrack === 'voice') {
            setActiveTrack('music');
          } else {
            setIsPlaying(false);
          }
        }}
      />

      {/* Floating Audio Controller */}
      <div className="fixed bottom-20 right-3 z-30 flex flex-col items-end">
        {/* Expanded Panel */}
        {isExpanded && (
          <div className="mb-2 bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl border border-white/15 shadow-2xl w-64 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Audio Guide VR360
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/60 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-bold text-white mt-2 truncate">
              {tracks[activeTrack].title}
            </p>

            <div className="flex items-center space-x-1.5 mt-2">
              <button
                onClick={() => setActiveTrack('voice')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  activeTrack === 'voice'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>Thuyết minh</span>
              </button>

              <button
                onClick={() => setActiveTrack('music')}
                className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center space-x-1 transition-all ${
                  activeTrack === 'music'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>Nhạc nền</span>
              </button>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-xs">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20"
                title={isMuted ? 'Bật âm' : 'Tắt tiếng'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={togglePlay}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold flex items-center space-x-1"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isPlaying ? 'Tạm dừng' : 'Phát thuyết minh'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Bubble Pill */}
        <div className="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md text-white p-1.5 rounded-full border border-emerald-500/40 shadow-xl active:scale-95 transition-all">
          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-emerald-500 text-slate-950 animate-pulse'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
            title={isPlaying ? 'Dừng phát' : 'Nghe thuyết minh Đắk Song'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-[11px] font-bold text-emerald-300 flex items-center space-x-1 hover:text-white"
          >
            <span>Audio Guide</span>
            {isPlaying && (
              <span className="flex space-x-0.5 items-end h-3">
                <span className="w-0.5 h-2 bg-emerald-400 animate-bounce" />
                <span className="w-0.5 h-3 bg-emerald-300 animate-bounce delay-100" />
                <span className="w-0.5 h-1.5 bg-emerald-400 animate-bounce delay-200" />
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

