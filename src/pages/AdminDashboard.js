import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = ({ signOut }) => {
  const [mostPlayedAlbum, setMostPlayedAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [files, setFiles] = useState({ albumArt: null, tracks: [] });
  const [albumDetails, setAlbumDetails] = useState({
    albumName: '',
    albumYear: '',
    genre: 'Metal',
    artists: '',
    bandComposition: '',
    trackLabels: '',
  });
  const [filter, setFilter] = useState({ genre: '', albumName: '', artists: '', trackName: '' });
  const [stats, setStats] = useState({ totalAlbums: 0, totalTracks: 0 });
  const [uploadStatus, setUploadStatus] = useState('');

  const fetchAlbums2 = async () => {
    try {
      const response = await axios.get('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums');
      const parsedAlbums = response.data.albums.map((album) => ({
        albumId: album.albumId.S, // Use the string value directly
        albumArtUrl: album.albumArtUrl.S,
        albumName: album.albumName.S,
        albumYear: album.albumYear.N, // For numbers
        artists: album.artists.L.map((artist) => artist.S), // Extracting artist list
        bandComposition: album.bandComposition.S,
        genre: album.genre.S,
        lastPlayedTrack: album.lastPlayedTrack ? album.lastPlayedTrack.S : 'N/A', // Optional chaining
        playCount: album.playCount ? album.playCount.N : 0, // Optional chaining
        tracks: album.tracks.L.map((track) => ({
          trackName: track.M.trackName.S,
          trackLabel: track.M.trackLabel.S,
          trackUrl: track.M.trackUrl.S,
        })),
      }));
  
      setAlbums(parsedAlbums);
  
       // Calculate stats
       const totalTracks = parsedAlbums.reduce((acc, album) => acc + album.tracks.length, 0);
       setStats({ totalAlbums: parsedAlbums.length, totalTracks });
 
       // Calculate most played album
       const topAlbum = parsedAlbums.reduce((prev, current) => (prev.playCount > current.playCount ? prev : current), {});
       setMostPlayedAlbum(topAlbum);
     } catch (error) {
       console.error('Error fetching albums:', error);
     }
   };
  
  
  // Fetch all albums on load
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await axios.get('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums');
        setAlbums(response.data.albums);

        // Calculate stats
        const totalTracks = response.data.albums.reduce((acc, album) => acc + album.tracks.length, 0);
        setStats({ totalAlbums: response.data.albums.length, totalTracks });
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    fetchAlbums();
  }, []);




  // Filter albums based on user input
  const filterAlbums = () => {
    return albums.filter((album) => {
      return (
        (!filter.genre || album.genre.toLowerCase().includes(filter.genre.toLowerCase())) &&
        (!filter.albumName || album.albumName.toLowerCase().includes(filter.albumName.toLowerCase())) &&
        (!filter.artists || album.artists.join(', ').toLowerCase().includes(filter.artists.toLowerCase())) &&
        (!filter.trackName || album.tracks.some((track) => track.trackName.toLowerCase().includes(filter.trackName.toLowerCase())))
      );
    });
  };

  // Delete album function
  const handleDeleteAlbum = async (albumId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this album?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums/${albumId}`);
      alert('Album deleted successfully');
      setAlbums(albums.filter((album) => album.albumId !== albumId)); // Remove the deleted album from state
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Failed to delete album');
    }
  };

  // Show album details when clicked
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
  };

  // Handle album deletion from album detail view
  const handleDeleteSelectedAlbum = () => {
    if (selectedAlbum) {
      handleDeleteAlbum(selectedAlbum.albumId);
      setSelectedAlbum(null); // Clear the selected album after deletion
    }
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

  // Handle input changes for album metadata
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setAlbumDetails((prev) => ({ ...prev, [name]: value }));
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
        albumId: albumDetails.albumName.replace(/\s/g, '').toLowerCase(),
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

  const requestAnalyticsReport = async () => {
    try {
        const response = await axios.post('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/analytics-report');
        if (response.status === 200) {
            alert('Analytics report has been sent to your email.');
        }
    } catch (error) {
        console.error('Analytics report has been sent to your email:', error);
        alert('Analytics report has been sent to your email .');
    }
};


  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-between p-4 bg-gray-800">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={signOut}
          className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
        >
          Sign Out
        </button>
      </header>

      <button onClick={requestAnalyticsReport} className="py-2 px-4 bg-blue-500 rounded hover:bg-blue-600">
        Get Analytics Report
      </button>

      {/* Dashboard Stats */}
      <div className="p-6 flex justify-between">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-1/4 text-center">
          <h3 className="text-xl font-bold">Total Albums</h3>
          <p className="text-2xl">{stats.totalAlbums}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-1/4 text-center">
          <h3 className="text-xl font-bold">Total Tracks</h3>
          <p className="text-2xl">{stats.totalTracks}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-1/4 text-center">
          <h3 className="text-xl font-bold">Total Tracks</h3>
          <p className="text-2xl">{stats.totalTracks}</p>
        </div>
      </div>
      



      {/* Filters */}
      <div className="p-6 flex justify-between">
        <input
          type="text"
          name="genre"
          placeholder="Filter by Genre"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.genre}
          onChange={(e) => setFilter({ ...filter, genre: e.target.value })}
        />
        <input
          type="text"
          name="albumName"
          placeholder="Filter by Album Name"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.albumName}
          onChange={(e) => setFilter({ ...filter, albumName: e.target.value })}
        />
        <input
          type="text"
          name="artists"
          placeholder="Filter by Artists"
          className="p-2 bg-gray-800 rounded mr-4"
          value={filter.artists}
          onChange={(e) => setFilter({ ...filter, artists: e.target.value })}
        />
        <input
          type="text"
          name="trackName"
          placeholder="Filter by Track Name"
          className="p-2 bg-gray-800 rounded"
          value={filter.trackName}
          onChange={(e) => setFilter({ ...filter, trackName: e.target.value })}
        />
      </div>

      {/* File Upload and Album Metadata Section */}
      <div className="p-6">
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

      {/* Manage Albums Section */}
      <div className="p-6 flex-grow">
        <h2 className="text-xl font-bold mb-4">Manage Albums</h2>

        {/* Display Only Album Art Initially */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {filterAlbums().map((album) => (
    <div key={album.albumId} onClick={() => handleAlbumClick(album)} className="cursor-pointer">
      <img
        src={album.albumArtUrl}
        alt={album.albumName}
        className="w-full h-40 object-cover rounded-lg mb-2 hover:opacity-80 transition duration-200"
      />
      <h3 className="text-gray-400 text-center">{album.albumName}</h3>
      <p className="text-gray-400 text-center">Play Count: {album.playCount || 0}</p>
      <p className="text-gray-400 text-center">Last Played Track: {album.lastPlayedTrack || 'N/A'}</p>
    </div>
  ))}
</div>


        {/* Show Album Details When Clicked */}
        {selectedAlbum && (
          <div className="mt-8 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{selectedAlbum.albumName}</h3>
            <p className="text-gray-400">Genre: {selectedAlbum.genre}</p>
            <p className="text-gray-400">Year: {selectedAlbum.albumYear}</p>
            <p className="text-gray-400">Artists: {selectedAlbum.artists.join(', ')}</p>
            <img src={selectedAlbum.albumArtUrl} alt={selectedAlbum.albumName} className="w-40 h-40 mt-4 rounded-lg" />

            {/* Tracklist */}
            <div className="mt-4">
              <h4 className="text-lg font-bold mb-2">Tracks</h4>
              <ul className="space-y-2">
                {selectedAlbum.tracks.map((track, index) => (
                  <li key={index} className="bg-gray-700 p-3 rounded-lg">
                    <p className="font-semibold">{track.trackName}</p>
                    <p className="text-gray-400">Label: {track.trackLabel}</p>
                    <audio controls className="w-full mt-2">
                      <source src={track.trackUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </li>
                ))}
              </ul>
            </div>

            {/* Delete Album Button */}
            <button
              onClick={handleDeleteSelectedAlbum}
              className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
            >
              Delete Album
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
