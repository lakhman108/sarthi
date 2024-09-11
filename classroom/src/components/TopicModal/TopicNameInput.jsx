import React from 'react';

const TopicNameInput = ({ value, onChange }) => (
  <div>
    <label htmlFor="topicName" className="p-2 block text-xl font-medium text-gray-700">
      Topic Name
    </label>
    <input
      type="text"
      id="topicName"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 p-2 block w-full rounded-md border-black shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      placeholder="Add Your Topic Name"
      required
    />
  </div>
);

export default TopicNameInput;
