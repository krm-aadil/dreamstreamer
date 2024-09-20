import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [albums, setAlbums] = useState([]);
  const [filter, setFilter] = useState({ genre: '', albumName: '', artists: '', trackName: '' });
  const [stats, setStats] = useState({ totalAlbums: 0, totalTracks: 0 });

  // Fetch all albums on load
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums');
        setAlbums(response.data.albums);

        // Calculate stats
        const totalTracks = response.data.albums.reduce((acc, album) => acc + album.tracks.length, 0);
        setStats({ totalAlbums: response.data.albums.length, totalTracks });
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    fetchAlbums();
  }, []);

  // Filter albums based on user input
  const filterAlbums = () => {
    return albums.filter((album) => {
      return (
        (!filter.genre || album.genre.toLowerCase().includes(filter.genre.toLowerCase())) &&
        (!filter.albumName || album.albumName.toLowerCase().includes(filter.albumName.toLowerCase())) &&
        (!filter.artists || album.artists.join(', ').toLowerCase().includes(filter.artists.toLowerCase())) &&
        (!filter.trackName || album.tracks.some((track) => track.trackName.toLowerCase().includes(filter.trackName.toLowerCase())))
      );
    });
  };

  return (
    <div className="p-6 flex-grow text-white">
      {/* Dashboard Stats */}
      <div className="p-6 flex justify-between">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-1/4 text-center">
          <h3 className="text-xl font-bold">Total Albums</h3>
          <p className="text-2xl">{stats.totalAlbums}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-1/4 text-center">
          <h3 className="text-xl font-bold">Total Tracks</h3>
          <p className="text-2xl">{stats.totalTracks}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 flex justify-between">
        <input
          type="text"
          name="genre"
          placeholder="Filter by Genre"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.genre}
          onChange={(e) => setFilter({ ...filter, genre: e.target.value })}
        />
        <input
          type="text"
          name="albumName"
          placeholder="Filter by Album Name"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.albumName}
          onChange={(e) => setFilter({ ...filter, albumName: e.target.value })}
        />
        <input
          type="text"
          name="artists"
          placeholder="Filter by Artists"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.artists}
          onChange={(e) => setFilter({ ...filter, artists: e.target.value })}
        />
        <input
          type="text"
          name="trackName"
          placeholder="Filter by Track Name"
          className="p-2 bg-gray-800 rounded"
          value={filter.trackName}
          onChange={(e) => setFilter({ ...filter, trackName: e.target.value })}
        />
      </div>

      {/* Display Only Album Art Initially */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterAlbums().map((album) => (
          <div key={album.albumId} className="cursor-pointer">
            <img
              src={album.albumArtUrl}
              alt={album.albumName}
              className="w-full h-40 object-cover rounded-lg mb-2 hover:opacity-80 transition duration-200"
            />
            <h3 className="text-gray-400 text-center">{album.albumName}</h3>
            <p className="text-gray-400 text-center">Play Count: {album.playCount || 0}</p>
            <p className="text-gray-400 text-center">Last Played Track: {album.lastPlayedTrack || 'N/A'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
