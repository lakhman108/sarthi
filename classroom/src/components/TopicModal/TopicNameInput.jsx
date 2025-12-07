import React from 'react';

const TopicNameInput = ({ value, onChange }) => (
  <div className="mb-6">
    <label htmlFor="topicName" className="block text-sm font-semibold text-gray-700 mb-2 font-body">
      Topic Name
    </label>
    <input
      type="text"
      id="topicName"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sarthi-purple-500 focus:border-transparent transition-all placeholder:text-gray-400 font-body"
      placeholder="Add Your Topic Name"
      required
    />
  </div>
);

export default TopicNameInput;
