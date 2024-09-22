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
  const handleEditArtist = (artist) => {
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
    <div className="p-6 text-white flex-grow bg-gradient-to-br from-cyan-800 to-cyan-100 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-white">Edit Artists</h2>

      {/* Editing Form */}
      {editingArtist && (
        <div className="mb-6 p-4 bg-cyan-500 text-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Editing {editingArtist.artistName}</h3>
          <input
            type="text"
            className="p-3 mb-4 bg-gray-900 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Artist Name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <input
            type="text"
            className="p-3 mb-4 bg-gray-900 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Artist Image URL"
            value={updatedImageUrl}
            onChange={(e) => setUpdatedImageUrl(e.target.value)}
          />
          <div className="flex space-x-4">
            <button
              onClick={handleSaveChanges}
              className="py-2 px-6 bg-green-500 rounded-lg hover:bg-green-600 transition duration-200 text-white"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingArtist(null)}
              className="py-2 px-6 bg-gray-500 rounded-lg hover:bg-gray-600 transition duration-200 text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Artists Table */}
      <table className="min-w-full bg-gray-900 rounded-lg shadow-lg">
        <thead>
          <tr className="bg-cyan-500">
            <th className="py-4 px-6 text-left text-lg">Artist Name</th>
            <th className="py-4 px-6 text-left text-lg">Artist Image</th>
            <th className="py-4 px-6 text-center text-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr key={artist.artistId} className="border-b border-gray-700 hover:bg-cyan-500 transition">
              <td className="py-4 px-6">{artist.artistName}</td>
              <td className="py-4 px-6">
                <img
                  src={artist.artistImageUrl}
                  alt={artist.artistName}
                  className="w-16 h-16 object-cover rounded-full"
                />
              </td>
              <td className="py-4 px-6 flex justify-around items-center">
                <button
                  onClick={() => handleEditArtist(artist)}
                  className="text-blue-500 hover:text-blue-600 transition duration-200"
                >
                  <FaEdit className="text-xl" />
                </button>
                <button
                  onClick={() => handleDeleteArtist(artist.artistId)}
                  className="text-red-500 hover:text-red-600 transition duration-200"
                >
                  <FaTrash className="text-xl" />
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
