import { useRef, useState, useEffect } from "react";
import "./VideoPlayer.scoped.scss";
import { SoundOn, Mute, Play, Pause, EnterFullScreen, LeaveFullScreen } from "./VideoControlSvgs";

const VideoPlayer = ({ videoSrc, selectedVideo, goFullScreen, quitFullScreen, stopAndSilence = false, playOnLoad = false }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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
      quitFullScreen();
    } else {
      goFullScreen(videoSrc);
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
      <div className="custom-controls">
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
