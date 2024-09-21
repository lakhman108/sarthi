import React, { useState } from 'react';
import axios from 'axios';
import ModalWrapper from './ModalWrapper';
import TopicNameInput from './TopicNameInput';
import FileInput from './FileInput';
import UploadProgress from './UploadProgress';
import ErrorMessage from './ErrorMessage';
import ModalActions from './ModalActions';

const EditTopicModal = ({ isOpen, onClose, lecture, onLectureEdited }) => {
    //console.log(lecture);
    const [topicName, setTopicName] = useState(lecture.nameOfTopic);
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [videoAction, setVideoAction] = useState('keep'); // 'keep', 'delete', or 'update'

    const uploadVideoUrl = 'http://localhost:3000/api/upload';
    const updateLectureUrl = 'http://localhost:3000/api/lecture';

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setVideoAction('update');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            if (!topicName) {
                setError('Please provide a topic name.');
                return;
            }

            let videoLink = lecture.videoLink;

            if (videoAction === 'delete') {
                videoLink = null;
            } else if (videoAction === 'update' && file) {
                const formData = new FormData();
                formData.append('uploadedFile', file);
                const responseUpload = await axios.post(uploadVideoUrl, formData, {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(percentCompleted);
                    },
                });
                videoLink = responseUpload.data.masterPlaylist;
            }

            const lectureData = {
                nameOfTopic: topicName,
                videoLink: videoLink,
            };

            await axios.patch(`http://localhost:3000/api/lectures/${lecture._id}/update`, lectureData);
            onLectureEdited();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper onClose={onClose} title="Edit Topic">
            <form onSubmit={handleSubmit} className="space-y-4">
                <TopicNameInput value={topicName} onChange={setTopicName} />
                <div>
                    <p className="text-sm text-gray-500 mb-2">Current video: {lecture.videoLink.split('/').pop() || 'HLS Stream'}</p>
                    <div className="flex items-center space-x-4 mb-2">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="videoAction"
                                value="keep"
                                checked={videoAction === 'keep'}
                                onChange={() => setVideoAction('keep')}
                            />
                            <span className="ml-2">Keep current video</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="videoAction"
                                value="delete"
                                checked={videoAction === 'delete'}
                                onChange={() => setVideoAction('delete')}
                            />
                            <span className="ml-2">Delete video</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio"
                                name="videoAction"
                                value="update"
                                checked={videoAction === 'update'}
                                onChange={() => setVideoAction('update')}
                            />
                            <span className="ml-2">Update video</span>
                        </label>
                    </div>
                    {videoAction === 'update' && (
                        <FileInput onChange={handleFileChange} required={true} />
                    )}
                </div>
                <ErrorMessage message={error} />
                <UploadProgress isUploading={isUploading} progress={uploadProgress} />
                <ModalActions onClose={onClose} isUploading={isUploading} submitText="Update Topic" />
            </form>
        </ModalWrapper>
    );
};

export default EditTopicModal;
