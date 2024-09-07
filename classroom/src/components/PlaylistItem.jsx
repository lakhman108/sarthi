import React from 'react';
import { Play } from 'lucide-react';

const PlaylistItem = ({ lecture, isActive, onClick }) => (
  <div
    className={`flex items-center space-x-2 p-2 cursor-pointer ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
    onClick={onClick}
  >
    <Play size={16} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
    <span className={isActive ? 'font-bold' : ''}>{lecture.nameOfTopic}</span>
  </div>
);

export default PlaylistItem;
