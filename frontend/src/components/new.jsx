import React, { useEffect, useReducer, useRef } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeUp, faVolumeMute, faExpand, faCompress, faRedo } from '@fortawesome/free-solid-svg-icons';

// Updated initial state
const initialState = {
  isPlaying: false,
  isMuted: false,
  isFullscreen: false,
  currentTime: 0,
  duration: 0,
  quality: '-1',
  showControls: true,
  hasEnded: false,
};

// Updated reducer
const reducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      return initialState;
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullscreen: !state.isFullscreen };
    case 'UPDATE_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_QUALITY':
      return { ...state, quality: action.payload };
    case 'SHOW_CONTROLS':
      return { ...state, showControls: true };
    case 'HIDE_CONTROLS':
      return { ...state, showControls: false };
    case 'VIDEO_ENDED':
      return { ...state, hasEnded: true, isPlaying: false, showControls: true };
    case 'REPLAY':
      return { ...state, hasEnded: false, isPlaying: true };
    default:
      return state;
  }
};

// Main component updates
const VideoPlayer = ({ videoLink }) => {
  // ... existing code ...

  useEffect(() => {
    dispatch({ type: 'RESET' });
    const video = videoRef.current;

    const setupHls = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
          debug: false,
          enableWorker: true,
        });
        hlsRef.current = hls;

        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          hls.loadSource(urllink);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = urllink;
      }
    };

    setupHls();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoLink]);

  useEffect(() => {
    const video = videoRef.current;
    const handleEnded = () => dispatch({ type: 'VIDEO_ENDED' });

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  const handleReplay = () => {
    const video = videoRef.current;
    video.currentTime = 0;
    video.play();
    dispatch({ type: 'REPLAY' });
  };

  return (
    <div className="bg-black flex justify-center items-center">
      <div className="video-container relative w-full max-w-4xl aspect-video" onMouseMove={handleMouseMove}>
        <video ref={videoRef} className="w-full h-full" />
        {state.hasEnded && (
          <button
            onClick={handleReplay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-4 hover:bg-opacity-75 focus:outline-none"
          >
            <FontAwesomeIcon icon={faRedo} size="2x" />
          </button>
        )}
        <Controls
          state={state}
          togglePlayPause={togglePlayPause}
          toggleMute={toggleMute}
          toggleFullscreen={toggleFullscreen}
          seek={seek}
          handleQualityChange={handleQualityChange}
        />
      </div>
    </div>
  );
};

// ... rest of the code remains the same ...
