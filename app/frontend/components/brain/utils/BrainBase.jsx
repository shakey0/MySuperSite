import Popup from "reactjs-popup";
import './BrainBase.scoped.scss';
import { BackArrow, MenuIcon } from './MenuBarSvgs';

const BrainBase = ({ header, showButtons = true, backPath = true, showLogOut = true, children }) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

  const handleLogOut = async () => {
    try {
      const response = await fetch('/log_out', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
      });

      const responseData = await response.json();
      if (responseData.outcome === "success_and_redirect_to_auth") {
        window.location.href = '/brain/auth';
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const menuOptions = [
    { name: "About Brain", path: "/brain/about", newTab: false },
    { name: "shakey0.co.uk", path: "/", newTab: true },
    { name: "Contact me", path: "/contact", newTab: true },
    ...(showLogOut ? [{ name: "Log out", onClick: handleLogOut }] : []),
  ];

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

        <Popup
          trigger={
            <div
              className="menu-button"
              style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "0", top: "0", height: "100%", width: "76px" }}
            >
              <MenuIcon />
            </div>
          }
          position="bottom right"
          on="click"
          closeOnDocumentClick
          arrow={false}
        >
          <div className="menu">
            {menuOptions.map((option, index) => (
              <div key={index} className="menu__option">
                {option.newTab ? (
                  <a href={option.path} target="_blank" rel="noreferrer">
                    {option.name}
                  </a>
                ) : option.onClick ? (
                  <button onClick={option.onClick}>{option.name}</button>
                ) : (
                  <a href={option.path}>{option.name}</a>
                )}
              </div>
            ))}
          </div>
        </Popup>
      </div>
      <div className="brain-base__content">{children}</div>
    </div>
  );
}

export default BrainBase;
