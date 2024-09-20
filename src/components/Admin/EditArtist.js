import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

const EditArtists = () => {
  const [artists, setArtists] = useState([]);
  const [editingArtist, setEditingArtist] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedImageUrl, setUpdatedImageUrl] = useState('');

  useEffect(() => {
    // Fetch all artists
    const fetchArtists = async () => {
      try {
        const response = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        setArtists(response.data);  // Correctly setting the artist data here
      } catch (err) {
        console.error('Error fetching artists:', err);
      }
    };

    fetchArtists();
  }, []);

  // Handle Edit Artist
  const handleEditArtist = async (artist) => {
    setEditingArtist(artist);
    setUpdatedName(artist.artistName);
    setUpdatedImageUrl(artist.artistImageUrl);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists/${editingArtist.artistId}`, {
        artistName: updatedName,
        artistImageUrl: updatedImageUrl,
      });

      setArtists((prevArtists) =>
        prevArtists.map((artist) =>
          artist.artistId === editingArtist.artistId
            ? { ...artist, artistName: updatedName, artistImageUrl: updatedImageUrl }
            : artist
        )
      );
      setEditingArtist(null); // Close the edit form
    } catch (err) {
      console.error('Error updating artist:', err);
    }
  };

  // Handle Delete Artist
  const handleDeleteArtist = async (artistId) => {
    const confirmed = window.confirm('Are you sure you want to delete this artist?');
    if (!confirmed) return;

    try {
      await axios.delete(`https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists/${artistId}`);
      setArtists((prevArtists) => prevArtists.filter((artist) => artist.artistId !== artistId));
    } catch (err) {
      console.error('Error deleting artist:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Artists</h2>

      {/* Editing Form */}
      {editingArtist && (
        <div className="mb-6 p-4 bg-gray-800 text-white rounded">
          <h3 className="text-lg font-semibold mb-2">Editing {editingArtist.artistName}</h3>
          <input
            type="text"
            className="p-2 mb-2 bg-gray-700 text-white rounded w-full"
            placeholder="Artist Name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <input
            type="text"
            className="p-2 mb-2 bg-gray-700 text-white rounded w-full"
            placeholder="Artist Image URL"
            value={updatedImageUrl}
            onChange={(e) => setUpdatedImageUrl(e.target.value)}
          />
          <button
            onClick={handleSaveChanges}
            className="py-2 px-4 bg-green-500 rounded hover:bg-green-600 mr-2"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingArtist(null)}
            className="py-2 px-4 bg-gray-500 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Artists Table */}
      <table className="min-w-full bg-gray-900 text-white">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Artist Name</th>
            <th className="py-2 px-4 text-left">Artist Image</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr key={artist.artistId} className="border-b border-gray-700">
              <td className="py-2 px-4">{artist.artistName}</td>
              <td className="py-2 px-4">
                <img
                  src={artist.artistImageUrl}
                  alt={artist.artistName}
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="py-2 px-4 flex items-center justify-around">
                <button
                  onClick={() => handleEditArtist(artist)}
                  className="text-blue-500 hover:text-blue-600 mr-4"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteArtist(artist.artistId)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditArtists;
