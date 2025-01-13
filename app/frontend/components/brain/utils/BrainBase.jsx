import './BrainBase.scoped.scss';

const BrainBase = ({ header, children }) => {


  return (
    <div className="brain-base">
      <div className="brain-base__header">
        <h1>{header}</h1>
        <div
          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", left: "0", top: "0", height: "100%", width: "76px" }}
          className="back-button"
        >
          <p style={{ fontSize: "72px" }}>⇐</p>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "0", top: "0", height: "100%", width: "76px" }}
          className="back-button"
        >
          <svg width="66px" height="66px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 18L20 18" stroke="#ff8833" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 12L20 12" stroke="#ff8833" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 6L20 6" stroke="#ff8833" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      <div className="brain-base__content">
        {children}
      </div>
    </div>
  );
}

export default BrainBase;
