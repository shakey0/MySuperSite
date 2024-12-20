import { useEffect, useState, useRef } from 'react';
import './Cat.scoped.scss';
import CatPatternBackground from './CatPatternBackground';
import AlbumModal from './utils/AlbumModal';
import PhotoModal from './utils/PhotoModal';
import ExpandableText from '../shared/ExpandableText';

const enToCn = {
  "known_as": "名字",
  "born_on": "出生日期",
  "passed_in": "去世日期",
  "age_in_cat_years": "猫咪年龄",
  "likes_eating": "喜欢吃",
  "likes_to": "喜欢",
  "story": "的故事",
};

function capitalizeTitle(slug) {
  const excludedWords = new Set(['and', 'of']);
  return slug
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => excludedWords.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function Cats() {
  const [infoData, setInfoData] = useState({});
  const [rawData, setRawData] = useState({});
  const [tab, setTab] = useState('videos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [isPhotoOpen, setIsPhotoOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const slug = window.location.pathname.split('/').pop();
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
          if (!data.videos) {
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

  const openAlbumModal = (album, track = true) => {
    setSelectedAlbum(album);
    setIsModalOpen(true);
    document.body.classList.add('no-scroll');
    if (track) history.pushState({album}, "");
  };

  const closeAlbumModal = (track = true) => {
    setSelectedAlbum(null);
    setIsModalOpen(false);
    document.body.classList.remove('no-scroll');
    if (track) history.back();
  };

  const openPhotoModal = (photo, track = true) => {
    setSelectedPhoto(photo);
    setIsPhotoOpen(true);
    if (track) history.pushState({photo}, "");
  };

  const closePhotoModal = (track = true) => {
    setSelectedPhoto(null);
    setIsPhotoOpen(false);
    if (track) history.back();
  };

  const toggleTab = (tab) => {
    setTab(tab);
    history.pushState({tab}, "");
  };

  useEffect(() => {
    const handlePopState = (event) => {
      const data = event.state;
      if (data && (data.album || data.photo)) {
        if (data.album) {
          closePhotoModal(false);
          openAlbumModal(data.album, false);
        } else if (data.photo) {
          openPhotoModal(data.photo, false);
        }
      } else {
        closeAlbumModal(false);
        closePhotoModal(false);

        if (data && data.tab) {
          setTab(data.tab);
        } else {
          if (rawData.videos) {
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

  // console.log('sortedData:', infoData);
  // console.log('rawData:', rawData);

  return (
    <CatPatternBackground color1="#777777" color2="#444444">
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
              {rawData.profile_photo && <img src={`/cats/photo/${slug}/${rawData.profile_photo}`} alt="Cat" />}
            </div>
          </div>
        </div>

        <div className="container tabs-container">
          <button className={`tab left ${tab === 'videos' ? 'active' : ''}`} onClick={() => toggleTab('videos')}><h1>{lang === 'cn' ? '视频' : 'Videos'}</h1></button>
          <button className={`tab right ${tab === 'albums' ? 'active' : ''}`} onClick={() => toggleTab('albums')}><h1>{lang === 'cn' ? '相册' : 'Albums'}</h1></button>
        </div>

        <div className={`flex-wrap-container ${tab === 'videos' ? 'active' : ''}`}>
          {rawData.videos && rawData.videos.map((video, index) => (
            <div className="container video-container" key={index}>
              <p>{video.description}</p>
              <video controls>
                <source src={`/cats/video/${slug}/${video.video}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ))}
        </div>

        <div className={`flex-wrap-container ${tab === 'albums' ? 'active' : ''}`}>
          {rawData.albums &&
            rawData.albums.map((album, index) => {
              const coverPhoto = album.photos.find((photo) => photo.order === 1);

              return (
                <div className="container album-container" key={index} onClick={() => openAlbumModal(album)}>
                  <h3>{album.name}</h3>
                  <div className="cover-photo">
                    {coverPhoto ? (
                      <img src={`/cats/photo/${slug}/${coverPhoto.name}`} alt={`Album: ${album.name}`} />
                    ) : (
                      <p>No cover photo available</p>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <AlbumModal isOpen={isModalOpen} onClose={closeAlbumModal}>
        {selectedAlbum && (
          <div className="album-modal-content">
            <h2>{selectedAlbum.name}</h2>
            <p>{selectedAlbum.description}</p>
            <div className={`album-photos${selectedAlbum.photos.length < 2 ? '-1' : selectedAlbum.photos.length < 3 ? ' two' : ''}`}>
              {selectedAlbum.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={`/cats/photo/${slug}/${photo.name}`}
                  alt={`Photo ${idx + 1} from ${selectedAlbum.name}`}
                  className="album-photo"
                  onClick={() => openPhotoModal(photo)}
                />
              ))}
            </div>
          </div>
        )}
      </AlbumModal>

      <PhotoModal
        isOpen={isPhotoOpen}
        onClose={closePhotoModal}
        selectPhoto={setSelectedPhoto}
        selectedPhoto={selectedPhoto}
        photos={selectedAlbum ? selectedAlbum.photos : []}
      >
        {selectedPhoto && (
          <div className="photo-modal-content">
            <img src={`/cats/photo/${slug}/${selectedPhoto.name}`} alt="Selected" />
          </div>
        )}
      </PhotoModal>
    </CatPatternBackground>
  )
}
