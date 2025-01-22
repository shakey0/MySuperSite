import { create } from 'zustand';

const enToCn = {
  "known_as": "名字",
  "born_on": "出生日期",
  "passed_in": "去世日期",
  "age_in_cat_years": "猫咪年龄",
  "likes_eating": "喜欢吃",
  "likes_to": "喜欢",
  "story": "的故事",
};

const useStore = create((set, get) => ({
  // Modal States
  isVideoOpen: false,
  selectedVideo: null,
  isAlbumOpen: false,
  selectedAlbum: null,
  photosOnly: null,
  isPhotoOpen: false,
  selectedPhoto: null,
  currentTab: 'videos',
  rawData: {},
  infoData: {},

  // Setters
  setSelectedAlbum: (album) => set({ selectedAlbum: album }),
  setPhotosOnly: (photosOnly) => set({ photosOnly }),
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
  setCurrentTab: (tab) => set({ currentTab: tab }),
  setRawData: (data) => set({ rawData: data }),
  setInfoData: (data) => set({ infoData: data }),

  // Fetch Data
  fetchData: async (slug, lang) => {
    try {
      const response = await fetch(`/cats/${slug}/data?lang=${lang}`);
      const data = await response.json();
      if (data) {
        set({ rawData: data });
        const sortedData = {
          [`${lang === 'cn' ? enToCn["known_as"] : "Known as"}`]: data.known_as,
          [`${lang === 'cn' ? enToCn["born_on"] : "Born on"}`]: data.born_on,
        };
        if (data.passed_in) {
          sortedData[`${lang === 'cn' ? enToCn["passed_in"] : "Passed in"}`] = data.passed_in;
        }
        Object.assign(sortedData, {
          [`${lang === 'cn' ? enToCn["age_in_cat_years"] : "Age in cat years"}`]: data.age_in_cat_years,
          [`${lang === 'cn' ? enToCn["likes_eating"] : "Like" + (data.passed_in ? "d" : "s") + " eating"}`]: data.likes_eating,
          [`${lang === 'cn' ? enToCn["likes_to"] : "Like" + (data.passed_in ? "d" : "s") + " to"}`]: data.likes_to,
          [`${data.first_name + (lang === 'cn' ? enToCn["story"] : "'s story")}`]: data.story,
        });
        set({ infoData: sortedData });
        if (data.videos.length === 0) {
          set({ currentTab: 'albums' });
        }
        if (data.photos) {
          set({ photosOnly: data.photos });
        }
      } else {
        console.warn('No data:', data);
        window.location.href = '/cats';
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  },

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

  toggleTab: (tab) => {
    set({ currentTab: tab });
    history.pushState({tab}, "");
  },

  // PopState Handler
  initializePopStateHandler: () => {
    const handlePopState = (event) => {
      const data = event.state;
      const store = get();
      
      if (data && (data.album || data.photo || data.videoSrc)) {
        if (data.album) {
          store.closePhotoModal(false);
          store.openAlbumModal(data.album, false);
        } else if (data.photo) {
          store.openPhotoModal(data.photo, false);
        } else if (data.videoSrc) {
          store.openVideoModal(data.videoSrc, false);
        }
      } else {
        store.closeAlbumModal(false);
        store.closePhotoModal(false);
        store.closeVideoModal(false);

        if (data && data.tab) {
          store.setCurrentTab(data.tab);
        } else {
          if (store.rawData.videos?.length > 0) {
            store.setCurrentTab('videos');
          } else {
            store.setCurrentTab('albums');
          }
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  },
}));

export default useStore;
