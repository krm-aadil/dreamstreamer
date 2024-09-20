import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewGenres = () => {
  const [genres, setGenres] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGenres, setFilteredGenres] = useState([]);

  useEffect(() => {
    // Fetch all genres
    const fetchGenres = async () => {
      try {
        const response = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        setGenres(response.data);
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    const results = genres.filter(genre =>
      genre.genreName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGenres(results);
  }, [searchTerm, genres]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Genres</h2>

      {/* Search Bar */}
      <input
        type="text"
        className="p-2 mb-4 bg-gray-800 text-white rounded w-full"
        placeholder="Search genres by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Genres Table */}
      <table className="min-w-full bg-gray-900 text-white">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Genre Name</th>
            <th className="py-2 px-4 text-left">Genre Image</th>
          </tr>
        </thead>
        <tbody>
          {filteredGenres.map((genre) => (
            <tr key={genre.genreId} className="border-b border-gray-700">
              <td className="py-2 px-4">{genre.genreName}</td>
              <td className="py-2 px-4">
                <img
                  src={genre.genreImageUrl}
                  alt={genre.genreName}
                  className="w-16 h-16 object-cover"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewGenres;
