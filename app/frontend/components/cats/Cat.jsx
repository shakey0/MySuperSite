import { useEffect, useState } from 'react';
import './Cat.scoped.scss';
import CatPatternBackground from './CatPatternBackground';

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
        } else {
          console.warn('No data:', data);
          setRawData({ "first_name": `There's no cat profile named ${capitalizeTitle(slug)}` });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  console.log('sortedData:', infoData);

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
