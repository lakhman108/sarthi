import React, { useState } from 'react';
import { Loader } from 'lucide-react';
import axios from 'axios';
import ModalWrapper from './ModalWrapper';
import TopicNameInput from './TopicNameInput';
import FileInput from './FileInput';
import UploadProgress from './UploadProgress';
import ErrorMessage from './ErrorMessage';
import ModalActions from './ModalActions';

const AddTopicModal = ({ isOpen, onClose, courseId, onTopicAdded }) => {
    const [topicName, setTopicName] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');

    const uploadVideoUrl = 'https://superb-insight-production.up.railway.app/api/upload';
    const createLectureUrl = 'https://superb-insight-production.up.railway.app/api/lectures';

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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

            const responseUpload = await axios.post(uploadVideoUrl, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            const { masterPlaylist } = responseUpload.data;

            const lectureData = {
                courseId: courseId,
                nameOfTopic: topicName,
                videoLink: masterPlaylist,
            };

            await axios.post(createLectureUrl, lectureData);

            onTopicAdded();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper onClose={onClose} title="Add New Topic">
            <form onSubmit={handleSubmit} className="space-y-4">
                <TopicNameInput value={topicName} onChange={setTopicName} />
                <FileInput onChange={handleFileChange} />
                <ErrorMessage message={error} />
                <UploadProgress isUploading={isUploading} progress={uploadProgress} />
                <ModalActions onClose={onClose} isUploading={isUploading} />
            </form>
        </ModalWrapper>
    );
};

export default AddTopicModal;
