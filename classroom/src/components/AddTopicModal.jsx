import { Loader } from 'lucide-react';
import React, { useState } from 'react';

const AddTopicModal = ({ isOpen, onClose, courseId, onTopicAdded }) => {
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

      const formData = new FormData();
      formData.append('uploadedFile', file);

      const responseUpload = await fetch(uploadVideoUrl, {
        method: 'POST',
        body: formData,
      });
      const uploadData = await responseUpload.json();

      if (!responseUpload.ok) throw new Error('Video upload failed');

      const { masterPlaylist } = uploadData;

      const lectureData = {
        courseId: courseId,
        nameOfTopic: topicName,
        videoLink: masterPlaylist,
      };

      const responseLecture = await fetch(createLectureUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lectureData),
      });

      if (!responseLecture.ok) throw new Error('Failed to create lecture');
      onTopicAdded();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Topic</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-2xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="topicName" className="p-2 block text-xl font-medium  text-gray-700" >
              Topic Name
            </label>
            <input
              type="text"
              id="topicName"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="mt-1 p-2 block w-full rounded-md border-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Add Your Topic Name"
              required
            />
          </div>
          <div>
            <label htmlFor="video" className="block text-xl font-medium text-gray-700">
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
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
              required
            />
          </div>
          {error && <p className="text-red-500 text-xl">{error}</p>}
          {isUploading && <Loader />

          }
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTopicModal;
