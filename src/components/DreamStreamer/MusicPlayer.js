import React, { useState, useRef, useEffect } from 'react';
import { MdSkipNext, MdSkipPrevious, MdPlayCircleFilled, MdPauseCircleFilled, MdVolumeUp } from 'react-icons/md';
import { Slider } from '@mui/material';

const MusicPlayer = ({ track }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = track.trackUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [track]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (event, newValue) => {
    if (audioRef.current) {
      audioRef.current.currentTime = (newValue / 100) * audioRef.current.duration;
      setTrackProgress(newValue);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 bg-black bg-opacity-60 p-4 rounded-lg shadow-lg flex justify-between items-center space-x-4">
      <div className="flex items-center space-x-4">
        {/* Album Art */}
        <img src={track.albumArtUrl || 'https://via.placeholder.com/50'} alt="Track Thumbnail" className="w-16 h-16 rounded-full" />
        <div>
          <p className="font-bold">{track.trackName}</p>
          <p className="text-sm text-gray-400">{track.trackLabel}</p>
        </div>
      </div>

      {/* Music Controls */}
      <div className="flex items-center space-x-4">
        <MdSkipPrevious className="text-4xl cursor-pointer" />
        {isPlaying ? (
          <MdPauseCircleFilled className="text-5xl cursor-pointer" onClick={handlePlayPause} />
        ) : (
          <MdPlayCircleFilled className="text-5xl cursor-pointer" onClick={handlePlayPause} />
        )}
        <MdSkipNext className="text-4xl cursor-pointer" />
      </div>

      {/* Slider for Track Progress */}
      <div className="flex-grow mx-4">
        <Slider value={trackProgress} onChange={handleProgressChange} aria-label="Song progress" sx={{ color: 'white' }} />
      </div>

      {/* Volume Controller */}
      <div className="flex items-center space-x-4">
        <MdVolumeUp className="text-xl" />
        <Slider value={volume} onChange={handleVolumeChange} aria-label="Volume" sx={{ color: 'white', width: '100px' }} />
      </div>
    </div>
  );
};

export default MusicPlayer;
