import React, { createContext, useContext, useEffect, useState } from "react";

const globalContext = createContext();

const GlobalProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setUser(userInfo);
    }
  }, []);

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
