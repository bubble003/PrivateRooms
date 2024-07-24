// Context/globalContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './classdetails.css';
import CenteredNavbar from '../components/navbar2';
import StreamComponent from '../components/stream';
import WorkComponent from '../components/work';
import PeopleComponent from '../components/people';
import { UserState } from "../Context/globalContext";

const ClassPage = (props) => {
  const { id } = useParams(); // Get the class ID from the URL params
  const { user } = UserState();
  const [activeLink, setActiveLink] = useState('stream'); // Active link state
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

        const response = await axios.get(`${process.env.REACT_APP_PATH_URL}/class/${id}`, config);
        const data = response.data;
        console.log(data);

        setClassData(data.classData);
        setParticipantDetails(data.participants);
      } catch (error) {
        console.error('Error fetching class data:', error);
        setErr(error.response?.data.message || 'Failed to fetch class data.');
      }
    };

    fetchClassData();
  },[]);

  console.log(user);

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
      ) : (
        (activeLink === "stream" && classData) ? (
          <StreamComponent classData={classData} userdata={user} />
          // <></>
        ) : null
      )}
      {activeLink === "work" && classData && <WorkComponent classData={classData} />}
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
