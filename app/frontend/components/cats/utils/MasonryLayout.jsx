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

export default MasonryLayout;
