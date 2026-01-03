import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { logger } from '@/utils/logger';

const MOTIVATIONAL_WORDS = [
  'FOCO',
  'SUPERAÇÃO',
  'DETERMINAÇÃO',
  'DISCIPLINA',
  'PERSISTÊNCIA',
  'EXCELÊNCIA',
  'DEDICAÇÃO',
  'RESILIÊNCIA',
];

const LOFI_PLAYLISTS = [
  {
    id: 'lofi-study',
    name: 'Lofi Study Beats',
    url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=1&loop=1&playlist=jfKfPfyJRdk',
  },
  {
    id: 'chill-beats',
    name: 'Chill Beats',
    url: 'https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=0&controls=1&loop=1&playlist=5qap5aO4i9A',
  },
  {
    id: 'focus-music',
    name: 'Deep Focus',
    url: 'https://www.youtube.com/embed/7NOSDKb0HlU?autoplay=1&mute=0&controls=1&loop=1&playlist=7NOSDKb0HlU',
  },
];

export default function FocusZone() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Log entrada no Focus Zone
  useEffect(() => {
    logger.info('Focus Zone ativado', {
      component: 'FocusZone',
      action: 'enter_focus_mode',
      playlist: LOFI_PLAYLISTS[selectedPlaylist].name,
      startTimestamp: new Date().toISOString(),
    });

    return () => {
      const sessionDuration = Date.now() - sessionStartTime;
      logger.info('Focus Zone encerrado', {
        component: 'FocusZone',
        action: 'exit_focus_mode',
        sessionDuration,
        timeInMinutes: (sessionDuration / 1000 / 60).toFixed(2),
        playlist: LOFI_PLAYLISTS[selectedPlaylist].name,
        endTimestamp: new Date().toISOString(),
      });
    };
  }, []);

  // Rotação de palavras motivacionais
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % MOTIVATIONAL_WORDS.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Ocultar controles após inatividade
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  // Tecla ESC para sair
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleExit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExit = () => {
    const sessionDuration = Date.now() - sessionStartTime;
    logger.info('Usuário saiu do Focus Zone', {
      component: 'FocusZone',
      action: 'manual_exit',
      sessionDuration,
      timeInMinutes: (sessionDuration / 1000 / 60).toFixed(2),
    });
    navigate('/');
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        logger.info('Fullscreen ativado', {
          component: 'FocusZone',
          action: 'enable_fullscreen',
        });
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        logger.info('Fullscreen desativado', {
          component: 'FocusZone',
          action: 'disable_fullscreen',
        });
      }
    } catch (error) {
      logger.warn('Erro ao alternar fullscreen', {
        component: 'FocusZone',
        action: 'fullscreen_error',
        error: String(error),
      });
    }
  };

  const changePlaylist = (index: number) => {
    setSelectedPlaylist(index);
    logger.info('Playlist alterada', {
      component: 'FocusZone',
      action: 'change_playlist',
      newPlaylist: LOFI_PLAYLISTS[index].name,
      playlistId: LOFI_PLAYLISTS[index].id,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Controlar iframe via postMessage (limitação do YouTube)
    if (iframeRef.current) {
      const command = isMuted ? 'unMute' : 'mute';
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command }),
        '*'
      );
    }
    logger.info(isMuted ? 'Som ativado' : 'Som desativado', {
      component: 'FocusZone',
      action: isMuted ? 'unmute' : 'mute',
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      
      {/* Palavra Motivacional Central */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <h1
          key={currentWord}
          className="text-6xl md:text-8xl lg:text-9xl font-black text-white/20 tracking-widest animate-fade-in select-none"
          style={{
            textShadow: '0 0 40px rgba(255,255,255,0.3)',
            animation: 'fadeInOut 3s ease-in-out',
          }}
        >
          {MOTIVATIONAL_WORDS[currentWord]}
        </h1>
      </div>

      {/* Player de Música (Invisível mas presente) */}
      <div className="absolute bottom-0 left-0 right-0 opacity-0 pointer-events-none">
        <iframe
          ref={iframeRef}
          width="100%"
          height="0"
          src={LOFI_PLAYLISTS[selectedPlaylist].url}
          title="Focus Music"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Controles (aparecem ao mover o mouse) */}
      <div
        className={`absolute top-0 left-0 right-0 z-20 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="bg-black/50 backdrop-blur-md p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-white font-bold text-lg">Focus Zone</h2>
              <div className="hidden md:flex items-center gap-2">
                {LOFI_PLAYLISTS.map((playlist, index) => (
                  <Button
                    key={playlist.id}
                    size="sm"
                    variant={selectedPlaylist === index ? 'default' : 'ghost'}
                    onClick={() => changePlaylist(index)}
                    className="text-white"
                  >
                    {playlist.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleExit}
                className="text-white hover:bg-red-500/50"
              >
                <X className="w-5 h-5" />
                <span className="ml-2 hidden sm:inline">Sair (ESC)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções (aparecem brevemente no início) */}
      <div
        className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 transition-opacity duration-1000 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white/70 text-sm text-center">
          Mova o mouse para ver os controles • Pressione ESC para sair
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}
