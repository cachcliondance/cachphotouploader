import React, { useEffect, useState } from "react";
import "../styles.css";

interface UploadedFile {
  id: string; // Unique ID from the server
  url: string; // Preview URL
}

const FileUploader = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch existing uploaded files when the component mounts
    const fetchUploadedFiles = async () => {
      try {
        const response = await fetch("https://www.cachcliondragon.org/api/uploads");
        if (!response.ok) {
          throw new Error("Failed to fetch uploaded files.");
        }

        const data = await response.json(); // Expecting { files: [...] }
        console.log(data);
        setUploadedFiles(data.files); // Set the uploaded files in state
      } catch (error) {
        console.error("Error fetching uploaded files:", error);
        setMessage("Failed to load existing gallery.");
      }
    };

    fetchUploadedFiles();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      const urls = selectedFiles.map((file) => URL.createObjectURL(file));
      console.log(urls);
      setPreviewUrls(urls);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setMessage("Please select files before uploading.");
      return;
    }
  
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });
  
    try {
      const response = await fetch(
        "https://www.cachcliondragon.org/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to upload: ${response.statusText}`);
      }
  
      const data = await response.json(); // Expecting response like { message, files: [...] }
      const newUploadedFiles = data.files.map((file: any) => ({
        id: file.storedName,
        url: `https://www.cachcliondragon.org${file.url}`, // Prepend base URL
      }));
  
      setUploadedFiles((prev) => [...prev, ...newUploadedFiles]); // Append new files to the existing state
      setMessage("Upload successful!");
      setFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to upload photos. Please try again.");
    }
  };
  

  const clearSelection = () => {
    setFiles([]);
    setPreviewUrls([]);
  };

  const handleDeleteAll = async () => {
    try {
      const response = await fetch(
        "https://www.cachcliondragon.org/api/clear-uploads",
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear gallery.");
      }

      setUploadedFiles([]);
      setMessage("All photos deleted successfully.");
    } catch (error) {
      console.error("Error clearing photos:", error);
      setMessage("An error occurred.");
    }
  };

  // Delete specific photo
  const handleDeleteSpecificPhoto = async (id: string) => {
    try {
      const response = await fetch(
        `https://www.cachcliondragon.org/api/photo/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete photo.");
      }

      // Remove the deleted file from the uploadedFiles state
      const updatedUploadedFiles = uploadedFiles.filter(
        (file) => file.id !== id
      );
      setUploadedFiles(updatedUploadedFiles);
      setMessage("Photo deleted successfully.");
    } catch (error) {
      console.error("Error deleting photo:", error);
      setMessage("Failed to delete photo. Please try again.");
    }
  };

  return (
    <div className="upload-container">
      <h2 className="my-3">Upload Photos</h2>

      <input
        className="mb-3"
        type="file"
        onChange={handleFileChange}
        multiple
        accept="image/*"
      />

      <button
        className="mb-3"
        onClick={handleUpload}
        disabled={files.length === 0}
      >
        Upload
      </button>
      <button
        className="mb-3"
        onClick={clearSelection}
        disabled={files.length === 0}
      >
        Clear Selection
      </button>
      <button onClick={handleDeleteAll}>Delete All Photos in Gallery</button>

      {message && <p>{message}</p>}

      {previewUrls.length > 0 && (
        <div className="photo-preview-container">
          <h4>Selected Photos:</h4>
          <div className="photo-grid">
            {previewUrls.map((url, index) => (
              <div key={index} className="photo-item">
                <img
                  src={url}
                  alt={`Preview ${index}`}
                  className="photo-preview"
                />
                <button
                  className="delete-photo-button"
                  onClick={() => {
                    const updatedFiles = files.filter((_, i) => i !== index);
                    const updatedPreviewUrls = previewUrls.filter(
                      (_, i) => i !== index
                    );
                    setFiles(updatedFiles);
                    setPreviewUrls(updatedPreviewUrls);
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="photo-preview-container">
          <h4>Gallery:</h4>
          <div className="photo-grid">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="photo-item">
                <img
                  src={`https://www.cachcliondragon.org${file.url}`}
                  alt={`Photo ${file.id}`}
                  className="photo-preview"
                />
                <button
                  className="delete-photo-button"
                  onClick={() => handleDeleteSpecificPhoto(file.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
