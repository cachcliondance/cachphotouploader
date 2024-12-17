import React, { useState } from 'react';
import '../styles.css';

const FileUploader = () => {
  const [files, setFiles] = useState<File[]>([]); 
  const [message, setMessage] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files)); 
      setMessage(null);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select files before uploading.");
      return;
    }

    const formData = new FormData();

    // Append each file to the FormData
    files.forEach((file) => {
      formData.append(`photos`, file); 
    });

    try {
      const response = await fetch("https://www.cachcliondragon.org/api/upload", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload: ${response.statusText}`);
      }
      setMessage('Upload successful!');
      setFiles([]); 
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload photos. Please try again.');
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
      <h2 className='my-3'>Upload Photos</h2>
      <input
        className='mb-3'
        type="file"
        onChange={handleFileChange}
        multiple 
      />
      <button className='mb-3' onClick={handleUpload} disabled={files.length === 0}>
        Upload
      </button>
      <button onClick={handleDelete}>
        Delete all photos
      </button>
      {message && <p>{message}</p>}

      {files.length > 0 && (
        <div>
          <h4>Selected Files:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
