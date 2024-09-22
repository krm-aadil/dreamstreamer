import React, { useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material'; // Spinner component from Material UI

const UploadArtist = () => {
  const [artistDetails, setArtistDetails] = useState({
    artistName: '',
  });
  const [artistImage, setArtistImage] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false); // State for loading spinner

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
      setIsUploading(true); // Start the spinner
      setUploadStatus('');

      // Step 1: Upload artist image to S3
      const imageResponse = await axios.post(
        'https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url',
        {
          fileName: artistImage.name,
          fileType: artistImage.type,
        }
      );

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

      await axios.post(
        'https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists',
        artistMetadata
      );

      setUploadStatus('Artist uploaded successfully!');
    } catch (error) {
      console.error('Error uploading artist:', error);
      setUploadStatus('Failed to upload artist.');
    } finally {
      setIsUploading(false); // Stop the spinner
    }
  };

  return (
    <div className="p-6 bg-cyan-100 min-h-screen text-gray-10 font-poppins rounded-lg shadow-md">
    <div className="p-6 text-white flex-grow relative bg-gradient-to-br from-cyan-800 to-cyan-500 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-white">Upload New Artist</h2>
      <div className="flex flex-col space-y-4">
        <input
          type="text"
          name="artistName"
          placeholder="Artist Name"
          className="p-3 bg-cyan-100 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          onChange={handleInputChange}
          value={artistDetails.artistName}
        />
        <input
          type="file"
          name="artistImage"
          accept="image/*"
          className="p-3 bg-cyan-100  rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          onChange={handleFileChange}
        />
        <button
          onClick={handleFileUpload}
          className="py-2 px-4 bg-cyan-700 text-white rounded-lg hover:bg-cyan-800 transition duration-200 flex items-center justify-center"
        >
          {isUploading ? <CircularProgress color="inherit" size={24} /> : 'Upload Artist'}
        </button>
        {uploadStatus && (
          <p className={`text-lg mt-4 ${uploadStatus.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
            {uploadStatus}
          </p>
        )}
      </div>

      {/* Large Curvy Text at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center opacity-40 mb-6">
        
      </div>
    </div>
    </div>
  );
};

export default UploadArtist;
