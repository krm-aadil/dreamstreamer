import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';

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
    <div className="p-6 bg-cyan-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-800">Albums</h2>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            className="p-2 pl-10 bg-white rounded-lg shadow-md text-gray-800 w-full md:w-64"
            placeholder="Search albums by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Albums Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full bg-white text-gray-800">
          <thead className="bg-cyan-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Album Name</th>
              <th className="py-3 px-4 text-left">Album Year</th>
              <th className="py-3 px-4 text-left">Album Art</th>
              <th className="py-3 px-4 text-left">Genre</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlbums.length > 0 ? (
              filteredAlbums.map((album) => (
                <tr key={album.albumId} className="border-b last:border-none border-gray-200 hover:bg-cyan-50 transition-colors duration-300">
                  <td className="py-3 px-4">{album.albumName}</td>
                  <td className="py-3 px-4">{album.albumYear}</td>
                  <td className="py-3 px-4">
                    <img
                      src={album.albumArtUrl}
                      alt={album.albumName}
                      className="w-16 h-16 object-cover rounded-lg shadow-md"
                    />
                  </td>
                  <td className="py-3 px-4">{album.genreId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-3 px-4 text-center text-gray-500">No albums found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAlbums;
