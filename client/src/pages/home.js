import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../components/card";
import Nav from "../components/navbar";
import { UserState } from "../Context/globalContext";

const HomePage = (props) => {
  const { user, setUser, loading } = UserState(); // Get loading state from context
  const [classes, setClasses] = useState([]);
  const [activeTab, setActiveTab] = useState("owned");
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/"); // Redirect only if user is null and not loading
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.error("User is not logged in");
        return; // Exit early if user is null
      }

      try {
        const endpoint =
          activeTab === "owned" ? "ownedclasses" : "enrolledclasses";
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.get(
          `${process.env.REACT_APP_PATH_URL}/${endpoint}`,
          config
        );
        const data = response.data;

        if (data) {
          const extractedClasses = data.map((classObj) => ({
            id: classObj?._id,
            classDesc: classObj?.classDesc,
            classTitle: classObj?.classTitle,
            classSection: classObj?.classSection,
            classOwner: classObj?.createdByName,
          }));

          setClasses(extractedClasses);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    if (user) {
      fetchData();
    }
  }, [activeTab, user]);

  const handleTabToggle = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="home-page">
      <Nav userdata={props.userdata} setloginstatus={props.setloginstatus} />
      <div className="toggle-buttons">
        <button
          className={activeTab === "owned" ? "active" : ""}
          onClick={() => handleTabToggle("owned")}
        >
          Owned Rooms
        </button>
        <button
          className={activeTab === "enrolled" ? "active" : ""}
          onClick={() => handleTabToggle("enrolled")}
        >
          Enrolled Rooms
        </button>
      </div>
      <div className="card-container">
        {classes.map((classData, index) => (
          <Card key={index} state={activeTab} classData={classData} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
