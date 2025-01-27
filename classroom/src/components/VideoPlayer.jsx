import React, { useEffect, useReducer, useRef, useState } from 'react';
import Hls from 'hls.js';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faVolumeUp,
  faVolumeMute,
  faExpand,
  faCompress,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons';

const initialState = {
  isPlaying: false,
  isMuted: false,
  isFullscreen: false,
  currentTime: 0,
  duration: 0,
  quality: '-1',
  showControls: true,
  error: null,
  retryCount: 0,
  ended: false
};

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'RESET':
      return { ...initialState, retryCount: state.retryCount };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_ENDED':
      return { ...state, ended: action.payload };
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
    case 'SET_ERROR':
      return { ...state, error: action.payload, isPlaying: false };
    case 'INCREMENT_RETRY':
      return { ...state, retryCount: state.retryCount + 1 };
    default:
      return state;
  }
};

const VideoPlayer = ({ videoLink,lectureId }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const updateViews = async (lectureId) => {
    try {
        console.log("updating views");
        await axios.patch(`${process.env.REACT_APP_API_URL}/api/lectures/${lectureId}/view`);
    } catch (error) {
        console.error("Error updating views:", error);
    }
};

  useEffect(() => {
    const initializePlayer = async () => {
      dispatch({ type: 'RESET' });
      const video = videoRef.current;

      if (!video) return;

      const handleError = (errorType, details) => {
        console.error('Player Error:', errorType, details);
        dispatch({ type: 'SET_ERROR', payload: `${errorType}: ${details}` });
      };

      const cleanUpHLS = () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };

      if (Hls.isSupported()) {
        cleanUpHLS();
        const hls = new Hls({
          startLevel: -1,
          maxMaxBufferLength: 30,
          maxLoadingDelay: 4,
          enableWorker: true
        });

        hlsRef.current = hls;

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                handleError('Network Error', data.details);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                handleError('Media Error', data.details);
                hls.recoverMediaError();
                break;
              default:
                cleanUpHLS();
                initializePlayer();
                break;
            }
          }
        });

        try {
          hls.loadSource(videoLink);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            dispatch({ type: 'SET_ERROR', payload: null });
          });
        } catch (error) {
          handleError('Initialization Error', error.message);
        }
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoLink;
        video.addEventListener('error', () => {
          handleError('Native Player Error', video.error?.message);
        });
      }

      return cleanUpHLS;
    };

    initializePlayer();
  }, [videoLink, state.retryCount]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      dispatch({ type: 'UPDATE_TIME', payload: video.currentTime });
    };

    const handleLoadedMetadata = () => {
      dispatch({ type: 'SET_DURATION', payload: video.duration });
    };

    const handlePlay = () => {
      dispatch({ type: 'SET_PLAYING', payload: true });
      dispatch({ type: 'SET_ENDED', payload: false });
    };

    const handlePause = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
    };

    const handleEnded = () => {
      updateViews(lectureId);
      dispatch({ type: 'SET_ENDED', payload: true });
      dispatch({ type: 'SET_PLAYING', payload: false });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (state.ended) {
      video.currentTime = 0;
      video.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: `Playback Error: ${error.message}` });
      });
      return;
    }

    if (video.paused) {
      video.play().catch(error => {
        dispatch({ type: 'SET_ERROR', payload: `Playback Error: ${error.message}` });
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    dispatch({ type: 'TOGGLE_MUTE' });
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        video.requestFullscreen?.() ||
        video.mozRequestFullScreen?.() ||
        video.webkitRequestFullscreen?.() ||
        video.msRequestFullscreen?.();
      } else {
        document.exitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
      }
      dispatch({ type: 'TOGGLE_FULLSCREEN' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Fullscreen Error: ${error.message}` });
    }
  };

  const handleRetry = () => {
    if (state.retryCount < 3) {
      dispatch({ type: 'INCREMENT_RETRY' });
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Maximum retry attempts reached' });
    }
  };

  const seek = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleQualityChange = (e) => {
    const video = videoRef.current;
    const quality = e.target.value;
    const wasPlaying = !video.paused;

    if (hlsRef.current) {
      const currentTime = video.currentTime;
      video.pause();

      hlsRef.current.once(Hls.Events.LEVEL_SWITCHED, () => {
        video.currentTime = currentTime;
        if (wasPlaying) {
          video.play().catch(error => {
            dispatch({ type: 'SET_ERROR', payload: `Playback Error: ${error.message}` });
          });
        }
      });

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
const seekRelative = (seconds) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += seconds;
}



  // Add to VideoPlayer component
useEffect(() => {
    const handleKeyPress = (e) => {
      if (!state.showControls) return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
          seekRelative(-5);
          break;
        case 'arrowright':
          seekRelative(5);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.showControls]);


  return (
    <div className="bg-black flex justify-center items-center">
      <div className="video-container relative w-full max-w-4xl aspect-video" onMouseMove={handleMouseMove}>
        <video ref={videoRef} className="w-full h-full" />

        {state.error && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-red-500 p-4">
            <span className="text-lg mb-4">{state.error}</span>
            {state.retryCount < 3 && (
              <button
                onClick={handleRetry}
                className="flex items-center bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition"
              >
                <FontAwesomeIcon icon={faRotateRight} className="mr-2" />
                Retry Playback
              </button>
            )}
          </div>
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

const Controls = ({ state, togglePlayPause, toggleMute, toggleFullscreen, seek, handleQualityChange }) => {
  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent flex flex-col items-stretch p-2 transition-opacity duration-300 ${state.showControls ? 'opacity-100' : 'opacity-0'}`}>
      <ProgressBar currentTime={state.currentTime} duration={state.duration} seek={seek} />
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={togglePlayPause} className="text-white px-2 focus:outline-none">
            <FontAwesomeIcon icon={state.ended ? faRotateRight : (state.isPlaying ? faPause : faPlay)} />
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
