import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Register from "./pages/register";
import ClassPage from "./pages/classdetail";
import ClassPageowned from "./pages/classowned";
import Test from "./pages/Test";

const App = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<Test />} />
        <Route path="/c/:id" element={<ClassPage />} />
        <Route path="/c/o/:id" element={<ClassPageowned />} />
      </Routes>
    </div>
  );
};

export default App;
