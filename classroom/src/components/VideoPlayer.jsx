import React, { useEffect, useReducer, useRef } from 'react';
import Hls from 'hls.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeUp, faVolumeMute, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

// Utility functions
const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Initial state
const initialState = {
  isPlaying: false,
  isMuted: false,
  isFullscreen: false,
  currentTime: 0,
  duration: 0,
  quality: '-1',
  currentChapter: { title: '' },
  showControls: true,
};

// Reducer function
const reducer = (state, action) => {
  switch (action.type) {
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
    case 'SET_CHAPTER':
      return { ...state, currentChapter: action.payload };
    case 'SHOW_CONTROLS':
      return { ...state, showControls: true };
    case 'HIDE_CONTROLS':
      return { ...state, showControls: false };
    default:
      return state;
  }
};

// Main component
const VideoPlayer = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);



  useEffect(() => {
    const video = videoRef.current;
    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1 });
      hlsRef.current = hls;

      const manifestUrl = 'https://lakhmanparmar.s3.amazonaws.com/test/master.m3u8';
      hls.loadSource(manifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('Manifest parsed, levels available');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = 'https://lakhmanparmar.s3.amazonaws.com/test/master.m3u8';
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const handleTimeUpdate = () => {
      dispatch({ type: 'UPDATE_TIME', payload: video.currentTime });
      updateChapterTitle();
    };
    const handleLoadedMetadata = () => dispatch({ type: 'SET_DURATION', payload: video.duration });

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video.paused || video.ended) {
      video.play();
    } else {
      video.pause();
    }
    dispatch({ type: 'TOGGLE_PLAY' });
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!document.fullscreenElement) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    dispatch({ type: 'TOGGLE_FULLSCREEN' });
  };

  const seek = (e) => {
    const video = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const updateChapterTitle = () => {
    const currentTime = videoRef.current.currentTime;

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      dispatch({ type: 'HIDE_CONTROLS' });
    }, 3000);
  };

  const handleQualityChange = (e) => {
    const quality = e.target.value;
    if (hlsRef.current) {
      hlsRef.current.currentLevel = parseInt(quality);
    }
    dispatch({ type: 'SET_QUALITY', payload: quality });
  };

  const handleMouseMove = () => {
    dispatch({ type: 'SHOW_CONTROLS' });
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!state.isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'HIDE_CONTROLS' });
      }, 3000);
    }
  };

  return (
    <div className="bg-black flex justify-center items-center">
      <div className="video-container relative w-full max-w-4xl aspect-video" onMouseMove={handleMouseMove}>
        <video ref={videoRef} className="w-full h-full" />
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


const Controls = ({ state, togglePlayPause, toggleMute, toggleFullscreen, seek, handleQualityChange }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent flex flex-col items-stretch p-2 transition-opacity duration-300 ${state.showControls ? 'opacity-100' : 'opacity-0'}`}>
      <ProgressBar currentTime={state.currentTime} duration={state.duration} seek={seek} />
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={togglePlayPause} className="text-white px-2 focus:outline-none">
            <FontAwesomeIcon icon={state.isPlaying ? faPause : faPlay} />
          </button>
          <button onClick={toggleMute} className="text-white px-2 focus:outline-none">
            <FontAwesomeIcon icon={state.isMuted ? faVolumeMute : faVolumeUp} />
          </button>
          <span className="text-white text-sm ml-2">{formatTime(state.currentTime)} / {formatTime(state.duration)}</span>
        </div>
        <div className="flex items-center">
          <QualitySelector quality={state.quality} onChange={handleQualityChange} />
          <button onClick={toggleFullscreen} className="text-white px-2 focus:outline-none">
            <FontAwesomeIcon icon={state.isFullscreen ? faCompress : faExpand} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ProgressBar = ({ currentTime, duration, seek }) => {
  const percent = (currentTime / duration) * 100;
  return (
    <div className="progress-bar w-full h-1 bg-gray-600 cursor-pointer mb-2 hover:h-3 transition-all duration-200 relative" onClick={seek}>
      <div className="progress h-full bg-red-600" style={{ width: `${percent}%` }}>
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 transition-opacity duration-200"></div>
      </div>
    </div>
  );
};

const QualitySelector = ({ quality, onChange }) => {
  return (
    <select value={quality} onChange={onChange} className="bg-transparent text-white text-sm focus:outline-none mr-2">
      <option value="-1">Auto</option>
      <option value="0">240p</option>
      <option value="1">360p</option>
      <option value="2">720p</option>
    </select>
  );
};



export default VideoPlayer;
