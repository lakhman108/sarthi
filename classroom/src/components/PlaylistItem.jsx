import React, { useContext, useEffect, useReducer } from 'react';
import { Play, MoreHorizontal, Edit3, Trash2 } from 'lucide-react';
import { UserContext } from '../context/Usercontex';
import { DeleteAleart } from './DeleteAleart';
import useFetch from '../utils/useFetch';

// Action types
const TOGGLE_ACTIONS = 'TOGGLE_ACTIONS';
const OPEN_DELETE_CONFIRMATION = 'OPEN_DELETE_CONFIRMATION';
const CLOSE_DELETE_CONFIRMATION = 'CLOSE_DELETE_CONFIRMATION';
const START_DELETING = 'START_DELETING';
const FINISH_DELETING = 'FINISH_DELETING';

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
    default:
      return state;
  }
};

const PlaylistItem = ({ lecture, isActive, onClick, onLectureDeleted }) => {
  const { user } = useContext(UserContext);
  const [state, dispatch] = useReducer(reducer, {
    showActions: false,
    showDeleteAlert: false,
    isDeleting: false,
  });

  const deleteOptions = {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const deleteUrl = state.isDeleting ? `http://localhost:3000/api/lectures/${lecture._id}` : null;
  const deleteResponse = useFetch(deleteUrl, deleteOptions);

  useEffect(() => {
    if (deleteResponse && deleteResponse.message === "Lecture deleted") {
      onLectureDeleted(lecture._id);
      dispatch({ type: FINISH_DELETING });
    }
  }, [deleteResponse, onLectureDeleted, lecture._id]);

  const toggleActions = (e) => {
    e.stopPropagation();
    dispatch({ type: TOGGLE_ACTIONS });
  };

  const openDeleteConfirmation = (e) => {
    e.stopPropagation();
    dispatch({ type: OPEN_DELETE_CONFIRMATION });
  };

  const handleDeleteConfirm = () => {
    dispatch({ type: START_DELETING });
  };

  const handleDeleteCancel = () => {
    dispatch({ type: CLOSE_DELETE_CONFIRMATION });
  };

  return (
    <div
      className={`flex items-center justify-between space-x-2 p-2 cursor-pointer ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        <Play size={16} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
        <span className={isActive ? 'font-bold' : ''}>{lecture.nameOfTopic}</span>
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
                onClick={(e) => { e.stopPropagation(); /* Add edit functionality */ }}
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

      {state.isDeleting && <span>Deleting...</span>}
    </div>
  );
};

export default PlaylistItem;
