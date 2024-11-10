import React from "react";
import axios from "axios";
import "./Popup.css";
import { UserState } from "../Context/globalContext"; // Access global context for user
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

const ProfilePopup = ({ onClose }) => {
  const { user, setUser } = UserState(); // Use the user from global context
  const navigate = useNavigate(); // Get the navigate function

  const handleCancel = () => {
    onClose(); // Handle closing the popup
  };

  const handleLogout = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Use the user token from context
        },
      };

      await axios.get(`${process.env.REACT_APP_PATH_URL}/logout`, config);

      // Perform logout: remove user info from context and local storage
      setUser(null);
      localStorage.removeItem("userInfo");
      localStorage.setItem("isLoggedIn", false); // Correctly set the login status to false

      // Redirect to login page after logout
      navigate("/login"); // Use navigate instead of Navigate

      // Close the popup after logout
      handleCancel();
    } catch (err) {
      console.log("Error logging out:", err);
    }
  };

  return (
    <div className="popup">
      <div className="popup-content-profile">  
        <div className="popup-header">
          <h2>User Profile</h2>
          <button className="close-button" onClick={handleCancel}>
            X
          </button>
        </div>
        <div className="popup-body">
          <p>
            <b>First Name:</b> {user?.firstName}
          </p>
          <p>
            <b>Last Name:</b> {user?.lastName}
          </p>
          <p>
            <b>Username:</b> {user?.username}
          </p>
        </div>
        <div className="popup-footer">
          <button className="cancel-button" onClick={handleCancel}>
            Close
          </button>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePopup;
