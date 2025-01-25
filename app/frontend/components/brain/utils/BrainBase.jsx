import './BrainBase.scoped.scss';
import { BackArrow, MenuIcon } from './MenuBarSvgs';

const BrainBase = ({ header, children }) => {


  return (
    <div className="brain-base">
      <div className="brain-base__header">
        <h1>{header}</h1>
        <div
          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", left: "0", top: "0", height: "100%", width: "76px" }}
          className="back-button"
        >
          <BackArrow />
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "0", top: "0", height: "100%", width: "76px" }}
          className="menu-button"
        >
          <MenuIcon />
        </div>
      </div>
      <div className="brain-base__content">
        {children}
      </div>
    </div>
  );
}

export default BrainBase;
