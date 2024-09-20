import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaVolumeUp, FaSignOutAlt, FaHeart, FaMusic, FaThList, FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const DreamStreamer = ({ signOut }) => {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [purchasedAlbums, setPurchasedAlbums] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [isBottomPlayerVisible, setIsBottomPlayerVisible] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums');
        setAlbums(response.data.albums);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();

    const storedPurchasedAlbums = localStorage.getItem('purchasedAlbums');
    if (storedPurchasedAlbums) {
      setPurchasedAlbums(JSON.parse(storedPurchasedAlbums));
    }
  }, []);

  const handlePurchase = (album) => {
    const isPurchased = purchasedAlbums.some(purchasedAlbum => purchasedAlbum.albumId === album.albumId);

    if (isPurchased) {
      alert(`You have already purchased ${album.albumName}!`);
      return;
    }

    alert(`You have purchased ${album.albumName}!`);

    const newPurchasedAlbums = [...purchasedAlbums, album];
    setPurchasedAlbums(newPurchasedAlbums);

    localStorage.setItem('purchasedAlbums', JSON.stringify(newPurchasedAlbums));
  };

  const viewPurchasedAlbums = () => {
    if (purchasedAlbums.length === 0) {
      alert("You haven't purchased any albums.");
      navigate('/');
      return;
    }

    setAlbums(purchasedAlbums);
    setSelectedAlbum(null);
  };

  const playTrack = async (trackUrl, index, albumId, trackName) => {
    if (audio) {
      audio.pause();
    }

    const newAudio = new Audio(trackUrl);
    newAudio.volume = volume;
    newAudio.play();
    setAudio(newAudio);
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setIsBottomPlayerVisible(true);

    newAudio.addEventListener('timeupdate', () => {
      setProgress((newAudio.currentTime / newAudio.duration) * 100);
    });

    newAudio.addEventListener('ended', () => {
      if (repeat) {
        playTrack(trackUrl, index, albumId, trackName);
      } else if (shuffle) {
        playRandomTrack();
      } else {
        playNextTrack();
      }
    });

    try {
      await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/track-play', {
        albumId,
        trackName,
      });
      console.log('Track play recorded successfully');
    } catch (error) {
      console.error('Error recording track play:', error);
    }
  };

  const togglePlayPause = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNextTrack = () => {
    if (selectedAlbum) {
      if (shuffle) {
        playRandomTrack();
      } else if (currentTrackIndex < selectedAlbum.tracks.length - 1) {
        playTrack(selectedAlbum.tracks[currentTrackIndex + 1].trackUrl, currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }
  };

  const playPreviousTrack = () => {
    if (selectedAlbum && currentTrackIndex > 0) {
      playTrack(selectedAlbum.tracks[currentTrackIndex - 1].trackUrl, currentTrackIndex - 1);
    }
  };

  const playRandomTrack = () => {
    if (selectedAlbum) {
      const randomIndex = Math.floor(Math.random() * selectedAlbum.tracks.length);
      playTrack(selectedAlbum.tracks[randomIndex].trackUrl, randomIndex);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = e.target.value;
    setProgress(newProgress);
    if (audio) {
      audio.currentTime = (newProgress / 100) * audio.duration;
    }
  };

  const toggleShuffle = () => {
    setShuffle(!shuffle);
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setCurrentTrackIndex(0);
    setIsBottomPlayerVisible(true);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGenreFilter = (e) => {
    setGenreFilter(e.target.value);
  };

  const handleYearFilter = (e) => {
    setYearFilter(e.target.value);
  };

  const showAllAlbums = () => {
    setSelectedAlbum(null);
    setIsBottomPlayerVisible(true);
  };

  const filteredAlbums = albums.filter(
    (album) =>
      album.albumName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!genreFilter || album.genre === genreFilter) &&
      (!yearFilter || album.albumYear === yearFilter)
  );

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      {/* change bg blue-400 to change the main color */}
      <header className="flex items-center justify-between p-4 bg-blue-400 text-white">
        <div className="text-3xl font-bold">DreamStreamer</div>
        <button
          onClick={signOut}
          className="py-2 px-4 bg-transparent text-white rounded-lg hover:bg-red-600 transition duration-200"
        >
          <FaSignOutAlt className="text-lg" />
        </button>
      </header>

      {/* Sidebar and Content */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        {/* change bg blue-400 to change the side color */}
        <aside className="w-1/6 bg-blue-400 p-4 h-full flex-shrink-0">
          <div className="mb-6">
            <div className="flex items-center bg-gray-700 p-2 rounded-lg text-white">
              <FaSearch className="mr-2" />
              <input
                type="text"
                className="bg-transparent outline-none w-full text-white"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold text-white mb-4">Your Library</h3>
            <ul className="space-y-4">
              {/* change hiver:text-blue-900 to change the side bar hover color */}
              <li className="flex items-center text-white cursor-pointer hover:text-blue-900 transition">
                <FaHeart className="mr-2" /> Liked Songs
              </li>
              <li className="flex items-center text-white cursor-pointer hover:text-blue-900 transition">
                <FaMusic className="mr-2" /> Custom Songs
              </li>
              <li className="flex items-center text-white cursor-pointer hover:text-blue-900 transition" onClick={showAllAlbums}>
                <FaThList className="mr-2" /> All Albums
              </li>
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        {/* Change bg-gray-900 to change the main content color */}
        <main className="flex-grow p-6 bg-gray-900">
          {selectedAlbum ? (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedAlbum.albumArtUrl}
                  alt="Album Art"
                  className="w-40 h-40 rounded-lg shadow-lg"
                />
                <div>
                  <h2 className="text-4xl font-bold text-white">{selectedAlbum.albumName}</h2>
                  <p className="text-gray-400">{selectedAlbum.albumYear}</p>
                  <p className="text-gray-400">{selectedAlbum.artists.join(', ')}</p>
                  <p className="text-gray-400">{selectedAlbum.tracks.length} songs</p>
                </div>
              </div>
              <table className="w-full text-white">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left">#</th>
                    <th className="text-left">Title</th>
                    
                  </tr>
                </thead>
                <tbody>
                  {selectedAlbum.tracks.map((track, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-800 cursor-pointer ${index === currentTrackIndex ? 'bg-gray-800' : ''
                        }`}
                      onClick={() => playTrack(track.trackUrl, index, selectedAlbum.albumId, track.trackName)}
                    >
                      <td>{index + 1}</td>
                      <td>{track.trackName}</td>
                     
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-white mb-4">Welcome to DreamStreamer</h2>

              {/* Filters */}
              <div className="flex space-x-4 mb-4">
                <select
                  className="bg-gray-800 text-white p-2 rounded-lg"
                  value={genreFilter}
                  onChange={handleGenreFilter}
                >
                  <option value="">All Genres</option>
                  <option value="Rock">Rock</option>
                  <option value="Pop">Pop</option>
                  <option value="Hip-hop">Hip-hop</option>
                </select>

                <select
                  className="bg-gray-800 text-white p-2 rounded-lg"
                  value={yearFilter}
                  onChange={handleYearFilter}
                >
                  <option value="">All Years</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                </select>
              </div>

              <div className="grid grid-cols-4 gap-6">
                {filteredAlbums.map((album) => (
                  <div key={album.albumId} className="cursor-pointer">
                    <img
                      src={album.albumArtUrl}
                      alt={album.albumName}
                      className="w-full h-40 rounded-lg hover:opacity-80 transition duration-200 shadow-lg"
                      onClick={() => handleAlbumClick(album)}
                    />
                    <p className="mt-2 text-center text-lg font-semibold text-white">{album.albumName}</p>
                    <button
                      onClick={() => handlePurchase(album)}
                      className="mt-2 py-1 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 w-full"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Bottom Player */}
      {isBottomPlayerVisible && (
        // Change bg-sky-800 to change the bottom player color
        <footer className="bg-sky-800 p-4 fixed bottom-0 w-full flex items-center justify-between space-y-2">
          {/* Album art and track info in the left corner */}
          <div className="flex items-center">
            <img
              src={selectedAlbum?.albumArtUrl}
              alt="Album Art"
              className="w-12 h-12 rounded-lg mr-4"
            />
            <div>
              <p className="text-sm font-semibold text-white">{selectedAlbum?.tracks[currentTrackIndex]?.trackName}</p>
              <p className="text-xs text-gray-400">{selectedAlbum?.artists.join(', ')}</p>
            </div>
          </div>

          {/* Play controls in the center */}
          {/* Change bg-gray-400 to change the play controls color */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center space-x-4">
              <button
                className="p-2 bg-gray-400 rounded-full hover:bg-gray-600 transition duration-200"
                onClick={playPreviousTrack}
              >
                <FaStepBackward className="text-white" />
              </button>
              <button
                className="p-2 bg-gray-400 rounded-full hover:bg-gray-600 transition duration-200"
                onClick={togglePlayPause}
              >
                {isPlaying ? <FaPause className="text-white" /> : <FaPlay className="text-white" />}
              </button>
              <button
                className="p-2 bg-gray-400 rounded-full hover:bg-gray-600 transition duration-200"
                onClick={playNextTrack}
              >
                <FaStepForward className="text-white" />
              </button>
            </div>

            {/* Music Progress Slider */}
            <div className="flex items-center space-x-2 w-full justify-center mt-2">
              <span className="text-white text-xs">{formatTime((audio && audio.currentTime) || 0)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-80"
              />
              <span className="text-white text-xs"> / {audio ? formatTime(audio.duration) : '0:00'}</span>
            </div>
          </div>

          {/* Volume control in the right corner */}
          <div className="flex items-center space-x-2">
            <FaVolumeUp className="text-white" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
        </footer>
      )}
    </div>
  );
};

export default DreamStreamer;
