import React, { useContext, useReducer } from 'react';
import axios from 'axios';
import { Play, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { UserContext } from '../context/Usercontex';
import { DeleteAleart } from './DeleteAleart';
import EditTopicModal from './TopicModal/EditTopicModal';
import config from '../config/config';
// Action types
const TOGGLE_ACTIONS = 'TOGGLE_ACTIONS';
const OPEN_DELETE_CONFIRMATION = 'OPEN_DELETE_CONFIRMATION';
const CLOSE_DELETE_CONFIRMATION = 'CLOSE_DELETE_CONFIRMATION';
const START_DELETING = 'START_DELETING';
const FINISH_DELETING = 'FINISH_DELETING';
const OPEN_EDIT_CONFIRMATION = 'OPEN_EDIT_CONFIRMATION';
const CLOSE_EDIT_CONFIRMATION = 'CLOSE_EDIT_CONFIRMATION';
const START_EDITING = 'START_EDITING';
const FINISH_EDITING = 'FINISH_EDITING';

// Reducer function
const reducer = (state, action) => {
    switch (action.type) {
        case TOGGLE_ACTIONS:
            return { ...state, showActions: !state.showActions };
        case OPEN_DELETE_CONFIRMATION:
            return { ...state, showDeleteAlert: true, showActions: false };
        case CLOSE_DELETE_CONFIRMATION:
            return { ...state, showDeleteAlert: false };
        case START_DELETING:
            return { ...state, isDeleting: true };
        case FINISH_DELETING:
            return {
                ...state,
                isDeleting: false,
                showDeleteAlert: false,
                showActions: false
            };
        case OPEN_EDIT_CONFIRMATION:
            return { ...state, showEditAlert: true, showActions: false };
        case CLOSE_EDIT_CONFIRMATION:
            return { ...state, showEditAlert: false };
        case START_EDITING:
            return { ...state, isEditing: true };
        case FINISH_EDITING:
            return {
                ...state,
                isEditing: false,
                showEditAlert: false,
                showActions: false
            };
        default:
            return state;
    }
};

const PlaylistItem = ({ lecture, isActive, onClick, onLectureDeleted, onLectureEdited }) => {
    const { user } = useContext(UserContext);
    const [state, dispatch] = useReducer(reducer, {
        showActions: false,
        showDeleteAlert: false,
        showEditAlert: false,
        isDeleting: false,
        isEditing: false,
    });

    const toggleActions = (e) => {
        e.stopPropagation();
        dispatch({ type: TOGGLE_ACTIONS });
    };

    const openDeleteConfirmation = (e) => {
        e.stopPropagation();
        dispatch({ type: OPEN_DELETE_CONFIRMATION });
    };

    const openEditConfirmation = (e) => {
        e.stopPropagation();
        dispatch({ type: OPEN_EDIT_CONFIRMATION });
    };

    const handleDeleteConfirm = async () => {
        dispatch({ type: START_DELETING });
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/lectures/${lecture._id}`);
            if (response.data.message === "Lecture deleted") {
                onLectureDeleted(lecture._id);
            }
        } catch (error) {
            console.error("Error deleting lecture:", error);
        } finally {
            dispatch({ type: FINISH_DELETING });
        }
    };

    const handleEditConfirm = () => {
        dispatch({ type: START_EDITING });
    };

    const handleDeleteCancel = () => {
        dispatch({ type: CLOSE_DELETE_CONFIRMATION });
    };

    const handleEditCancel = () => {
        dispatch({ type: CLOSE_EDIT_CONFIRMATION });
    };

    const getStatusBadge = () => {
        const status = lecture.processingStatus;
        if (!status || status === 'completed') return null;

        const statusConfig = {
            pending: { text: 'Uploading...', color: 'bg-yellow-100 text-yellow-800' },
            processing: { text: 'Processing...', color: 'bg-blue-100 text-blue-800' },
            failed: { text: 'Failed', color: 'bg-red-100 text-red-800' }
        };

        const config = statusConfig[status];
        if (!config) return null;

        return (
            <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                {config.text}
            </span>
        );
    };

    const isDisabled = lecture.processingStatus && lecture.processingStatus !== 'completed';

    return (
        <div
            className={`flex items-center justify-between space-x-2 p-2 ${
                isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
            } ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={isDisabled ? undefined : onClick}
        >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Play size={16} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
                <div className="flex flex-col flex-1 min-w-0">
                    <span className={`${isActive ? 'font-bold' : ''} truncate`}>{lecture.nameOfTopic}</span>
                    {getStatusBadge()}
                    {lecture.processingStatus === 'failed' && lecture.processingError && (
                        <span className="text-xs text-red-600 truncate">{lecture.processingError}</span>
                    )}
                </div>
            </div>

            {user.role === "teacher" && (
                <div className="relative">
                    <button
                        onClick={toggleActions}
                        className="p-1 rounded-full hover:bg-gray-200"
                        aria-label="More options"
                    >
                        <MoreHorizontal className="text-gray-600" size={20} />
                    </button>

                    {state.showActions && (
                        <div className="absolute right-0 mt-2 w-28 bg-white shadow-md rounded-md z-10">
                            <button
                                onClick={openEditConfirmation}
                                className="flex items-center p-2 w-full hover:bg-green-100 text-green-600"
                            >
                                <Edit3 size={16} className="mr-2" />
                                Edit
                            </button>
                            <button
                                onClick={openDeleteConfirmation}
                                className="flex items-center p-2 w-full hover:bg-red-100 text-red-600"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}

            <DeleteAleart
                isOpen={state.showDeleteAlert}
                onClose={handleDeleteCancel}
                onDelete={handleDeleteConfirm}
            />
            <EditTopicModal
                isOpen={state.showEditAlert}
                lecture={lecture}
                onClose={handleEditCancel}
                onLectureEdited={onLectureEdited}
            />
            {state.isDeleting && <span>Deleting...</span>}
        </div>
    );
};

export default PlaylistItem;
