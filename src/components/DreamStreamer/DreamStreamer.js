import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaHome, FaMusic, FaSignOutAlt } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { MdSkipNext, MdSkipPrevious, MdPlayCircleFilled, MdPauseCircleFilled, MdShuffle, MdRepeat, MdVolumeUp } from 'react-icons/md';
import { Slider, Avatar, IconButton } from '@mui/material';
import axios from 'axios';

const DreamStreamer = ({ signOut }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState([]);
  const [genres, setGenres] = useState([]); // For genres
  const [artists, setArtists] = useState([]); // For artists
  const [viewMode, setViewMode] = useState('albums'); // Tracks which view is active
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [volume, setVolume] = useState(50); // Volume state

  // Ref for audio element
  const audioRef = useRef(null);

  useEffect(() => {
    // Fetch albums when the component mounts
    const fetchAlbums = async () => {
      try {
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        setAlbums(albumsResponse.data); // Ensure albums are being set correctly
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []);

  // Fetch genres and artists
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

  // Call genres and artists fetcher only when the component loads for the first time
  useEffect(() => {
    fetchGenresAndArtists();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Function to track play count
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

  // Handle progress bar
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

  // Handle volume change
  const handleVolumeChange = (event, newValue) => {
    setVolume(newValue);
    if (audioRef.current) {
      audioRef.current.volume = newValue / 100;
    }
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-1/5 bg-black p-6 flex flex-col">
        {/* Logo */}
        <div className="text-3xl font-bold mb-6">
          <img
            src="https://github.com/krm-aadil/GIT-IMAGES/blob/main/Black_and_Turquoise_Circle_Music_Logo-removebg-preview.png?raw=true"
            alt="DreamStreamer Logo"
            className="w-16 h-16"
          />
        </div>
        <ul className="space-y-8">
          <li
            className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer"
            onClick={() => setViewMode('albums')}
          >
            <FaHome className="text-xl" />
            <span>Home</span>
          </li>
          <li className="flex items-center space-x-4 text-white">
            <FaSearch className="text-xl" />
            <span>Search</span>
          </li>
          <li
            className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer"
            onClick={() => setViewMode('albums')}
          >
            <FaMusic className="text-xl" />
            <span>View All Albums</span>
          </li>
          <li
            className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer"
            onClick={() => setViewMode('genres')}
          >
            <FaMusic className="text-xl" />
            <span>View All Genres</span>
          </li>
          <li
            className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer"
            onClick={() => setViewMode('artists')}
          >
            <FaMusic className="text-xl" />
            <span>View All Artists</span>
          </li>
          <li className="flex items-center space-x-4 text-gray-400 hover:text-white transition cursor-pointer" onClick={signOut}>
            <FaSignOutAlt className="text-xl" />
            <span>Sign Out</span>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-grow p-6 bg-black">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <IconButton>
              <IoIosArrowBack className="text-white text-2xl" />
            </IconButton>
            <input
              type="text"
              placeholder="Search"
              className="bg-gray-700 rounded-lg px-6 py-3 text-white w-1/2 focus:outline-none text-lg"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="flex items-center space-x-4">
            <span>Lisa</span>
            <Avatar alt="Lisa" src="https://via.placeholder.com/150" />
          </div>
        </div>

        {/* View Albums */}
        {viewMode === 'albums' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Browse All Albums</h2>
            <div className="grid grid-cols-4 gap-8">
              {albums
                .filter((album) => album.albumName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((album) => (
                  <div
                    key={album.albumId}
                    className="relative group overflow-hidden bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
                    onClick={() => handleAlbumClick(album)}
                  >
                    <img
                      src={album.albumArtUrl}
                      alt={album.albumName}
                      className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 transition duration-300"
                    />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">{album.albumName}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* View Genres */}
        {viewMode === 'genres' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Browse All Genres</h2>
            <div className="grid grid-cols-4 gap-8">
              {genres
                .filter((genre) => genre.genreName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((genre) => (
                  <div
                    key={genre.genreId}
                    className="relative group overflow-hidden bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
                  >
                    <img
                      src="https://via.placeholder.com/150" // Default placeholder image
                      alt={genre.genreName}
                      className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 transition duration-300"
                    />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">{genre.genreName}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* View Artists */}
        {viewMode === 'artists' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Browse All Artists</h2>
            <div className="grid grid-cols-4 gap-8">
              {artists
                .filter((artist) => artist.artistName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((artist) => (
                  <div
                    key={artist.artistId}
                    className="relative group overflow-hidden bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
                  >
                    <img
                      src="https://via.placeholder.com/150" // Default placeholder image
                      alt={artist.artistName}
                      className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 transition duration-300"
                    />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="font-bold text-lg">{artist.artistName}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Album Details and Tracks */}
        {currentAlbum && (
          <div className="mt-8">
            <div className="flex items-center">
              <img
                src={currentAlbum.albumArtUrl}
                alt={currentAlbum.albumName}
                className="w-48 h-48 object-cover rounded-lg mr-6"
              />
              <div>
                <h2 className="text-4xl font-bold">{currentAlbum.albumName}</h2>
                <p className="text-lg text-gray-400">Year: {currentAlbum.albumYear}</p>
                <p className="text-lg text-gray-400">Genre: {currentAlbum.genreId}</p>
                <p className="text-lg text-gray-400">Band: {currentAlbum.bandComposition}</p>
                <p className="text-lg text-gray-400">Artists: {currentAlbum.artists.join(', ')}</p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-bold mb-4">Tracks</h3>
              <ul className="space-y-4">
                {tracks.map((track) => (
                  <li
                    key={track.trackUrl}
                    className="flex items-center justify-between bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer"
                    onClick={() => handleTrackClick(track)}
                  >
                    <div>
                      <p className="font-bold">{track.trackName}</p>
                      <p className="text-sm text-gray-400">{track.trackLabel}</p>
                    </div>
                    <IconButton className="text-white">
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
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-3/4 bg-black bg-opacity-60 p-4 rounded-lg shadow-lg flex justify-between items-center space-x-4">
            <div className="flex items-center space-x-4">
              {/* Album Art */}
              <img
                src={currentAlbum ? currentAlbum.albumArtUrl : 'https://via.placeholder.com/50'}
                alt="Track Thumbnail"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-bold">{currentTrack.trackName}</p>
                <p className="text-sm text-gray-400">{currentTrack.trackLabel}</p>
              </div>
            </div>

            {/* Music Controls */}
            <div className="flex items-center space-x-4">
              <MdSkipPrevious className="text-4xl cursor-pointer" onClick={handlePreviousTrack} />
              {isPlaying ? (
                <MdPauseCircleFilled className="text-5xl cursor-pointer" onClick={handlePlayPause} />
              ) : (
                <MdPlayCircleFilled className="text-5xl cursor-pointer" onClick={handlePlayPause} />
              )}
              <MdSkipNext className="text-4xl cursor-pointer" onClick={handleNextTrack} />
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
              <MdVolumeUp className="text-xl" />
              <Slider
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                sx={{ color: 'white', width: '100px' }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <MdShuffle className="text-xl" />
              <MdRepeat className="text-xl" />
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
