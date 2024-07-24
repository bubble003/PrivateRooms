import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const globalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    console.log(userInfo)
    setUser(userInfo);

    if (!userInfo) navigate("/");
  }, [navigate]);

  return (
    <globalContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </globalContext.Provider>
  );
};

export const UserState = () => {
  return useContext(globalContext);
};

export default GlobalProvider;
