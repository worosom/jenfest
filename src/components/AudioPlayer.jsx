import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  return (
    <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
      {/* Play/Pause Button - Visible on mobile only */}
      <button
        onClick={togglePlay}
        className="block md:hidden p-2 text-[var(--color-sand)] hover:text-[var(--color-sand-light)] hover:bg-[var(--color-leather)] rounded-lg transition-colors flex-shrink-0"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Audio element with controls - visible on desktop only */}
      <audio
        ref={audioRef}
        controls
        className="w-full h-8 hidden md:block"
        style={{
          filter: 'sepia(1) saturate(2) hue-rotate(15deg)',
        }}
      >
        <source src={src} type="audio/mp4" />
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;