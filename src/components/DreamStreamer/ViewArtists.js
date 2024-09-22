import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewArtists = ({ searchQuery }) => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        setArtists(artistsResponse.data);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

    fetchArtists();
  }, []);

  return (
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
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-lg">{artist.artistName}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ViewArtists;
