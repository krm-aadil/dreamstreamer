import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewArtists = () => {
  const [artists, setArtists] = useState([]);
  const [filter, setFilter] = useState({ artistName: '' });

  // Fetch all artists on load
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        setArtists(response.data);  // Assuming the API returns a list of artists
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };
    fetchArtists();
  }, []);

  // Filter artists based on user input
  const filterArtists = () => {
    return artists.filter((artist) => {
      return (!filter.artistName || artist.artistName.toLowerCase().includes(filter.artistName.toLowerCase()));
    });
  };

  return (
    <div className="p-6 bg-cyan-100 min-h-screen text-gray-900 font-poppins rounded-lg shadow-md">
    <div className="p-6 flex-grow text-gray-900 bg-cyan-100 font-poppins">
      {/* Filters */}
      <div className="p-6 flex justify-between">
        <input
          type="text"
          name="artistName"
          placeholder="Filter by Artist Name"
          className="p-2 bg-white border border-gray-300 rounded-lg w-full sm:w-1/3"
          value={filter.artistName}
          onChange={(e) => setFilter({ ...filter, artistName: e.target.value })}
        />
      </div>

      {/* Display Artists */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-20">
        {filterArtists().map((artist) => (
          <div key={artist.artistId} className="flex flex-col items-center">
            <div className="w-60 h-60 rounded-full overflow-hidden bg-white shadow-lg">
              <img
                src={artist.artistImageUrl}
                alt={artist.artistName}
                className="w-full h-full object-cover hover:opacity-80 transition duration-200"
              />
            </div>
            <h3 className="text-cyan-700 mt-4 text-center">{artist.artistName}</h3>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ViewArtists;
