import { useEffect, useState } from 'react';

export default function Cats() {
  const [infoData, setInfoData] = useState({});
  const [rawData, setRawData] = useState({});

  useEffect(() => {
    const slug = window.location.pathname.split('/').pop();
    console.log(slug);

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
          // REMOVE THIS LATER
          for (const [key, value] of Object.entries(sortedData)) {
            console.log(`${key}: ${value}`);
          }
        } else {
          console.warn('No data:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="page-container">
      <div className="header-container">
        <div className="header-left">
          <h1 className="title">Sophie Larna Shakespeare</h1>
          <div className="info-data">
            <p className="key">Known as: </p>
            <p className="value">Mental Sophie</p>
          </div>
          <div className="info-data">
            <p className="key">Born on: </p>
            <p className="value">10th July 2010</p>
          </div>
          <div className="info-data">
            <p className="key">Age in cat years: </p>
            <p className="value">70</p>
          </div>
          <div className="info-data">
            <p className="key">Likes eating: </p>
            <p className="value">Lick-e-Lix</p>
          </div>
          <div className="info-data">
            <p className="key">Likes to: </p>
            <p className="value">Wake everyone up at 5am</p>
          </div>
          <div className="info-data">
            <p className="key">Sophie's story: </p>
            <p className="value">A piece of string</p>
          </div>
        </div>
        <div className="header-right">

        </div>
      </div>
    </div>
  )
}
