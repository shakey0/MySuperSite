import { useRef, useState, useEffect } from "react";
import "./VideoPlayer.scoped.scss";
import { SoundOn, Mute, Play, Pause, EnterFullScreen, LeaveFullScreen } from "./VideoControlSvgs";
import useStore from '../store';

const VideoPlayer = ({ videoSrc, stopAndSilence = false, playOnLoad = false }) => {
  const selectedVideo = useStore(s => s.selectedVideo);
  const openVideoModal = useStore(s => s.openVideoModal);
  const closeVideoModal = useStore(s => s.closeVideoModal);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());

  useEffect(() => {
    if (!videoSrc) return;

    const handleInteraction = () => {
      lastInteractionRef.current = Date.now();

      if (!showControls) {
        setShowControls(true); // Show controls when there's interaction
      }
    };

    const hideControlsAfterInactivity = () => {
      if (Date.now() - lastInteractionRef.current >= 1000) {
        setShowControls(false);
      }
    };

    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    const interval = setInterval(hideControlsAfterInactivity, 100);

    return () => {
      document.removeEventListener('mousemove', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      clearInterval(interval);
    };
  }, [videoSrc, showControls]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMuteUnmute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleFullScreenToggle = () => {
    if (selectedVideo) {
      closeVideoModal();
    } else {
      openVideoModal(videoSrc);
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    video.muted = true;

    const handleVideoEnd = () => {
      setIsPlaying(false);
    };

    video.addEventListener("ended", handleVideoEnd);

    return () => {
      video.removeEventListener("ended", handleVideoEnd);
    };
  }, []);

  useEffect(() => {
    if (stopAndSilence) {
      const video = videoRef.current;
      video.pause();
      video.currentTime = 0;
      video.muted = true;
      setIsPlaying(false);
      setIsMuted(true);
    }
  }, [stopAndSilence]);

  useEffect(() => {
    if (playOnLoad) {
      const video = videoRef.current;
      video.play();
      setIsPlaying(true);
    }
  }, [playOnLoad]);

  return (
    <div className="video-player">
      <video ref={videoRef} src={videoSrc} />
      <div className={`custom-controls ${showControls ? "" : "hidden"}`}>
        <button onClick={handlePlayPause}>
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button onClick={handleMuteUnmute}>
          {isMuted ? <Mute /> : <SoundOn />}
        </button>
        <button onClick={handleFullScreenToggle}>
          {selectedVideo ? <LeaveFullScreen /> : <EnterFullScreen />}
        </button>
      </div>
    </div>
  );
};

export default VideoPlayer;
