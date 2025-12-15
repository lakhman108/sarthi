import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return <p className="text-red-500 text-xl">{message}</p>;
};

export default ErrorMessage;
