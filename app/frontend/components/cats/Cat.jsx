import { useEffect, useState } from 'react';
import './Cat.scoped.scss';
import CatPatternBackground from './CatPatternBackground';

export default function Cats() {
  const [infoData, setInfoData] = useState({});
  const [rawData, setRawData] = useState({});
  const slug = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/cats/${slug}/data`);
        const data = await response.json();
        if (data) {
          setRawData(data);
          const sortedData = {
            ["Known as"]: data.known_as,
            ["Born on"]: data.born_on,
          };
          if (data.passed_in) {
            sortedData["Passed in"] = data.passed_in;
          }
          Object.assign(sortedData, {
            ["Age in cat years"]: data.age_in_cat_years,
            [`Like${data.passed_in ? "d" : "s"} eating`]: data.likes_eating,
            [`Like${data.passed_in ? "d" : "s"} to`]: data.likes_to,
            [`${data.first_name}'s story`]: data.story,
          });
          setInfoData(sortedData);
        } else {
          console.warn('No data:', data);
          setRawData({ "first_name": `There's no cat named ${slug.charAt(0).toUpperCase() + slug.slice(1)}` });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

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
                <p className="value">{value}</p>
              </div>
            ))}
          </div>
          <div className="info-right">
            <div className="image-box">
              {rawData.profile_photo && <img src={`/cats/photo/${slug}/${rawData.profile_photo}`} alt="Cat" />}
            </div>
          </div>
        </div>
      </div>
    </CatPatternBackground>
  )
}
