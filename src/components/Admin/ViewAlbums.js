import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAlbums, setFilteredAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        setAlbums(response.data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    const results = albums.filter((album) =>
      album.albumName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAlbums(results);
  }, [searchTerm, albums]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Albums</h2>

      {/* Search Bar */}
      <input
        type="text"
        className="p-2 mb-4 bg-gray-800 text-white rounded w-full"
        placeholder="Search albums by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Albums Table */}
      <table className="min-w-full bg-gray-900 text-white">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Album Name</th>
            <th className="py-2 px-4 text-left">Album Year</th>
            <th className="py-2 px-4 text-left">Album Art</th>
            <th className="py-2 px-4 text-left">Genre</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlbums.map((album) => (
            <tr key={album.albumId} className="border-b border-gray-700">
              <td className="py-2 px-4">{album.albumName}</td>
              <td className="py-2 px-4">{album.albumYear}</td>
              <td className="py-2 px-4">
                <img
                  src={album.albumArtUrl}
                  alt={album.albumName}
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="py-2 px-4">{album.genreId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewAlbums;
