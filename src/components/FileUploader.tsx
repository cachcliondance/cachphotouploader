import React, { useState } from 'react';
import '../styles.css';

const FileUploader = () => {
  const [files, setFiles] = useState<File[]>([]); // State to store multiple files
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // State for image previews
  const [message, setMessage] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files); // Convert FileList to array
      setFiles(selectedFiles); // Store files

      // Generate preview URLs for images
      const urls = selectedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls); // Store temporary URLs
      setMessage(null); // Clear any previous messages
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
      setFiles([]); // Clear files
      setPreviewUrls([]); // Clear previews
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Failed to upload photos. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await fetch("https://www.cachcliondragon.org/api/clear-uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to clear gallery.");
      }

      const data = await response.json();
      setMessage(data.message);
      setFiles([]);
      setPreviewUrls([]);
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
        accept="image/*" 
      />

      <button className='mb-3' onClick={handleUpload} disabled={files.length === 0}>
        Upload
      </button>
      <button onClick={handleDelete}>
        Delete all photos
      </button>

      {message && <p>{message}</p>}


      {previewUrls.length > 0 && (
        <div className="photo-preview-container">
          <h4>Photo Previews:</h4>
          <div className="photo-grid">
            {previewUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Preview ${index + 1}`}
                className="photo-preview"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
