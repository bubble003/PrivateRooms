import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProfilePopup from "./profilepopup";
import { UserState } from "../Context/globalContext";

const CenteredNavbar = (props) => {
  const { user } = UserState(); // Get loading state from context
  const { activeLink, handleLinkClick } = props; // Destructure props
  //console.log(props.userdata);

  const [showrpofilePopup, setShowprofilePopup] = useState(false);
  const handleOpenprofilePopup = () => {
    setShowprofilePopup(true);
  };

  const handleCloseProfilePopup = () => {
    setShowprofilePopup(false);
  };

  const handlelogout = () => {
    props.setloginstatus(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link className="nav-link" to="/">
          PrivateRooms
        </Link>
      </div>
      <div className="navbar-center">
        <ul className="nav-link-group2">
          <li
            className={activeLink === "stream" ? "active" : ""}
            onClick={() => handleLinkClick("stream")}
          >
            <a>Stream</a>
          </li>
          {/* <li
            className={activeLink === "work" ? "active" : ""}
            onClick={() => handleLinkClick("work")}
          >
            <a>Work</a>
          </li> */}
          <li
            className={activeLink === "people" ? "active" : ""}
            onClick={() => handleLinkClick("people")}
          >
            <a>People</a>
          </li>
        </ul>
      </div>
      <div className="navbar-right2">
        <div className="username2">
          <Link className="nav-link" onClick={handleOpenprofilePopup}>
            {user?.fname}
          </Link>
        </div>
      </div>
      {showrpofilePopup && (
        <ProfilePopup
          onClose={handleCloseProfilePopup}
          user={user}
          handlelogout={handlelogout}
        />
      )}
    </nav>
  );
};

export default CenteredNavbar;
