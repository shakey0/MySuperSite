import { useEffect, useState, useRef } from 'react';
import './CatsMain.scoped.scss';
import CatPatternBackground from './utils/CatPatternBackground';
import VideoPlayer from './utils/VideoPlayer';
import VideoModal from './utils/VideoModal';
import AlbumModal from './utils/AlbumModal';
import PhotoModal from './utils/PhotoModal';
import ExpandableText from '../shared/ExpandableText';
import ResponsiveGallery from './utils/ResponsiveGallery';
import Masonry from 'react-masonry-css';

function MasonryLayout({ type, children }) {
  const videosBreakpoint = {
    default: 3,
    1280: 2,
    768: 1,
  };

  const albumsBreakpoint = {
    default: 4,
    1440: 3,
    1024: 2,
    768: 1,
  };

  return (
    <Masonry
      breakpointCols={type === 'videos' ? videosBreakpoint : albumsBreakpoint}
      className="masonry-grid"
      columnClassName="masonry-grid-column"
    >
      {children}
    </Masonry>
  );
}

const enToCn = {
  "known_as": "名字",
  "born_on": "出生日期",
  "passed_in": "去世日期",
  "age_in_cat_years": "猫咪年龄",
  "likes_eating": "喜欢吃",
  "likes_to": "喜欢",
  "story": "的故事",
};

export default function Cats() {
  const [infoData, setInfoData] = useState({});
  const [rawData, setRawData] = useState({});
  const [tab, setTab] = useState('videos');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const fullScreenRef = useRef(null);

  const slug = window.location.pathname.split('/').pop();
  if (!slug && window.location.pathname.endsWith('/')) {
    const fixed_slug = window.location.pathname.split('/')[window.location.pathname.split('/').length - 2];
    window.location.href = `/cats/${fixed_slug}`;
  }
  const lang = new URLSearchParams(window.location.search).get('lang') || 'en';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/cats/${slug}/data?lang=${lang}`);
        const data = await response.json();
        if (data) {
          setRawData(data);
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
          setInfoData(sortedData);
          if (data.videos.length === 0) {
            setTab('albums');
          }
        } else {
          console.warn('No data:', data);
          window.location.href = '/cats';
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const openFullscreen = () => {
    if (!fullScreenRef.current) return;
  
    try {
      const fullscreenRequest = fullScreenRef.current.requestFullscreen 
        || fullScreenRef.current.webkitRequestFullscreen  // Safari
        || fullScreenRef.current.msRequestFullscreen;     // IE11
  
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
  };  

  const closeFullscreen = () => {
    if (document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
      }
    }
  };

  const openVideoModal = (videoSrc, track = true) => {
    setSelectedVideo(videoSrc);
    setIsVideoOpen(true);
    document.body.classList.add('no-scroll');
    if (track) history.pushState({videoSrc}, "");
  }

  const closeVideoModal = (track = true) => {
    setSelectedVideo(null);
    setIsVideoOpen(false);
    closeFullscreen();
    document.body.classList.remove('no-scroll');
    if (track) history.back();
  }

  const openAlbumModal = (album, track = true) => {
    setSelectedAlbum(album);
    setIsAlbumOpen(true);
    document.body.classList.add('no-scroll');
    if (track) history.pushState({album}, "");
  };

  const closeAlbumModal = (track = true) => {
    setSelectedAlbum(null);
    setIsAlbumOpen(false);
    document.body.classList.remove('no-scroll');
    if (track) history.back();
  };

  const openPhotoModal = (photo, track = true) => {
    setSelectedPhoto(photo);
    setIsPhotoOpen(true);
    if (photo.profile) document.body.classList.add('no-scroll');
    if (track) history.pushState({photo}, "");
  };

  const closePhotoModal = (track = true) => {
    if (selectedPhoto && selectedPhoto.profile) document.body.classList.remove('no-scroll');
    setSelectedPhoto(null);
    setIsPhotoOpen(false);
    closeFullscreen();
    if (track) history.back();
  };

  const toggleTab = (tab) => {
    setTab(tab);
    history.pushState({tab}, "");
  };

  useEffect(() => {
    const handlePopState = (event) => {
      const data = event.state;
      if (data && (data.album || data.photo || data.videoSrc)) {
        if (data.album) {
          closePhotoModal(false);
          openAlbumModal(data.album, false);
        } else if (data.photo) {
          openPhotoModal(data.photo, false);
        } else if (data.videoSrc) {
          openVideoModal(data.videoSrc, false);
        }
      } else {
        closeAlbumModal(false);
        closePhotoModal(false);
        closeVideoModal(false);

        if (data && data.tab) {
          setTab(data.tab);
        } else {
          if (rawData.videos.length > 0) {
            setTab('videos');
          } else {
            setTab('albums');
          }
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [rawData]);

  useEffect(() => {
    if (rawData.photos && !selectedAlbum) {
      setSelectedAlbum({ name: rawData.first_name, photos: rawData.photos, description: "All photos" });
    }
  }, [rawData.photos, selectedAlbum]);

  if (!rawData.first_name) {
    return (
      <div className="page-container">
        <div className="container header-container">
          <h1 className="title">Loading...</h1>
        </div>
      </div>
    );
  }

  const mediaUrl = (item) => {
    if (!item) return;
    const type = item.split('.').pop();
    const mediaType = type === 'mp4' ? 'video' : 'photo';
    const isFromDomain = window.location.href.includes('shakey0.co.uk');
    return isFromDomain ? `https://cats.shakey0.co.uk/${slug}/${mediaType}s/${item}` : `/cats/${mediaType}/${slug}/${item}`;
  }

  const imagesAs = rawData.albums ? {en: 'Albums', cn: '相册'} : {en: 'Photos', cn: '照片'};

  return (
    <CatPatternBackground colors={rawData.colors} loaded={rawData.first_name ? true : false}>
      <div className="page-container">
        <div className="container header-container">
          <h1 className="title">
            {rawData && rawData.first_name ? (
              <>
                {rawData.first_name}
                {rawData.middle_name && ` ${rawData.middle_name}`}
                {rawData.last_name && ` ${rawData.last_name}`}
              </>
            ) : (
              "Loading..."
            )}
          </h1>
        </div>

        <div className="container info-container">
          <div className="info-left">
            {Object.entries(infoData).map(([key, value], index) => (
              <div className={`info-data ${key.includes('to') || key.includes('story') ? 'long' : ''}`} key={index}>
                <p className="key">{key}</p>
                {key.includes('story') && typeof value === 'string' && value.length > 150 ? (
                  <ExpandableText value={value} className="value story" buttonClassName="expand-button" limit={150} truncateBelow={120} />
                ) : (
                  <p className="value">{value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="info-right">
            <div className="image-box">
              {rawData.profile_photo && (
                <img
                  src={mediaUrl(rawData.profile_photo)}
                  alt={`${rawData.first_name}`}
                  onClick={() => openPhotoModal({"name": rawData.profile_photo, "order": 0, "profile": true})}
                />
              )}
            </div>
          </div>
        </div>

        <div className="container tabs-container">
          <button className={`tab left ${tab === 'videos' ? 'active' : ''}`} onClick={() => toggleTab('videos')}><h1>{lang === 'cn' ? '视频' : 'Videos'}</h1></button>
          <button className={`tab right ${tab === 'albums' ? 'active' : ''}`} onClick={() => toggleTab('albums')}><h1>{lang === 'cn' ? imagesAs.cn : imagesAs.en}</h1></button>
        </div>

        <div className={`media-container videos ${tab === 'videos' ? 'active' : ''}`}>
          <MasonryLayout type="videos">
          {rawData.videos && rawData.videos.sort((a, b) => a.order - b.order).map((video, index) => (
            <div className="container video-container" key={index}>
              <p>{video.description}</p>
              <VideoPlayer
                videoSrc={mediaUrl(video.video)}
                selectedVideo={selectedVideo}
                openVideoModal={openVideoModal}
                closeVideoModal={closeVideoModal}
                stopAndSilence={selectedVideo ? true : false}
              />
            </div>
          ))}
          </MasonryLayout>
        </div>
        
        {rawData.albums ? (
          <div className={`media-container albums ${tab === 'albums' ? 'active' : ''}`}>
            <MasonryLayout type="albums">
              {rawData.albums &&
                rawData.albums.sort((a, b) => a.order - b.order).map((album, index) => {
                  
                  const coverPhoto = album.photos.find((photo) => photo.order === 1);

                  return (
                    <div className="container album-container" key={index} onClick={() => openAlbumModal(album)}>
                      <p>{album.name}</p>
                      <div className="cover-photo">
                        {coverPhoto ? (
                          <img src={mediaUrl(coverPhoto.name)} alt={`Album: ${album.name}`} />
                        ) : (
                          <p>No cover photo available</p>
                        )}
                      </div>
                    </div>
                  );
                })
              }
            </MasonryLayout>
          </div>
        ) : (
          <div className={`container photos-container ${tab === 'albums' ? 'active' : ''}`}>
            {rawData.photos && (
              <ResponsiveGallery photos={rawData.photos} mediaUrl={mediaUrl} openPhotoModal={openPhotoModal} />
            )}
          </div>
        )}
      </div>

      <VideoModal ref={fullScreenRef} isOpen={isVideoOpen} closeVideoModal={closeVideoModal} openFullscreen={openFullscreen}>
        {selectedVideo && (
          <VideoPlayer
            videoSrc={selectedVideo}
            selectedVideo={selectedVideo}
            openVideoModal={openVideoModal}
            closeVideoModal={closeVideoModal}
            playOnLoad={true}
          />
        )}
      </VideoModal>

      <AlbumModal isOpen={isAlbumOpen} onClose={closeAlbumModal} colors={rawData.colors}>
        {selectedAlbum && (
          <div className="album-modal-content">
            <h3>{selectedAlbum.name}</h3>
            <p>{selectedAlbum.description}</p>
            <ResponsiveGallery photos={selectedAlbum.photos} mediaUrl={mediaUrl} openPhotoModal={openPhotoModal} />
          </div>
        )}
      </AlbumModal>

      <PhotoModal
        ref={fullScreenRef} 
        isOpen={isPhotoOpen}
        onClose={closePhotoModal}
        selectPhoto={setSelectedPhoto}
        selectedPhoto={selectedPhoto}
        photos={selectedAlbum ? selectedAlbum.photos : []}
        openFullscreen={openFullscreen}
      >
        {selectedPhoto && (
          <div className="photo-modal-content">
            <img src={mediaUrl(selectedPhoto.name)} alt={`Photo ${selectedPhoto.order} from ${selectedAlbum?.name || ""}`} />
          </div>
        )}
      </PhotoModal>
    </CatPatternBackground>
  )
}
