import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewGenres = () => {
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        setGenres(genresResponse.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Browse All Genres</h2>
      <div className="grid grid-cols-4 gap-8">
        {genres.map((genre) => (
          <div
            key={genre.genreId}
            className="relative group overflow-hidden bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
          >
            <div className="absolute bottom-4 left-4 text-white">
              <p className="font-bold text-lg">{genre.genreName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewGenres;
