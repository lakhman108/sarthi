import React, { useState, useContext } from 'react';
import useFetch from '../utils/useFetch';

const AddTopicModal = ({ isOpen, onClose, onTopicAdded }) => {
  const [topicName, setTopicName] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const uploadVideoUrl = 'http://localhost:3000/api/upload';
  const createLectureUrl = 'http://localhost:3000/api/lectures';

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setError('');

    try {
      if (!file || !topicName) {
        setError('Please provide both a topic name and a video file.');
        return;
      }

      // Create formData for file upload
      const formData = new FormData();
      formData.append('uploadedFile', file);

      // Use fetch directly here
      const responseUpload = await fetch(uploadVideoUrl, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await responseUpload.json();

      if (!responseUpload.ok) throw new Error('Video upload failed');

      const { masterPlaylist } = uploadData;
console.log(masterPlaylist)
      // Prepare lecture data
      const lectureData = {
        courseId: "66d9767e3f648d42f8ed534e", // Replace with dynamic value if needed
        nameOfTopic: topicName,
        videoLink: masterPlaylist,
      };

      // Use fetch directly here
      const responseLecture = await fetch(createLectureUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lectureData),
      });
      const lectureDataResponse = await responseLecture.json();

      if (!responseLecture.ok) throw new Error('Failed to create lecture');



    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New Topic</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4"  encType="multipart/form-data">
          <div>
            <label htmlFor="topicName" className="block text-sm font-medium text-gray-700">
              Topic Name
            </label>
            <input
              type="text"
              id="topicName"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700">
              Video File
            </label>
            <input
              type="file"
              id="video"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : 'Add Topic'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTopicModal;
