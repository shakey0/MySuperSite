import { useState, useEffect } from 'react';
import './BrainBase.scoped.scss';
import { BackArrow, MenuIcon } from './MenuBarSvgs';

const BrainBase = ({ header, showButtons, backPath, children }) => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const [menuOpen, setMenuOpen] = useState(false);

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
  ];

  const userSessionCookie = document.cookie.split(';').find(cookie => cookie.includes('user_session'));
  if (userSessionCookie) {
    menuOptions.push({ name: "Log out", onClick: handleLogOut });
  }

  useEffect(() => {
    const closeMenu = () => setMenuOpen(false);
    if (menuOpen) {
      document.body.addEventListener('click', closeMenu);
      return () => document.body.removeEventListener('click', closeMenu);
    }
  }, [menuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  }

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
          onClick={toggleMenu}
          style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "absolute", right: "0", top: "0", height: "100%", width: "76px" }}
          className="menu-button"
        >
          <MenuIcon />
        </div>

        <div className={`menu ${menuOpen ? "open" : ""}`}>
          {menuOptions.map((option, index) => (
            <div key={index} className="menu__option">
              {option.newTab ? (
                <a href={option.path} target="_blank" rel="noreferrer">
                  {option.name}
                </a>
              ) : option.onClick ? (
                <button onClick={option.onClick}>
                  {option.name}
                </button>
              ) : (
                <a href={option.path}>
                  {option.name}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="brain-base__content">
        {children}
      </div>
    </div>
  );
}

export default BrainBase;
