// File: UploadAlbum.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UploadAlbum = () => {
  const [files, setFiles] = useState({ albumArt: null, tracks: [] });
  const [albumDetails, setAlbumDetails] = useState({
    albumName: '',
    albumYear: '',
    genreId: '',
    selectedArtists: [],
  });
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    // Fetch artists and genres when the component mounts
    const fetchArtistsAndGenres = async () => {
      try {
        const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        setArtists(artistsResponse.data);
        setGenres(genresResponse.data);
      } catch (error) {
        console.error('Error fetching artists and genres:', error);
      }
    };

    fetchArtistsAndGenres();
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAlbumDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === 'albumArt') {
      setFiles((prev) => ({ ...prev, albumArt: files[0] }));
    } else if (name === 'tracks') {
      setFiles((prev) => ({ ...prev, tracks: [...prev.tracks, ...files] }));
    }
  };

  const handleArtistSelection = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions, (option) => option.value);
    setAlbumDetails((prev) => ({ ...prev, selectedArtists: selectedOptions }));
  };

  const handleFileUpload = async () => {
    if (!files.albumArt || files.tracks.length === 0) {
      alert('Please select album art and at least one track.');
      return;
    }

    try {
      // Step 1: Upload album art to S3
      const albumArtResponse = await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/uploading-s3', {
        fileName: files.albumArt.name,
        fileType: files.albumArt.type,
      });

      const albumArtUrl = albumArtResponse.data.uploadUrl.split('?')[0];
      await axios.put(albumArtResponse.data.uploadUrl, files.albumArt, {
        headers: {
          'Content-Type': files.albumArt.type,
        },
      });

      // Step 2: Upload tracks to S3
      const trackUrls = [];
      for (const track of files.tracks) {
        const trackResponse = await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/uploading-s3', {
          fileName: track.name,
          fileType: track.type,
        });

        const trackUrl = trackResponse.data.uploadUrl.split('?')[0];
        await axios.put(trackResponse.data.uploadUrl, track, {
          headers: {
            'Content-Type': track.type,
          },
        });

        trackUrls.push({
          trackName: track.name,
          trackUrl,
          trackLabel: 'Sony Music', // Example label
        });
      }

      // Step 3: Send album metadata to backend
      const albumMetadata = {
        albumId: albumDetails.albumName.replace(/\s/g, '').toLowerCase(),
        albumArtUrl,
        albumName: albumDetails.albumName,
        albumYear: parseInt(albumDetails.albumYear),
        genreId: albumDetails.genreId,
        artists: albumDetails.selectedArtists,
        tracks: trackUrls,
      };

      await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums', albumMetadata);

      setUploadStatus('Album uploaded successfully!');
    } catch (error) {
      console.error('Error uploading album:', error);
      setUploadStatus('Failed to upload album.');
    }
  };

  return (
    <div className="p-6 text-white flex-grow">
      <h2 className="text-xl font-bold mb-4">Upload New Album</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          name="albumName"
          placeholder="Album Name"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.albumName}
        />
        <input
          type="number"
          name="albumYear"
          placeholder="Album Year"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.albumYear}
        />
        <select
          name="genreId"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.genreId}
        >
          <option value="">Select Genre</option>
          {genres.map((genre) => (
            <option key={genre.genreId} value={genre.genreId}>
              {genre.genreName}
            </option>
          ))}
        </select>
        <select
          multiple
          className="p-2 bg-gray-800 rounded"
          onChange={handleArtistSelection}
          value={albumDetails.selectedArtists}
        >
          <option value="">Select Artist(s)</option>
          {artists.map((artist) => (
            <option key={artist.artistId} value={artist.artistId}>
              {artist.artistName}
            </option>
          ))}
        </select>
        <input
          type="file"
          name="albumArt"
          accept="image/*"
          className="p-2 bg-gray-800 rounded"
          onChange={handleFileChange}
        />
        <input
          type="file"
          name="tracks"
          accept="audio/*"
          multiple
          className="p-2 bg-gray-800 rounded"
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileUpload}
          className="py-2 px-4 bg-green-500 rounded hover:bg-green-600 transition duration-200"
        >
          Upload Album
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
    </div>
  );
};

export default UploadAlbum;
