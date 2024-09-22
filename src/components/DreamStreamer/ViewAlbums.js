import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdPlayCircleFilled } from 'react-icons/md';
import { IconButton } from '@mui/material';

const ViewAlbums = ({ searchQuery, onTrackClick }) => {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        setAlbums(albumsResponse.data);
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };

    fetchAlbums();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Browse All Albums</h2>
      <div className="grid grid-cols-4 gap-8">
        {albums
          .filter((album) => album.albumName.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((album) => (
            <div
              key={album.albumId}
              className="relative group overflow-hidden bg-gray-800 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
            >
              <img
                src={album.albumArtUrl}
                alt={album.albumName}
                className="w-full h-48 object-cover opacity-70 group-hover:opacity-100 transition duration-300"
              />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="font-bold text-lg">{album.albumName}</p>
              </div>
              <IconButton className="absolute top-4 right-4 text-white" onClick={() => onTrackClick(album.tracks[0])}>
                <MdPlayCircleFilled className="text-4xl" />
              </IconButton>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ViewAlbums;
