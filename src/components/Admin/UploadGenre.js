// File: UploadGenre.js
import React, { useState } from 'react';
import axios from 'axios';

const UploadGenre = () => {
  const [genreDetails, setGenreDetails] = useState({
    genreName: '',
  });
  const [genreImage, setGenreImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setGenreDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (event) => {
    setGenreImage(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!genreImage) {
      alert('Please select a genre image.');
      return;
    }

    try {
      // Step 1: Upload genre image to S3
      const imageResponse = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url', {
        fileName: genreImage.name,
        fileType: genreImage.type,
      });

      const genreImageUrl = imageResponse.data.uploadUrl.split('?')[0];
      await axios.put(imageResponse.data.uploadUrl, genreImage, {
        headers: {
          'Content-Type': genreImage.type,
        },
      });

      // Step 2: Send genre metadata to backend
      const genreMetadata = {
        genreId: genreDetails.genreName.replace(/\s/g, '').toLowerCase(),
        genreName: genreDetails.genreName,
        genreImageUrl,
      };

      await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres', genreMetadata);

      setUploadStatus('Genre uploaded successfully!');
    } catch (error) {
      console.error('Error uploading genre:', error);
      setUploadStatus('Failed to upload genre.');
    }
  };

  return (
    <div className="p-6 text-white flex-grow">
      <h2 className="text-xl font-bold mb-4">Upload New Genre</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          name="genreName"
          placeholder="Genre Name"
          className="p-2 bg-gray-800 rounded"
          onChange={handleInputChange}
          value={genreDetails.genreName}
        />
        <input
          type="file"
          name="genreImage"
          accept="image/*"
          className="p-2 bg-gray-800 rounded"
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileUpload}
          className="py-2 px-4 bg-green-500 rounded hover:bg-green-600 transition duration-200"
        >
          Upload Genre
        </button>
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
    </div>
  );
};

export default UploadGenre;
