import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { CircularProgress } from '@mui/material';

const UploadAlbum = () => {
  const [files, setFiles] = useState({ albumArt: null, tracks: [] });
  const [albumDetails, setAlbumDetails] = useState({
    albumName: '',
    albumYear: '',
    genreId: '',
    selectedArtists: [],
    bandComposition: '',
  });
  const [trackDetails, setTrackDetails] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [searchTerm, setSearchTerm] = useState('');

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
      const newTracks = Array.from(files).map((file) => ({
        trackFile: file,
        trackName: file.name,
        trackLabel: '',
      }));
      setFiles((prev) => ({ ...prev, tracks: [...prev.tracks, ...files] }));
      setTrackDetails((prev) => [...prev, ...newTracks]);
    }
  };

  const handleArtistSelection = (selectedOptions) => {
    const selectedArtists = selectedOptions.map(option => option.value);
    setAlbumDetails((prev) => ({ ...prev, selectedArtists }));
  };

  const handleTrackLabelChange = (index, value) => {
    const updatedTracks = [...trackDetails];
    updatedTracks[index].trackLabel = value;
    setTrackDetails(updatedTracks);
  };

  const handleFileUpload = async () => {
    if (!files.albumArt || files.tracks.length === 0) {
      alert('Please select album art and at least one track.');
      return;
    }

    setIsLoading(true); // Show loading spinner

    try {
      // Step 1: Upload album art to S3
      const albumArtResponse = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url', {
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
      for (let i = 0; i < files.tracks.length; i++) {
        const track = files.tracks[i];
        const trackDetailsEntry = trackDetails[i];

        const trackResponse = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url', {
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
          trackLabel: trackDetailsEntry.trackLabel || 'Default Label', // Default label if none provided
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
        bandComposition: albumDetails.bandComposition,
        tracks: trackUrls,
      };

      await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums', albumMetadata);

      setUploadStatus('Album uploaded successfully!');
    } catch (error) {
      console.error('Error uploading album:', error);
      setUploadStatus('Failed to upload album.');
    } finally {
      setIsLoading(false); // Hide loading spinner
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.artistName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const artistOptions = filteredArtists.map(artist => ({
    label: artist.artistName,
    value: artist.artistId,
  }));

  return (
    <div className="p-6 bg-cyan-100 min-h-screen text-gray-900 font-poppins rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-cyan-900 mb-4">Upload New Album</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          name="albumName"
          placeholder="Album Name"
          className="p-2 bg-white rounded-lg border border-gray-300"
          onChange={handleInputChange}
          value={albumDetails.albumName}
        />
        <input
          type="number"
          name="albumYear"
          placeholder="Album Year"
          className="p-2 bg-white rounded-lg border border-gray-300"
          onChange={handleInputChange}
          value={albumDetails.albumYear}
        />
        <select
          name="genreId"
          className="p-2 bg-white rounded-lg border border-gray-300"
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

        {/* Artist Selection with Search and Checkbox */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Select Artists</h3>
          <Select
            options={artistOptions}
            isMulti
            onChange={handleArtistSelection}
            className="text-black"
          />
        </div>

        <input
          type="text"
          name="bandComposition"
          placeholder="Band Composition"
          className="p-2 bg-white rounded-lg border border-gray-300"
          onChange={handleInputChange}
          value={albumDetails.bandComposition}
        />

        {/* Album Art Input */}
        <div>
          <label className="block mb-2 text-cyan-700 font-semibold">Album Art (Image)</label>
          <input
            type="file"
            name="albumArt"
            accept="image/*"
            className="p-2 bg-white rounded-lg border border-gray-300"
            onChange={handleFileChange}
          />
        </div>

        {/* Track Input */}
        <div>
          <label className="block mb-2 text-cyan-700 font-semibold">Tracks (MP3 Files)</label>
          <input
            type="file"
            name="tracks"
            accept="audio/*"
            multiple
            className="p-2 bg-white rounded-lg border border-gray-300"
            onChange={handleFileChange}
          />
        </div>

        {/* Track Details Input */}
        {trackDetails.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-cyan-700">Track Details</h3>
            {trackDetails.map((track, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="p-2 bg-white rounded-lg border border-gray-300 w-full"
                  value={track.trackName}
                  readOnly
                />
                <input
                  type="text"
                  className="p-2 bg-white rounded-lg border border-gray-300 w-full"
                  placeholder="Track Label"
                  value={track.trackLabel}
                  onChange={(e) => handleTrackLabelChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleFileUpload}
          className="py-2 px-4 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition duration-200 flex items-center justify-center"
        >
          {isLoading ? <CircularProgress size={24} className="text-white mr-2" /> : 'Upload Album'}
        </button>
        {uploadStatus && <p className="mt-4 text-lg">{uploadStatus}</p>}
      </div>
    </div>
  );
};

export default UploadAlbum;
