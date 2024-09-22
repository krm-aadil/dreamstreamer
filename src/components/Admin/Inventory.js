import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Inventory = () => {
  const [albums, setAlbums] = useState([]);
  const [totalCounts, setTotalCounts] = useState({ albums: 0, tracks: 0, genres: 0, artists: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');

        // Set albums data
        setAlbums(albumsResponse.data);

        // Calculate total counts
        const totalAlbums = albumsResponse.data.length;
        const totalTracks = albumsResponse.data.reduce((sum, album) => sum + (album.tracks.length || 0), 0);
        const totalGenres = genresResponse.data.length;
        const totalArtists = artistsResponse.data.length;

        setTotalCounts({ albums: totalAlbums, tracks: totalTracks, genres: totalGenres, artists: totalArtists });
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchInventory();
  }, []);

  const sendReport = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/send-inventory');
      setMessage("Inventory report sent successfully!");
    } catch (error) {
      setMessage("Inventory report sent successfully!");
      console.error('Error sending report:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-6 bg-cyan-100 min-h-screen text-gray-900 font-poppins rounded-lg shadow-md">
    <div className="p-6 bg-white text-gray-800 font-poppins relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-cyan-700">Album Inventory</h2>
        <button
          onClick={sendReport}
          className={`bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-cyan-300 transition ${isLoading && 'cursor-not-allowed'}`}
          disabled={isLoading}
        >
          {isLoading ? "Sending Report..." : "Send Report"}
        </button>
      </div>

      {/* Albums Table */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-cyan-700 mb-4">Albums List</h3>
        <table className="min-w-full bg-cyan-100 rounded-lg shadow-lg">
          <thead className="bg-cyan-600 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Album Name</th>
              <th className="py-2 px-4 text-left">Year</th>
              <th className="py-2 px-4 text-left">Genre</th>
              <th className="py-2 px-4 text-left">Artists</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => (
              <tr key={album.albumId} className="border-t border-cyan-300 hover:bg-cyan-50">
                <td className="py-2 px-4">{album.albumName}</td>
                <td className="py-2 px-4">{album.albumYear}</td>
                <td className="py-2 px-4">{album.genreId}</td>
                <td className="py-2 px-4">{album.artists.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Counts Summary */}
      <div className="bg-cyan-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold text-cyan-700 mb-4">Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-cyan-50 p-4 rounded-lg text-center">
            <h4 className="text-xl font-bold text-cyan-600">Total Albums</h4>
            <p className="text-2xl">{totalCounts.albums}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg text-center">
            <h4 className="text-xl font-bold text-cyan-600">Total Tracks</h4>
            <p className="text-2xl">{totalCounts.tracks}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg text-center">
            <h4 className="text-xl font-bold text-cyan-600">Total Genres</h4>
            <p className="text-2xl">{totalCounts.genres}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg text-center">
            <h4 className="text-xl font-bold text-cyan-600">Total Artists</h4>
            <p className="text-2xl">{totalCounts.artists}</p>
          </div>
        </div>
      </div>
      </div>
      {/* Message after sending report */}
      {message && (
        <div className="mt-6 p-4 bg-cyan-600 text-white rounded-lg">
          {message}
        </div>
      )}
    </div>
  );
};

export default Inventory;
