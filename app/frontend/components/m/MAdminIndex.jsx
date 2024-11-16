import './MAdminIndex.scoped.scss';

export default function MAdminIndex({ filenames }) {
  const loadedFilenames = filenames ? JSON.parse(filenames) : [];
  
  return (
    <div className="outer-container">
      <div className="main-container">
        <h1>Admin index</h1>
        <div className="filenames-container">
          {loadedFilenames.map((filename, index) => (
            <a key={index} href={`m_admin/${filename}`}>{filename}</a>
          ))}
        </div>
      </div>
    </div>
  );
}