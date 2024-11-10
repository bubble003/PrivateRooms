// Context/globalContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom"; // Import Navigate
import axios from "axios";
import "./classdetails.css";
import CenteredNavbar from "../components/navbar2";
import StreamComponent from "../components/stream";
import WorkComponent from "../components/work";
import PeopleComponent from "../components/people";
import { UserState } from "../Context/globalContext";

const ClassPage = (props) => {
  const { id } = useParams(); // Get the class ID from the URL params
  const { user } = UserState();
  const [activeLink, setActiveLink] = useState("stream"); // Active link state
  const [classData, setClassData] = useState(null); // Class data state
  const [participantDetails, setParticipantDetails] = useState([]); // Participant details state
  const [err, setErr] = useState(null); // Error state

  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  useEffect(() => {
    const fetchClassData = async () => {
      if (!user) return; // Exit early if user is not defined

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const response = await axios.get(
          `${process.env.REACT_APP_PATH_URL}/class/${id}`,
          config
        );
        const data = response.data;
        console.log(data);

        setClassData(data.classData);
        setParticipantDetails(data.participants);
      } catch (error) {
        console.error("Error fetching class data:", error);
        setErr(error.response?.data.message || "Failed to fetch class data.");
      }
    };

    fetchClassData();
  }, [user, id]); // Add user and id as dependencies

  // Redirect to login if user is not logged in
  if (!user) {
    return <Navigate to="/login" />; // Redirect to login page
  }

  return (
    <div className="class-page">
      <CenteredNavbar
        activeLink={activeLink}
        handleLinkClick={handleLinkClick}
        userdata={user}
        setloginstatus={props.setloginstatus}
      />
      {err ? (
        <p>{err}</p>
      ) : activeLink === "stream" && classData ? (
        <StreamComponent classData={classData} userdata={user} />
      ) : null}
      {activeLink === "people" && classData && (
        <PeopleComponent
          participantDetails={participantDetails}
          classData={classData}
        />
      )}
    </div>
  );
};

export default ClassPage;
