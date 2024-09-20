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
    <div className="p-6 flex-grow text-white">
      {/* Filters */}
      <div className="p-6 flex justify-between">
        <input
          type="text"
          name="artistName"
          placeholder="Filter by Artist Name"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.artistName}
          onChange={(e) => setFilter({ ...filter, artistName: e.target.value })}
        />
      </div>

      {/* Display Artists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterArtists().map((artist) => (
          <div key={artist.artistId} className="cursor-pointer">
            <img
              src={artist.artistImageUrl}
              alt={artist.artistName}
              className="w-full h-40 object-cover rounded-lg mb-2 hover:opacity-80 transition duration-200"
            />
            <h3 className="text-gray-400 text-center">{artist.artistName}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewArtists;
