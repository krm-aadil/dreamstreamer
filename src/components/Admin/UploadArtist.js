// File: UploadArtist.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadArtist = () => {
  const [artistDetails, setArtistDetails] = useState({
    artistName: '',
  });
  const [artistImage, setArtistImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setArtistDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setArtistImage(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!artistImage) {
      alert('Please select an artist image.');
      return;
    }

    try {
      // Step 1: Upload artist image to S3
      const imageResponse = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url', {
        fileName: artistImage.name,
        fileType: artistImage.type,
      });

      const artistImageUrl = imageResponse.data.uploadUrl.split('?')[0];
      await axios.put(imageResponse.data.uploadUrl, artistImage, {
        headers: {
          'Content-Type': artistImage.type,
        },
      });

      // Step 2: Send artist metadata to backend
      const artistMetadata = {
        artistId: artistDetails.artistName.replace(/\s/g, '').toLowerCase(),
        artistName: artistDetails.artistName,
        artistImageUrl,
      };

      await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists', artistMetadata);

      setUploadStatus('Artist uploaded successfully!');
    } catch (error) {
      console.error('Error uploading artist:', error);
      setUploadStatus('Failed to upload artist.');
    }
  };

  return (
    <div className="p-6 text-white flex-grow">
      <h2 className="text-xl font-bold mb-4">Upload New Artist</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          name="artistName"
          placeholder="Artist Name"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={artistDetails.artistName}
        />
        <input
          type="file"
          name="artistImage"
          accept="image/*"
          className="p-2 bg-gray-800 rounded"
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileUpload}
          className="py-2 px-4 bg-green-500 rounded hover:bg-green-600 transition duration-200"
        >
          Upload Artist
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
    </div>
  );
};

export default UploadArtist;
