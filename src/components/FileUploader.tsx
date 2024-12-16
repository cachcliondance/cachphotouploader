import React, { useState } from 'react';
import '../styles.css';

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setMessage(null); // Clear any previous messages
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch("https://www.cachcliondragon.org/api/upload", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload: ${response.statusText}`);
      }

      const data = await response.json();
      setMessage('Upload successful!');
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload photo. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("https://www.cachcliondragon.org/api/clear-uploads", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear gallery.");
      }

      const data = await response.json();
      setMessage(data.message); 
    } catch (error) {
      console.error("Error clearing photos:", error);
      setMessage("An error occurred.");
    }
  };

  return (
    <div className='upload-container'>
      <h2 className='my-3'>Upload a Photo</h2>
      <input className='mb-3' type="file" onChange={handleFileChange} />
      <button className='mb-3' onClick={handleUpload} disabled={!file}>
        Upload
      </button>
      <button onClick={handleDelete}>
        Delete all photos
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUploader;
