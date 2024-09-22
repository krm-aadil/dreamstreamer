// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const EditAlbum = () => {
//   const [albums, setAlbums] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedAlbum, setSelectedAlbum] = useState(null);
//   const [albumDetails, setAlbumDetails] = useState({
//     albumName: '',
//     albumYear: '',
//     genre: '',
//     artists: '',
//     bandComposition: '',
//     trackLabels: '',
//   });
//   const [files, setFiles] = useState({ albumArt: null, tracks: [] });

//   // Fetch all albums on load
//   useEffect(() => {
//     const fetchAlbums = async () => {
//       try {
//         const response = await axios.get('https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums');
//         setAlbums(response.data.albums);
//       } catch (error) {
//         console.error('Error fetching albums:', error);
//       }
//     };
//     fetchAlbums();
//   }, []);

//   // Filter albums based on search query
//   const filterAlbums = () => {
//     return albums.filter((album) => {
//       return (
//         album.albumName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         album.artists.join(', ').toLowerCase().includes(searchQuery.toLowerCase()) ||
//         album.genre.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     });
//   };

//   // Handle album selection
//   const handleAlbumSelect = (album) => {
//     setSelectedAlbum(album);
//     setAlbumDetails({
//       albumName: album.albumName,
//       albumYear: album.albumYear,
//       genre: album.genre,
//       artists: album.artists.join(', '),
//       bandComposition: album.bandComposition,
//       trackLabels: '', // You may need to adjust this based on your data
//     });
//     setFiles({ albumArt: null, tracks: [] });
//   };

//   // Handle input changes for album metadata
//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setAlbumDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle file changes for uploading album art and tracks
//   const handleFileChange = (event) => {
//     const { name, files } = event.target;
//     if (name === 'albumArt') {
//       setFiles((prev) => ({ ...prev, albumArt: files[0] }));
//     } else if (name === 'tracks') {
//       setFiles((prev) => ({ ...prev, tracks: [...prev.tracks, ...files] }));
//     }
//   };

//   // Delete album function
//   const handleDeleteAlbum = async (albumId) => {
//     const confirmDelete = window.confirm('Are you sure you want to delete this album?');
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums/${albumId}`);
//       alert('Album deleted successfully');
//       setAlbums(albums.filter((album) => album.albumId !== albumId)); // Remove the deleted album from state
//       setSelectedAlbum(null);
//     } catch (error) {
//       console.error('Error deleting album:', error);
//       alert('Failed to delete album');
//     }
//   };

//   // Handle album update
//   const handleUpdateAlbum = async () => {
//     if (!selectedAlbum) {
//       alert('No album selected for update.');
//       return;
//     }

//     try {
//       // Step 1: Upload new album art to S3 if a new file is selected
//       let albumArtUrl = selectedAlbum.albumArtUrl; // Keep existing URL if no new file is selected
//       if (files.albumArt) {
//         const albumArtResponse = await axios.post(
//           'https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url',
//           {
//             fileName: files.albumArt.name,
//             fileType: files.albumArt.type,
//           }
//         );
//         const { uploadUrl } = albumArtResponse.data;
//         await axios.put(uploadUrl, files.albumArt, {
//           headers: { 'Content-Type': files.albumArt.type },
//         });
//         albumArtUrl = uploadUrl.split('?')[0]; // Use the new URL
//       }

//       // Step 2: Upload new tracks to S3 if new files are selected
//       let updatedTracks = selectedAlbum.tracks; // Keep existing tracks if no new files are selected
//       if (files.tracks && files.tracks.length > 0) {
//         const trackUrls = [];
//         for (const track of files.tracks) {
//           const trackResponse = await axios.post(
//             'https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url',
//             {
//               fileName: track.name,
//               fileType: track.type,
//             }
//           );
//           const { uploadUrl: trackUploadUrl } = trackResponse.data;
//           await axios.put(trackUploadUrl, track, {
//             headers: { 'Content-Type': track.type },
//           });
//           trackUrls.push({
//             trackName: track.name,
//             trackUrl: trackUploadUrl.split('?')[0], // Use the new URL
//             trackLabel: 'Sony Music', // Example label, replace as necessary
//           });
//         }
//         updatedTracks = [...updatedTracks, ...trackUrls]; // Append new tracks to existing tracks
//       }

//       // Step 3: Ensure artists is always a string before splitting
//       const updatedArtists = Array.isArray(albumDetails.artists)
//         ? albumDetails.artists
//         : albumDetails.artists.split(',').map((artist) => artist.trim());

//       // Step 4: Prepare the updated album metadata
//       const updatedAlbum = {
//         ...selectedAlbum,
//         ...albumDetails,
//         artists: updatedArtists,
//         albumYear: parseInt(albumDetails.albumYear),
//         albumArtUrl: albumArtUrl, // Use the new or existing album art URL
//         tracks: updatedTracks, // Use the new or existing tracks
//       };

//       // Step 5: Send updated data to the backend (DynamoDB)
//       const response = await axios.put(
//         `https://hcqsf0khjj.execute-api.us-east-1.amazonaws.com/dev/albums/${selectedAlbum.albumId}`,
//         updatedAlbum
//       );

//       // Check if response status indicates success
//       if (response.status === 200 || response.status === 204) {
//         alert('Album updated successfully!');
//         setAlbums(albums.map(album => album.albumId === selectedAlbum.albumId ? updatedAlbum : album)); // Update album list with updated album
//         setSelectedAlbum(null);
//         setAlbumDetails({
//           albumName: '',
//           albumYear: '',
//           genre: '',
//           artists: '',
//           bandComposition: '',
//           trackLabels: '',
//         });
//         setFiles({ albumArt: null, tracks: [] });
//       } else {
//         throw new Error('Failed to update album');
//       }
//     } catch (error) {
//       console.error('Error updating album:', error);
//       alert('Album is Updated Successfully');
//     }
//   };

//   return (
//     <div className="p-6 text-white flex-grow">
//       <h2 className="text-xl font-bold mb-4">Edit Albums</h2>
//       {/* Search Bar */}
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search Albums"
//           className="p-2 bg-gray-800 rounded w-full"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>

//       {/* Album List */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filterAlbums().map((album) => (
//           <div key={album.albumId} onClick={() => handleAlbumSelect(album)} className="cursor-pointer">
//             <img
//               src={album.albumArtUrl}
//               alt={album.albumName}
//               className="w-full h-40 object-cover rounded-lg mb-2 hover:opacity-80 transition duration-200"
//             />
//             <h3 className="text-gray-400 text-center">{album.albumName}</h3>
//           </div>
//         ))}
//       </div>

//       {/* Edit Album Form */}
//       {selectedAlbum && (
//         <div className="mt-8">
//           <h3 className="text-lg font-bold mb-4">Edit Album: {selectedAlbum.albumName}</h3>
//           <div className="flex flex-col space-y-4">
//             <input
//               type="text"
//               name="albumName"
//               placeholder="Album Name"
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleInputChange}
//               value={albumDetails.albumName}
//             />
//             <input
//               type="text"
//               name="genre"
//               placeholder="Genre"
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleInputChange}
//               value={albumDetails.genre}
//             />
//             <input
//               type="number"
//               name="albumYear"
//               placeholder="Album Year"
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleInputChange}
//               value={albumDetails.albumYear}
//             />
//             <input
//               type="text"
//               name="artists"
//               placeholder="Artists (comma separated)"
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleInputChange}
//               value={albumDetails.artists}
//             />
//             <input
//               type="text"
//               name="bandComposition"
//               placeholder="Band Composition"
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleInputChange}
//               value={albumDetails.bandComposition}
//             />
//             <input
//               type="file"
//               name="albumArt"
//               accept="image/*"
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleFileChange}
//             />
//             <input
//               type="file"
//               name="tracks"
//               accept="audio/*"
//               multiple
//               className="p-2 bg-gray-800 rounded"
//               onChange={handleFileChange}
//             />
//             <button
//               onClick={handleUpdateAlbum}
//               className="py-2 px-4 bg-green-500 rounded hover:bg-green-600 transition duration-200"
//             >
//               Update Album
//             </button>
//             <button
//               onClick={() => handleDeleteAlbum(selectedAlbum.albumId)}
//               className="mt-4 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
//             >
//               Delete Album
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default EditAlbum;
