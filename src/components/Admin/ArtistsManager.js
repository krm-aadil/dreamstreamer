import React, { useState } from 'react';
import ViewArtists from './ViewArtists';
import EditArtist from './EditArtist';

const ArtistsManager = () => {
  const [editingArtist, setEditingArtist] = useState(null);

  const handleEdit = (artist) => {
    setEditingArtist(artist);
  };

  const handleCloseEdit = () => {
    setEditingArtist(null);
  };

  return (
    <div className="p-6">
      {editingArtist ? (
        <EditArtist artist={editingArtist} onClose={handleCloseEdit} />
      ) : (
        <ViewArtists onEdit={handleEdit} />
      )}
    </div>
  );
};

export default ArtistsManager;
