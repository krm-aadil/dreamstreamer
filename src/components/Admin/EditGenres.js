import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';

const EditGenres = () => {
  const [genres, setGenres] = useState([]);
  const [editingGenre, setEditingGenre] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedImageUrl, setUpdatedImageUrl] = useState('');

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

  // Handle Edit Genre
  const handleEditGenre = async (genre) => {
    setEditingGenre(genre);
    setUpdatedName(genre.genreName);
    setUpdatedImageUrl(genre.genreImageUrl);
  };

  const handleSaveChanges = async () => {
    try {
      await axios.put(`https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres/${editingGenre.genreId}`, {
        genreName: updatedName,
        genreImageUrl: updatedImageUrl,
      });

      setGenres((prevGenres) =>
        prevGenres.map((genre) =>
          genre.genreId === editingGenre.genreId
            ? { ...genre, genreName: updatedName, genreImageUrl: updatedImageUrl }
            : genre
        )
      );
      setEditingGenre(null); // Close the edit form
    } catch (err) {
      console.error('Error updating genre:', err);
    }
  };

  // Handle Delete Genre
  const handleDeleteGenre = async (genreId) => {
    const confirmed = window.confirm('Are you sure you want to delete this genre?');
    if (!confirmed) return;

    try {
      await axios.delete(`https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres/${genreId}`);
      setGenres((prevGenres) => prevGenres.filter((genre) => genre.genreId !== genreId));
    } catch (err) {
      console.error('Error deleting genre:', err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Genres</h2>

      {/* Editing Form */}
      {editingGenre && (
        <div className="mb-6 p-4 bg-gray-800 text-white rounded">
          <h3 className="text-lg font-semibold mb-2">Editing {editingGenre.genreName}</h3>
          <input
            type="text"
            className="p-2 mb-2 bg-gray-700 text-white rounded w-full"
            placeholder="Genre Name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
          />
          <input
            type="text"
            className="p-2 mb-2 bg-gray-700 text-white rounded w-full"
            placeholder="Genre Image URL"
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
            onClick={() => setEditingGenre(null)}
            className="py-2 px-4 bg-gray-500 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Genres Table */}
      <table className="min-w-full bg-gray-900 text-white">
        <thead>
          <tr>
            <th className="py-2 px-4 text-left">Genre Name</th>
            <th className="py-2 px-4 text-left">Genre Image</th>
            <th className="py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((genre) => (
            <tr key={genre.genreId} className="border-b border-gray-700">
              <td className="py-2 px-4">{genre.genreName}</td>
              <td className="py-2 px-4">
                <img
                  src={genre.genreImageUrl}
                  alt={genre.genreName}
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="py-2 px-4 flex items-center justify-around">
                <button
                  onClick={() => handleEditGenre(genre)}
                  className="text-blue-500 hover:text-blue-600 mr-4"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteGenre(genre.genreId)}
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

export default EditGenres;
