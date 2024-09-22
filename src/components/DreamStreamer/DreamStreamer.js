import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaHome, FaMusic, FaSignOutAlt } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { MdSkipNext, MdSkipPrevious, MdPlayCircleFilled, MdPauseCircleFilled, MdShuffle, MdRepeat, MdVolumeUp } from 'react-icons/md';
import { Slider, IconButton, TextField } from '@mui/material';
import axios from 'axios';

const DreamStreamer = ({ signOut }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]);
  const [artists, setArtists] = useState([]);
  const [viewMode, setViewMode] = useState('albums');
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolume] = useState(50);

  const audioRef = useRef(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        setAlbums(albumsResponse.data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    fetchAlbums();
  }, []);

  const fetchGenresAndArtists = async () => {
    try {
      const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
      const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
      setGenres(genresResponse.data);
      setArtists(artistsResponse.data);
    } catch (error) {
      console.error('Error fetching genres or artists:', error);
    }
  };

  useEffect(() => {
    fetchGenresAndArtists();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const trackPlayCount = async (albumId, trackName) => {
    try {
      await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/playcount', {
        albumId,
        trackName,
      });
    } catch (error) {
      console.error('Error tracking play count:', error);
    }
  };

  const handleAlbumClick = (album) => {
    setCurrentAlbum(album);
    setTracks(album.tracks);
    trackPlayCount(album.albumId, null);
  };

  const handleTrackClick = (track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.trackUrl;
      audioRef.current.play();
      setIsPlaying(true);
      trackPlayCount(currentAlbum.albumId, track.trackName);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.trackUrl === currentTrack.trackUrl);
    const nextTrack = tracks[(currentIndex + 1) % tracks.length];
    setCurrentTrack(nextTrack);
    if (audioRef.current) {
      audioRef.current.src = nextTrack.trackUrl;
      audioRef.current.play();
    }
    trackPlayCount(currentAlbum.albumId, nextTrack.trackName);
  };

  const handlePreviousTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.trackUrl === currentTrack.trackUrl);
    const prevTrack = tracks[(currentIndex - 1 + tracks.length) % tracks.length];
    setCurrentTrack(prevTrack);
    if (audioRef.current) {
      audioRef.current.src = prevTrack.trackUrl;
      audioRef.current.play();
    }
    trackPlayCount(currentAlbum.albumId, prevTrack.trackName);
  };

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        setTrackProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    const interval = setInterval(updateProgress, 500);
    return () => clearInterval(interval);
  }, [isPlaying]);

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
    <div className="h-screen flex bg-white text-cyan-600">
      {/* Sidebar */}
<aside className="w-64 bg-cyan-600 text-white h-screen sticky top-0 flex flex-col rounded-r-lg shadow-lg">
  <div className="p-6 flex flex-col items-center">
    {/* Logo */}
    <img
      src="https://github.com/krm-aadil/GIT-IMAGES/blob/main/Black_and_Turquoise_Circle_Music_Logo-removebg-preview.png?raw=true"
      alt="DreamStreamer Logo"
      className="w-24 h-24 rounded-full mb-4 border-4 border-white"
    />
  </div>

  <nav className="flex-grow">
    <div
      className="flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg cursor-pointer"
      onClick={() => setViewMode('albums')}
    >
      <FaHome className="mr-2" />
      <span>Home</span>
    </div>

    <div className="flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg cursor-pointer">
      <FaSearch className="mr-2" />
      <span>Search</span>
    </div>

    <div
      className="flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg cursor-pointer"
      onClick={() => setViewMode('albums')}
    >
      <FaMusic className="mr-2" />
      <span>View All Albums</span>
    </div>

    <div
      className="flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg cursor-pointer"
      onClick={() => setViewMode('genres')}
    >
      <FaMusic className="mr-2" />
      <span>View All Genres</span>
    </div>

    <div
      className="flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg cursor-pointer"
      onClick={() => setViewMode('artists')}
    >
      <FaMusic className="mr-2" />
      <span>View All Artists</span>
    </div>

    <div
      className="flex items-center py-3 px-5 hover:bg-cyan-500 transition-colors rounded-lg cursor-pointer"
      onClick={signOut}
    >
      <FaSignOutAlt className="mr-2" />
      <span>Sign Out</span>
    </div>
  </nav>
</aside>

      {/* Main Content */}
      <div className="flex-grow p-6 bg-white">
        {/* Header with centered search bar */}
        <div className="flex justify-center items-center mb-6">
          <div className="flex items-center space-x-4">
            <IconButton>
              <IoIosArrowBack className="text-cyan-600 text-2xl" />
            </IconButton>
            <TextField
              placeholder="Search"
              variant="outlined"
              size="small"
              sx={{
                input: { color: 'black', bgcolor: 'white', borderRadius: 1 },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'gray.300',
                  },
                  '&:hover fieldset': {
                    borderColor: 'cyan',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'cyan',
                  },
                },
              }}
              InputProps={{
                style: { color: 'black' },
              }}
              value={searchQuery}
              onChange={handleSearch}
              className="w-3/5"
            />
          </div>
        </div>

        {/* View Albums */}
        {viewMode === 'albums' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-cyan-600">Browse All Albums</h2>
            <div className="grid grid-cols-4 gap-8">
              {albums
                .filter((album) => album.albumName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((album) => (
                  <div
                    key={album.albumId}
                    className="relative group overflow-hidden bg-white border border-cyan-600 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <img
                      src={album.albumArtUrl}
                      alt={album.albumName}
                      className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 transition duration-300"
                    />
                    <div className="absolute bottom-4 left-4 text-cyan-600">
                      <p className="font-bold text-lg">{album.albumName}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tracks List */}
        {currentAlbum && (
          <div className="mt-8">
            <div className="flex items-center">
              <img
                src={currentAlbum.albumArtUrl}
                alt={currentAlbum.albumName}
                className="w-48 h-48 object-cover rounded-lg mr-6"
              />
              <div>
                <h2 className="text-4xl font-bold text-cyan-600">{currentAlbum.albumName}</h2>
                <p className="text-lg text-gray-600">Year: {currentAlbum.albumYear}</p>
                <p className="text-lg text-gray-600">Genre: {currentAlbum.genreId}</p>
                <p className="text-lg text-gray-600">Band: {currentAlbum.bandComposition}</p>
                <p className="text-lg text-gray-600">Artists: {currentAlbum.artists.join(', ')}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-bold text-cyan-600 mb-4">Tracks</h3>
              <ul className="space-y-4">
                {tracks.map((track) => (
                  <li
                    key={track.trackUrl}
                    className="flex items-center justify-between bg-gray-100 border border-cyan-600 rounded-lg p-4 hover:bg-gray-200 transition cursor-pointer"
                    onClick={() => handleTrackClick(track)}
                  >
                    <div>
                      <p className="font-bold text-cyan-600">{track.trackName}</p>
                      <p className="text-sm text-gray-400">{track.trackLabel}</p>
                    </div>
                    <IconButton className="text-cyan-600">
                      <MdPlayCircleFilled className="text-3xl" />
                    </IconButton>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Music Controller */}
        {currentTrack && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 bg-cyan-500 bg-opacity-90 p-4 rounded-lg shadow-lg flex justify-between items-center space-x-4">
            <div className="flex items-center space-x-4">
              <img
                src={currentAlbum ? currentAlbum.albumArtUrl : 'https://via.placeholder.com/50'}
                alt="Track Thumbnail"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-bold text-white">{currentTrack.trackName}</p>
                <p className="text-sm text-gray-200">{currentTrack.trackLabel}</p>
              </div>
            </div>

            {/* Music Controls */}
            <div className="flex items-center space-x-4">
              <MdSkipPrevious className="text-4xl cursor-pointer text-white" onClick={handlePreviousTrack} />
              {isPlaying ? (
                <MdPauseCircleFilled className="text-5xl cursor-pointer text-white" onClick={handlePlayPause} />
              ) : (
                <MdPlayCircleFilled className="text-5xl cursor-pointer text-white" onClick={handlePlayPause} />
              )}
              <MdSkipNext className="text-4xl cursor-pointer text-white" onClick={handleNextTrack} />
            </div>

            {/* Slider for Track Progress */}
            <div className="flex-grow mx-4">
              <Slider
                value={trackProgress}
                onChange={handleProgressChange}
                aria-label="Song progress"
                sx={{ color: 'white' }}
              />
            </div>

            {/* Volume Controller */}
            <div className="flex items-center space-x-4">
              <MdVolumeUp className="text-xl text-white" />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                sx={{ color: 'white', width: '100px' }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <MdShuffle className="text-xl text-white" />
              <MdRepeat className="text-xl text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

export default DreamStreamer;
