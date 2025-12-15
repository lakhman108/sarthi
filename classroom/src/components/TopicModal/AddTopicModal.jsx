import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import axios from 'axios';
import ModalWrapper from './ModalWrapper';
import TopicNameInput from './TopicNameInput';
import FileInput from './FileInput';
import UploadProgress from './UploadProgress';
import ErrorMessage from './ErrorMessage';
import ModalActions from './ModalActions';
import config from '../../config/config';
const AddTopicModal = ({ isOpen, onClose, courseId, onTopicAdded }) => {
    const [topicName, setTopicName] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const uploadVideoUrl = `${process.env.REACT_APP_API_URL}/api/upload`;
    const createLectureUrl = `${process.env.REACT_APP_API_URL}/api/lectures`;

    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 150 * 1024 * 1024) { // 150MB limit
                setError('File size exceeds the 150MB limit.');
                setFile(null);
                setFileName('');
                e.target.value = null; // Reset input
                return;
            }
            setError('');
            setFile(selectedFile);
            setFileName(selectedFile.name);
        } else {
            setFile(null);
            setFileName('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setError('');
        setUploadProgress(0);

        try {
            if (!file || !topicName) {
                setError('Please provide both a topic name and a video file.');
                return;
            }

            const formData = new FormData();
            formData.append('uploadedFile', file);
            formData.append('courseId', courseId);
            formData.append('nameOfTopic', topicName);

            const responseUpload = await axios.post(uploadVideoUrl, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            // Response now contains lectureId, jobId, and processingStatus
            console.log('Upload response:', responseUpload.data);

            // Close modal immediately after upload response
            onTopicAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || err.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper onClose={onClose} title="Add New Topic">
            <form onSubmit={handleSubmit} className="space-y-4">
                <TopicNameInput value={topicName} onChange={setTopicName} />
                <FileInput onChange={handleFileChange} fileName={fileName} />
                <ErrorMessage message={error} />
                <UploadProgress isUploading={isUploading} progress={uploadProgress} />
                <ModalActions onClose={onClose} isUploading={isUploading} />
            </form>
        </ModalWrapper>
    );
};

export default AddTopicModal;
