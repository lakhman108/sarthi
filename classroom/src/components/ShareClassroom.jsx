import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
const ShareClassroom = ({ inviteCode }) => {
  const [showCopied, setShowCopied] = useState(false);
  const shareUrl = `${window.location.origin}/join/${inviteCode}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Share Classroom</h3>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 p-2 border rounded bg-gray-50"
          />
          <button
            onClick={copyLink}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>

        {showCopied && (
          <div className="p-3 mb-2 bg-green-50 border border-green-300 rounded text-green-800">
            Link copied to clipboard!
          </div>
        )}
      </div>

      <div className="flex flex-col items-center">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <QRCodeCanvas

            value={shareUrl}
            size={200}
            className="mx-auto"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Scan to join the classroom
        </p>
        <p className="mt-1 font-mono text-lg">
          {inviteCode}
        </p>
      </div>
    </div>
  );
};

export default ShareClassroom;
