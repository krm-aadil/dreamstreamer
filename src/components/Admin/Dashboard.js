import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

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
        // Fetch albums, artists, genres, and tracks count
        const albumsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-albums');
        const artistsResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-artists');
        const genresResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/dreamstreamer-genres');
        const usersResponse = await axios.get('https://4kkivqmt2b.execute-api.us-east-1.amazonaws.com/prod/user-stats'); // Add your actual user stats API endpoint here
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

        // User analytics
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

        // Prepare album data for bar chart
        const albumChartData = albums.map((album) => ({
          name: album.albumName,
          tracks: album.tracks.length,
        }));

        // Prepare artist data for pie chart
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

  // Pie Chart for Gender Distribution
  const genderPieChartData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        label: 'Gender Distribution',
        data: [stats.maleUsers, stats.femaleUsers],
        backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  };

  // Bar Chart for Age Distribution
  const ageBarChartData = {
    labels: ['18-25', '26-35', '36-45', '46+'],
    datasets: [
      {
        label: 'Age Distribution',
        data: Object.values(stats.ageDistribution),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-white">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="p-4 bg-gray-800 text-white rounded shadow-md">
          <h3 className="text-xl font-semibold">Total Albums</h3>
          <p className="text-3xl">{stats.albums}</p>
        </div>
        <div className="p-4 bg-gray-800 text-white rounded shadow-md">
          <h3 className="text-xl font-semibold">Total Artists</h3>
          <p className="text-3xl">{stats.artists}</p>
        </div>
        <div className="p-4 bg-gray-800 text-white rounded shadow-md">
          <h3 className="text-xl font-semibold">Total Genres</h3>
          <p className="text-3xl">{stats.genres}</p>
        </div>
        <div className="p-4 bg-gray-800 text-white rounded shadow-md">
          <h3 className="text-xl font-semibold">Total Tracks</h3>
          <p className="text-3xl">{stats.tracks}</p>
        </div>
        <div className="p-4 bg-gray-800 text-white rounded shadow-md">
          <h3 className="text-xl font-semibold">Total Users</h3>
          <p className="text-3xl">{stats.users}</p>
        </div>
      </div>

      {/* Popular Track and Album */}
      {stats.mostPopularTrack && stats.mostPopularAlbum && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-800 text-white rounded shadow-md">
            <h3 className="text-xl font-semibold">Most Popular Track</h3>
            <p className="text-lg">Track Name: {stats.mostPopularTrack.trackName}</p>
            <p className="text-lg">Play Count: {stats.mostPopularTrack.playCount}</p>
            <audio controls src={stats.mostPopularTrack.trackUrl} className="mt-4 w-full" />
          </div>

          <div className="p-4 bg-gray-800 text-white rounded shadow-md">
            <h3 className="text-xl font-semibold">Most Popular Album</h3>
            <p className="text-lg">Album Name: {stats.mostPopularAlbum.albumName}</p>
            <img src={stats.mostPopularAlbum.albumArtUrl} alt="Album Art" className="w-full h-auto mt-4" />
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Number of Tracks per Album</h3>
          <Bar data={albumBarChartData} />
        </div>

        <div className="bg-gray-800 p-4 rounded shadow-md">
          <h3 className="text-xl font-semibold text-white mb-4">Artists Distribution</h3>
          <Pie data={artistPieChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
