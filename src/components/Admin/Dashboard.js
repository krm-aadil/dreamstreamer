import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement } from 'chart.js';
import { FaMusic, FaUsers, FaCompactDisc, FaChartLine, FaStar } from 'react-icons/fa';
import { Avatar } from '@mui/material';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [stats, setStats] = useState({
    albums: 0,
    artists: 0,
    genres: 0,
    tracks: 0,
    users: 0,
    maleUsers: 0,
    femaleUsers: 0,
    ageDistribution: { '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 },
    mostPopularTrack: null,
    mostPopularAlbum: null,
  });

  const [albumData, setAlbumData] = useState([]);
  const [artistData, setArtistData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        const usersResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/user-stats'); 
        const popularTrackResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/popular-track');

        const albums = albumsResponse.data;
        const artists = artistsResponse.data;
        const genres = genresResponse.data;
        const userStats = usersResponse.data;
        const popularTrackData = popularTrackResponse.data;

        let tracksCount = 0;
        albums.forEach((album) => {
          tracksCount += album.tracks.length;
        });

        const totalUsers = userStats.userCount;
        const maleUsers = userStats.users.filter(user => user.gender === 'male').length;
        const femaleUsers = userStats.users.filter(user => user.gender === 'female').length;

        const ageDistribution = {
          '18-25': 0,
          '26-35': 0,
          '36-45': 0,
          '46+': 0,
        };

        userStats.users.forEach((user) => {
          const birthdate = new Date(user.birthdate);
          const age = new Date().getFullYear() - birthdate.getFullYear();

          if (age >= 18 && age <= 25) ageDistribution['18-25']++;
          else if (age >= 26 && age <= 35) ageDistribution['26-35']++;
          else if (age >= 36 && age <= 45) ageDistribution['36-45']++;
          else if (age >= 46) ageDistribution['46+']++;
        });

        setStats({
          albums: albums.length,
          artists: artists.length,
          genres: genres.length,
          tracks: tracksCount,
          users: totalUsers,
          maleUsers,
          femaleUsers,
          ageDistribution,
          mostPopularTrack: popularTrackData.mostPopularTrack,
          mostPopularAlbum: popularTrackData.mostPopularAlbum,
        });

        const albumChartData = albums.map((album) => ({
          name: album.albumName,
          tracks: album.tracks.length,
        }));

        const artistChartData = artists.map((artist) => artist.artistName);

        setAlbumData(albumChartData);
        setArtistData(artistChartData);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Bar Chart for Albums and Number of Tracks
  const albumBarChartData = {
    labels: albumData.map((album) => album.name),
    datasets: [
      {
        label: 'Number of Tracks',
        data: albumData.map((album) => album.tracks),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Pie Chart for Number of Artists
  const artistPieChartData = {
    labels: artistData,
    datasets: [
      {
        label: 'Artists',
        data: new Array(artistData.length).fill(1), // Equal weight for all artists
        backgroundColor: artistData.map(
          () =>
            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, 0.6)`
        ),
      },
    ],
  };

  return (
    <div className="p-6 bg-cyan-100 min-h-screen">
      <h2 className="text-4xl font-bold text-cyan-800 mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg flex items-center space-x-4">
          <FaCompactDisc className="text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Albums</h3>
            <p className="text-3xl font-bold">{stats.albums}</p>
          </div>
        </div>
        <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg flex items-center space-x-4">
          <FaUsers className="text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Artists</h3>
            <p className="text-3xl font-bold">{stats.artists}</p>
          </div>
        </div>
        <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg flex items-center space-x-4">
          <FaMusic className="text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Genres</h3>
            <p className="text-3xl font-bold">{stats.genres}</p>
          </div>
        </div>
        <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg flex items-center space-x-4">
          <FaChartLine className="text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Tracks</h3>
            <p className="text-3xl font-bold">{stats.tracks}</p>
          </div>
        </div>
        <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg flex items-center space-x-4">
          <FaUsers className="text-4xl" />
          <div>
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
        </div>
      </div>

      {/* Popular Track and Album */}
      {stats.mostPopularTrack && stats.mostPopularAlbum && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Most Popular Track</h3>
            <p className="text-lg mt-2">Track Name: {stats.mostPopularTrack.trackName}</p>
            <p className="text-lg">Play Count: {stats.mostPopularTrack.playCount}</p>
            <audio controls src={stats.mostPopularTrack.trackUrl} className="mt-4 w-full" />
          </div>

          <div className="p-6 bg-cyan-600 text-white rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold">Most Popular Album</h3>
            <p className="text-lg mt-2">Album Name: {stats.mostPopularAlbum.albumName}</p>
            <Avatar
              src={stats.mostPopularAlbum.albumArtUrl}
              alt="Album Art"
              variant="rounded"
              sx={{ width: 128, height: 128 }}
              className="mt-4 mx-auto"
            />
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-cyan-600 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Number of Tracks per Album</h3>
          <Bar data={albumBarChartData} />
        </div>

        <div className="bg-cyan-600 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Artists Distribution</h3>
          <Pie data={artistPieChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
