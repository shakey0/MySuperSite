import { useState, useEffect } from 'react';
import './ResponsiveGallery.scoped.scss';

const ResponsiveGallery = ({ photos, mediaUrl, openPhotoModal }) => {
  const [processedPhotos, setProcessedPhotos] = useState([]);
  const [containerWidth, setContainerWidth] = useState(1280);

  const getColumnCountAndMaxWidth = (width, numPhotos) => {
    if (width >= 1440 && numPhotos >= 4) return { columnCount: 4, maxWidth: width / 3 };
    if (width >= 1024 && numPhotos >= 3) return { columnCount: 3, maxWidth: width / 2 };
    if (width >= 768 && numPhotos >= 2) return { columnCount: 2, maxWidth: width };
    return { columnCount: 1, maxWidth: width };
  };

  useEffect(() => {
    const loadImages = async () => {
      const sortedPhotos = [...photos].sort((a, b) => a.order - b.order);
      
      const loadedPhotos = await Promise.all(
        sortedPhotos.map(photo => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = mediaUrl(photo.name);
            img.onload = () => {
              resolve({
                ...photo,
                src: mediaUrl(photo.name),
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
              });
            };
            img.onerror = () => {
              resolve({
                ...photo,
                src: mediaUrl(photo.name),
                naturalWidth: 800,
                naturalHeight: 600,
                aspectRatio: 4/3
              });
            };
          });
        })
      );
      setProcessedPhotos(loadedPhotos);
    };
    
    loadImages();
  }, [photos, mediaUrl]);

  useEffect(() => {
    const updateWidth = () => {
      const viewportWidth = Math.min(window.innerWidth, 1280);
      setContainerWidth(viewportWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const organizePhotos = () => {
    if (!processedPhotos.length || !containerWidth) return [];
  
    const rows = [];
    const { columnCount, maxWidth } = getColumnCountAndMaxWidth(containerWidth, processedPhotos.length);
    const gapWidth = 8;
    const totalGapWidth = (columnCount - 1) * gapWidth;
    const availableWidth = containerWidth - totalGapWidth;
  
    for (let i = 0; i < processedPhotos.length; i += columnCount) {
      const row = processedPhotos.slice(i, i + columnCount);
      const sumRatios = row.reduce((sum, photo) => sum + photo.aspectRatio, 0);
      const rowHeight = Math.min(availableWidth / sumRatios, maxWidth / Math.min(...row.map(photo => photo.aspectRatio)));
      
      const processedRow = row.map(photo => {
        const calculatedWidth = (photo.aspectRatio * rowHeight / containerWidth) * 100;
        const maxWidthPercent = (maxWidth / containerWidth) * 100;
        return {
          ...photo,
          width: `${Math.min(calculatedWidth, maxWidthPercent)}%`,
          height: rowHeight
        };
      });
  
      rows.push(processedRow);
    }
  
    return rows;
  };

  const rows = organizePhotos();

  return (
    <div>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="photo-row" style={{ height: row[0]?.height }}>
          {row.map((photo) => (
            <div key={photo.order} className="photo-container" style={{ width: photo.width }}>
              <img
                src={photo.src}
                alt={`Photo ${photo.order}`}
                onClick={() => openPhotoModal(photo)}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ResponsiveGallery;
