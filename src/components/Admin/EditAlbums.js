import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Select from 'react-select';

const EditAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [updatedAlbumDetails, setUpdatedAlbumDetails] = useState({
    albumName: '',
    albumYear: '',
    genreId: '',
    albumArtUrl: '',
    bandComposition: '',
    selectedArtists: [],
  });
  const [trackDetails, setTrackDetails] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [albumArtFile, setAlbumArtFile] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    // Fetch albums, artists, and genres when the component mounts
    const fetchAlbumsAndGenres = async () => {
      try {
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        
        setAlbums(albumsResponse.data);
        setArtists(artistsResponse.data);
        setGenres(genresResponse.data);
      } catch (error) {
        console.error('Error fetching albums, artists, or genres:', error);
      }
    };

    fetchAlbumsAndGenres();
  }, []);

  const handleEditAlbum = (album) => {
    setEditingAlbum(album);
    setUpdatedAlbumDetails({
      albumName: album.albumName,
      albumYear: album.albumYear,
      genreId: album.genreId,
      albumArtUrl: album.albumArtUrl,
      bandComposition: album.bandComposition,
      selectedArtists: album.artists,
    });
    setTrackDetails(album.tracks || []);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedAlbumDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleArtistSelection = (selectedOptions) => {
    const selectedArtists = selectedOptions.map(option => option.value);
    setUpdatedAlbumDetails((prev) => ({ ...prev, selectedArtists }));
  };

  const handleAlbumArtChange = (event) => {
    setAlbumArtFile(event.target.files[0]);
  };

  const handleTrackChange = (event) => {
    const newTracks = Array.from(event.target.files).map((file) => ({
      trackFile: file,
      trackName: file.name,
      trackLabel: '',
    }));
    setTracks([...tracks, ...newTracks]);
  };

  const handleTrackLabelChange = (index, value) => {
    const updatedTracks = [...trackDetails];
    updatedTracks[index].trackLabel = value;
    setTrackDetails(updatedTracks);
  };

  const handleSaveChanges = async () => {
    try {
      let albumArtUrl = updatedAlbumDetails.albumArtUrl;

      // Upload new album art if a new file is selected
      if (albumArtFile) {
        const albumArtResponse = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url', {
          fileName: albumArtFile.name,
          fileType: albumArtFile.type,
        });
        albumArtUrl = albumArtResponse.data.uploadUrl.split('?')[0];
        await axios.put(albumArtResponse.data.uploadUrl, albumArtFile, {
          headers: {
            'Content-Type': albumArtFile.type,
          },
        });
      }

      // Upload new tracks if any new files are selected
      const updatedTracks = [...trackDetails];
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const trackResponse = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url', {
          fileName: track.trackFile.name,
          fileType: track.trackFile.type,
        });
        const trackUrl = trackResponse.data.uploadUrl.split('?')[0];
        await axios.put(trackResponse.data.uploadUrl, track.trackFile, {
          headers: {
            'Content-Type': track.trackFile.type,
          },
        });
        updatedTracks.push({
          trackName: track.trackName,
          trackUrl,
          trackLabel: track.trackLabel || 'Default Label', // Default label if not provided
        });
      }

      // Update album metadata
      const updatedAlbumMetadata = {
        albumName: updatedAlbumDetails.albumName,
        albumYear: parseInt(updatedAlbumDetails.albumYear),
        genreId: updatedAlbumDetails.genreId,
        albumArtUrl,
        bandComposition: updatedAlbumDetails.bandComposition,
        artists: updatedAlbumDetails.selectedArtists,
        tracks: updatedTracks,
      };

      await axios.put(
        `https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums/${editingAlbum.albumId}`,
        updatedAlbumMetadata
      );

      // Update the albums state with new values
      setAlbums((prevAlbums) =>
        prevAlbums.map((album) =>
          album.albumId === editingAlbum.albumId ? { ...album, ...updatedAlbumMetadata } : album
        )
      );
      setEditingAlbum(null); // Exit edit mode
      setUploadStatus('Album updated successfully!');
    } catch (error) {
      console.error('Error updating album:', error);
      setUploadStatus('Failed to update album.');
    }
  };

  const handleDeleteAlbum = async (albumId) => {
    const confirmed = window.confirm('Are you sure you want to delete this album?');
    if (!confirmed) return;

    try {
      await axios.delete(`https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums/${albumId}`);
      setAlbums((prevAlbums) => prevAlbums.filter((album) => album.albumId !== albumId));
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const artistOptions = artists.map(artist => ({
    label: artist.artistName,
    value: artist.artistId,
  }));

  return (
    <div className="p-6 text-white flex-grow">
      <h2 className="text-3xl font-bold mb-4 text-cyan-600">Edit Albums</h2>

      {/* Edit Form */}
      {editingAlbum && (
        <div className="mb-6 p-4 bg-cyan-900 rounded-lg shadow-lg text-white">
          <h3 className="text-lg font-semibold mb-4">Editing {editingAlbum.albumName}</h3>
          <input
            type="text"
            name="albumName"
            className="p-3 mb-4 bg-cyan-800 rounded-lg text-white w-full"
            placeholder="Album Name"
            value={updatedAlbumDetails.albumName}
            onChange={handleInputChange}
          />
          <input
            type="number"
            name="albumYear"
            className="p-3 mb-4 bg-cyan-800 rounded-lg text-white w-full"
            placeholder="Album Year"
            value={updatedAlbumDetails.albumYear}
            onChange={handleInputChange}
          />
          <select
            name="genreId"
            className="p-3 mb-4 bg-cyan-800 rounded-lg text-white w-full"
            value={updatedAlbumDetails.genreId}
            onChange={handleInputChange}
          >
            <option value="">Select Genre</option>
            {genres.map((genre) => (
              <option key={genre.genreId} value={genre.genreId}>
                {genre.genreName}
              </option>
            ))}
          </select>
          <Select
            options={artistOptions}
            isMulti
            onChange={handleArtistSelection}
            value={artistOptions.filter(option => updatedAlbumDetails.selectedArtists.includes(option.value))}
            className="text-black mb-4"
          />
          <input
            type="text"
            name="bandComposition"
            className="p-3 mb-4 bg-cyan-800 rounded-lg text-white w-full"
            placeholder="Band Composition"
            value={updatedAlbumDetails.bandComposition}
            onChange={handleInputChange}
          />
          
          {/* Album Art Input */}
          <label className="block mb-2 text-lg">Change Album Art (Image)</label>
          <input
            type="file"
            name="albumArt"
            accept="image/*"
            className="p-2 mb-4 bg-cyan-800 rounded-lg w-full"
            onChange={handleAlbumArtChange}
          />

          {/* Tracks Input */}
          <label className="block mb-2 text-lg">Replace or Add New Tracks (MP3)</label>
          <input
            type="file"
            name="tracks"
            accept="audio/*"
            multiple
            className="p-2 mb-4 bg-cyan-800 rounded-lg w-full"
            onChange={handleTrackChange}
          />

          {/* Existing Tracks */}
          {trackDetails.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Existing Tracks</h3>
              {trackDetails.map((track, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    className="p-2 bg-cyan-800 rounded-lg text-white w-full"
                    value={track.trackName}
                    readOnly
                  />
                  <input
                    type="text"
                    className="p-2 bg-cyan-800 rounded-lg text-white w-full"
                    placeholder="Track Label"
                    value={track.trackLabel}
                    onChange={(e) => handleTrackLabelChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleSaveChanges}
            className="py-3 px-6 bg-green-500 rounded-lg hover:bg-green-600 transition duration-200 text-white mr-2"
          >
            Save Changes
          </button>
          <button
            onClick={() => setEditingAlbum(null)}
            className="py-3 px-6 bg-gray-500 rounded-lg hover:bg-gray-600 transition duration-200 text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Albums Table */}
      <table className="min-w-full bg-cyan-600 text-white rounded-lg shadow-lg overflow-hidden">
        <thead className="bg-cyan-700">
          <tr>
            <th className="py-3 px-6 text-left">Album Name</th>
            <th className="py-3 px-6 text-left">Album Year</th>
            <th className="py-3 px-6 text-left">Album Art</th>
            <th className="py-3 px-6 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {albums.map((album) => (
            <tr key={album.albumId} className="border-b border-cyan-500 hover:bg-cyan-700">
              <td className="py-3 px-6">{album.albumName}</td>
              <td className="py-3 px-6">{album.albumYear}</td>
              <td className="py-3 px-6">
                <img
                  src={album.albumArtUrl}
                  alt={album.albumName}
                  className="w-16 h-16 object-cover rounded-full"
                />
              </td>
              <td className="py-3 px-6 flex items-center justify-around">
                <button
                  onClick={() => handleEditAlbum(album)}
                  className="text-blue-400 hover:text-blue-500 mr-4"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteAlbum(album.albumId)}
                  className="text-red-400 hover:text-red-500"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {uploadStatus && <p className="mt-4 text-green-500">{uploadStatus}</p>}
    </div>
  );
};

export default EditAlbums;
