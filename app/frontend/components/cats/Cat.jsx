import { useEffect, useState, useRef } from 'react';
import './CatsMain.scoped.scss';
import VideoModal from './modals/VideoModal';
import AlbumModal from './modals/AlbumModal';
import PhotoModal from './modals/PhotoModal';
import CatPatternBackground from './utils/CatPatternBackground';
import ExpandableText from '../shared/ExpandableText';
import VideoPlayer from './utils/VideoPlayer';
import MasonryLayout from './utils/MasonryLayout';
import ResponsiveGallery from './utils/ResponsiveGallery';
import useStore from './store';

export default function Cats() {
  const selectedVideo = useStore(s => s.selectedVideo);
  const selectedAlbum = useStore(s => s.selectedAlbum);
  const selectedPhoto = useStore(s => s.selectedPhoto);
  const openAlbumModal = useStore(s => s.openAlbumModal);
  const openPhotoModal = useStore(s => s.openPhotoModal);
  const setSelectedAlbum = useStore(s => s.setSelectedAlbum);
  const currentTab = useStore(s => s.currentTab);
  const toggleTab = useStore(s => s.toggleTab);
  const rawData = useStore(s => s.rawData);
  const infoData = useStore(s => s.infoData);
  const fetchData = useStore(s => s.fetchData);

  const fullScreenRef = useRef(null);

  const slug = window.location.pathname.split('/').pop();
  if (!slug && window.location.pathname.endsWith('/')) {
    const fixed_slug = window.location.pathname.split('/')[window.location.pathname.split('/').length - 2];
    window.location.href = `/cats/${fixed_slug}`;
  }
  const lang = new URLSearchParams(window.location.search).get('lang') || 'en';

  useEffect(() => {
    fetchData(slug, lang);
    const cleanup = useStore.getState().initializePopStateHandler();
    return cleanup;
  }, []);

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
    <CatPatternBackground colors={rawData.colors}>
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
          <button className={`tab left ${currentTab === 'videos' ? 'active' : ''}`} onClick={() => toggleTab('videos')}><h1>{lang === 'cn' ? '视频' : 'Videos'}</h1></button>
          <button className={`tab right ${currentTab === 'albums' ? 'active' : ''}`} onClick={() => toggleTab('albums')}><h1>{lang === 'cn' ? imagesAs.cn : imagesAs.en}</h1></button>
        </div>

        <div className={`media-container videos ${currentTab === 'videos' ? 'active' : ''}`}>
          <MasonryLayout type="videos">
          {rawData.videos && rawData.videos.sort((a, b) => a.order - b.order).map((video, index) => (
            <div className="container video-container" key={index}>
              <p>{video.description}</p>
              <VideoPlayer
                videoSrc={mediaUrl(video.video)}
                stopAndSilence={selectedVideo ? true : false}
              />
            </div>
          ))}
          </MasonryLayout>
        </div>
        
        {rawData.albums ? (
          <div className={`media-container albums ${currentTab === 'albums' ? 'active' : ''}`}>
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
          <div className={`container photos-container ${currentTab === 'albums' ? 'active' : ''}`}>
            {rawData.photos && (
              <ResponsiveGallery mediaUrl={mediaUrl} onPage={true} />
            )}
          </div>
        )}
      </div>

      <VideoModal ref={fullScreenRef}>
        {selectedVideo && (
          <VideoPlayer
            videoSrc={selectedVideo}
            playOnLoad={true}
          />
        )}
      </VideoModal>

      <AlbumModal colors={rawData.colors}>
        {selectedAlbum && (
          <div className="album-modal-content">
            <h3>{selectedAlbum.name}</h3>
            <p>{selectedAlbum.description}</p>
            <ResponsiveGallery mediaUrl={mediaUrl} />
          </div>
        )}
      </AlbumModal>

      <PhotoModal ref={fullScreenRef}>
        {selectedPhoto && (
          <div className="photo-modal-content">
            <img src={mediaUrl(selectedPhoto.name)} alt={`Photo ${selectedPhoto.order} from ${selectedAlbum?.name || ""}`} />
          </div>
        )}
      </PhotoModal>
    </CatPatternBackground>
  )
}
