import { create } from 'zustand';

const useStore = create((set, get) => ({
  // Modal States
  isVideoOpen: false,
  selectedVideo: null,
  isAlbumOpen: false,
  selectedAlbum: null,
  photosOnly: null,
  isPhotoOpen: false,
  selectedPhoto: null,

  // Fullscreen Methods
  openFullscreen: (fullScreenRef) => {
    if (!fullScreenRef.current) return;
    
    try {
      const fullscreenRequest = fullScreenRef.current.requestFullscreen 
        || fullScreenRef.current.webkitRequestFullscreen
        || fullScreenRef.current.msRequestFullscreen;
    
      if (fullscreenRequest) {
        fullscreenRequest.call(fullScreenRef.current).catch(error => {
          console.warn('Failed to open fullscreen:', error);
        });
      } else {
        console.warn('Fullscreen is not supported on this element.');
      }
    } catch (error) {
      console.warn('Error opening fullscreen:', error);
    }
  },

  closeFullscreen: () => {
    if (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  },

  // Modal Actions
  openVideoModal: (videoSrc, track = true) => {
    set({ selectedVideo: videoSrc, isVideoOpen: true });
    document.body.classList.add('no-scroll');
    if (track) history.pushState({videoSrc}, "");
  },

  closeVideoModal: (track = true) => {
    set({ selectedVideo: null, isVideoOpen: false });
    get().closeFullscreen();
    document.body.classList.remove('no-scroll');
    if (track) history.back();
  },

  openAlbumModal: (album, track = true) => {
    set({ selectedAlbum: album, isAlbumOpen: true });
    document.body.classList.add('no-scroll');
    if (track) history.pushState({album}, "");
  },

  closeAlbumModal: (track = true) => {
    set({ selectedAlbum: null, isAlbumOpen: false });
    document.body.classList.remove('no-scroll');
    if (track) history.back();
  },

  openPhotoModal: (photo, track = true) => {
    set({ selectedPhoto: photo, isPhotoOpen: true });
    if (photo.profile) document.body.classList.add('no-scroll');
    if (track) history.pushState({photo}, "");
  },

  closePhotoModal: (track = true) => {
    const currentPhoto = get().selectedPhoto;
    if (currentPhoto?.profile) document.body.classList.remove('no-scroll');
    set({ selectedPhoto: null, isPhotoOpen: false });
    get().closeFullscreen();
    if (track) history.back();
  },

  setSelectedAlbum: (album) => set({ selectedAlbum: album }),
  setPhotosOnly: (photosOnly) => set({ photosOnly }),
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
}));

export default useStore;
