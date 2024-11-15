import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import Popup from "./joinclass";
import ProfilePopup from "./profilepopup";
import CreateClassPopup from "./createclass";
import { UserState } from "../Context/globalContext";

const Navbar = (props) => {
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useState(UserState());

  const handleOpenPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const handleOpenCreatePopup = () => {
    setShowCreatePopup(true);
  };

  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
  };
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
        <div className="nav-link-group">
          <Link className="nav-link" to="/">
            Private Rooms
          </Link>
        </div>
      </div>
      <div className="navbar-right">
        <div className="nav-link-group">
          <Link className="nav-link" onClick={handleOpenPopup}>
            JOIN
          </Link>
          <Link className="nav-link" onClick={handleOpenCreatePopup}>
            Create
          </Link>
        </div>
        <div className="username">
          <Link className="nav-link" onClick={handleOpenprofilePopup}>
            profile
          </Link>
        </div>
      </div>
      {showPopup && <Popup onClose={handleClosePopup} />}
      {showCreatePopup && <CreateClassPopup onClose={handleCloseCreatePopup} />}
      {showrpofilePopup && (
        <ProfilePopup
          onClose={handleCloseProfilePopup}
          user={props.userdata}
          handlelogout={handlelogout}
        />
      )}
    </nav>
  );
};

export default Navbar;
