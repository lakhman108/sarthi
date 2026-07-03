import React from 'react';

const TopicNameInput = ({ value, onChange }) => (
  <div className="mb-5">
    <label htmlFor="topicName" className="block text-sm font-medium text-claude-900 mb-2 font-body">
      Topic Name
    </label>
    <input
      type="text"
      id="topicName"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-white border border-claude-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-claude-400 focus:border-transparent transition-all placeholder:text-claude-500 font-body text-sm"
      placeholder="Add Your Topic Name"
      required
    />
  </div>
);

export default TopicNameInput;
