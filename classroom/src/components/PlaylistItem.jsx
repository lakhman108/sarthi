import React, { useState, useContext } from 'react';
import { Play, MoreHorizontal, Edit3, Trash2 } from 'lucide-react'; // Added ellipsis for more options
import { UserContext } from '../context/Usercontex';

const PlaylistItem = ({ lecture, isActive, onClick, onEdit, onDelete }) => {
    const { user } = useContext(UserContext);
    const [showActions, setShowActions] = useState(false);

    const toggleActions = (e) => {
        e.stopPropagation(); // Prevents triggering the lecture click event
        setShowActions(!showActions);
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


                    {showActions && (
                        <div className="absolute right-0 mt-2 w-28 bg-white shadow-md rounded-md z-10">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="flex items-center p-2 w-full hover:bg-green-100 text-green-600"
                            >
                                <Edit3 size={16} className="mr-2" />
                                Edit
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="flex items-center p-2 w-full hover:bg-red-100 text-red-600"
                            >
                                <Trash2 size={16} className="mr-2" />
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PlaylistItem;
