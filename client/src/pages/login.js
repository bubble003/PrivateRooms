import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserState } from "../Context/globalContext";
import "./login.css";

const Login = () => {
  const { setUser } = UserState(); // Access setUser from context
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const errRef = useRef();
  const navigate = useNavigate();

  // Check if user is already logged in and redirect
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      navigate("/"); // Redirect to home if logged in
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const response = await axios.post(
        `${process.env.REACT_APP_PATH_URL}/login`,
        {
          username: username,
          password: password,
        },
        config
      );

      console.log(response);

      // Clear input fields after successful login
      setUsername("");
      setPassword("");

      // Store user data and login status in localStorage
      localStorage.setItem("userInfo", JSON.stringify(response.data));
      localStorage.setItem("isLoggedIn", true);
      setUser(response.data); // Set user in global context

      // Redirect to the home page after login
      navigate("/");
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Missing Username or Password");
      } else if (err.response?.status === 401) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  return (
    <section>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>
      <form onSubmit={handleSubmit}>
        <h1 className="text-center">Login</h1>
        <div className="form-group">
          <label htmlFor="username">Email:</label>
          <br />
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Login
        </button>
        <p>
          Not registered?
          <br />
          <Link to="/register" className="btn2 btn-secondary">
            Register
          </Link>
        </p>
      </form>
    </section>
  );
};

export default Login;
