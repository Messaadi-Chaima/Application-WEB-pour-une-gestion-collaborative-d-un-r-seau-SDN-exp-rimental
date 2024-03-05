import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes } from "react-router-dom";
import {Home} from "./Pages/Home";
import {Topology} from "./Pages/Topology";
import {Menu} from "./components/Menu";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="containder">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Topology" element={<Topology />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
      
    </div>
  );
}

export default App;
