import { useEffect, useState } from 'react';
import './CatsMain.scoped.scss';
import CatPatternBackground from './utils/CatPatternBackground';

const colors = {
  color_1: null
}

export default function Cats() {
  const [catsData, setCatsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/cats/index_data`);
        const data = await response.json();
        if (data) {
          console.log(data);
          setCatsData(data.cats);
        }
      }
      catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const mediaUrl = (slug, item) => {
    if (!item) return;
    const isFromDomain = window.location.href.includes('shakey0.co.uk');
    return isFromDomain ? `https://cats.shakey0.co.uk/${slug}/photos/${item}` : `/cats/photo/${slug}/${item}`;
  }

  const goToCatPage = (slug) => {
    window.location.href = `/cats/${slug}`;
  }

  return (
    <CatPatternBackground colors={colors} loaded={true}>
      <div className="page-container">
        <div className="container header-container">
          <h1 className="title">
            Lovely Cats
          </h1>
        </div>

        <div className="media-container index">
          {catsData && catsData.sort((a, b) => a.order - b.order).map((cat, index) => {
            return (
              <div key={index} className="container album-container" onClick={() => goToCatPage(cat.slug)}>
                <p>{cat.name}</p>
                <div className="cover-photo">
                  <img src={mediaUrl(cat.slug, cat.profile_photo)} alt={cat.name} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </CatPatternBackground>
  )
}
