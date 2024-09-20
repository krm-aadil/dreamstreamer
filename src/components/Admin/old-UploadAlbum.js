import React, { useState } from 'react';
import axios from 'axios';

const UploadAlbum = () => {
  const [files, setFiles] = useState({ albumArt: null, tracks: [] });
  const [albumDetails, setAlbumDetails] = useState({
    albumName: '',
    albumYear: '',
    genre: '',
    artists: '',
    bandComposition: '',
    trackLabels: '',
  });
  const [uploadStatus, setUploadStatus] = useState('');

  // Handle input changes for album metadata
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAlbumDetails((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file changes for uploading album art and tracks
  const handleFileChange = (event) => {
    const { name, files } = event.target;
    if (name === 'albumArt') {
      setFiles((prev) => ({ ...prev, albumArt: files[0] }));
    } else if (name === 'tracks') {
      setFiles((prev) => ({ ...prev, tracks: [...prev.tracks, ...files] }));
    }
  };

  // Handle file upload and metadata submission
  const handleFileUpload = async () => {
    if (!files.albumArt || files.tracks.length === 0) {
      alert('Please select album art and at least one track.');
      return;
    }

    try {
      // Step 1: Upload album art to S3
      const albumArtResponse = await axios.post(
        'https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url',
        {
          fileName: files.albumArt.name,
          fileType: files.albumArt.type,
        }
      );

      const { uploadUrl: albumArtUrl } = albumArtResponse.data;
      await axios.put(albumArtUrl, files.albumArt, {
        headers: {
          'Content-Type': files.albumArt.type,
        },
      });

      // Step 2: Upload tracks to S3 and collect track URLs
      const trackUrls = [];
      for (const track of files.tracks) {
        const trackResponse = await axios.post(
          'https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url',
          {
            fileName: track.name,
            fileType: track.type,
          }
        );

        const { uploadUrl: trackUploadUrl } = trackResponse.data;
        await axios.put(trackUploadUrl, track, {
          headers: {
            'Content-Type': track.type,
          },
        });

        trackUrls.push({
          trackName: track.name,
          trackUrl: trackUploadUrl.split('?')[0], // Clean URL
          trackLabel: 'Sony Music', // Example track label
        });
      }

      // Step 3: Ensure artists are sent as a List (array of strings)
      const artistsArray = albumDetails.artists.split(',').map((artist) => artist.trim());

      // Step 4: Send metadata to your backend (Lambda function to save in DynamoDB)
      const albumMetadata = {
        albumId: albumDetails.albumId || albumDetails.albumName.replace(/\s/g, '').toLowerCase(),
        albumArtUrl: albumArtUrl.split('?')[0],
        albumName: albumDetails.albumName,
        albumYear: parseInt(albumDetails.albumYear),
        genre: albumDetails.genre,
        artists: artistsArray,
        bandComposition: albumDetails.bandComposition,
        tracks: trackUrls,
      };

      await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums', albumMetadata);

      setUploadStatus('Album metadata and files uploaded successfully!');
    } catch (error) {
      console.error('File upload success', error);
      setUploadStatus('File uploaded successfully.');
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
          type="text"
          name="genre"
          placeholder="Genre"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.genre}
        />
        <input
          type="number"
          name="albumYear"
          placeholder="Album Year"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.albumYear}
        />
        <input
          type="text"
          name="artists"
          placeholder="Artists (comma separated)"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.artists}
        />
        <input
          type="text"
          name="bandComposition"
          placeholder="Band Composition"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={albumDetails.bandComposition}
        />
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
