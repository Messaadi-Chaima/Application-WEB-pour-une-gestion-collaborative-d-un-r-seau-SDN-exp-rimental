import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes } from "react-router-dom";
import {Topology} from "./Pages/Topology";
import {SignIn} from "./Pages/SignIn";
import {Dashboard} from "./Pages/Dashboard";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="containder">
      <BrowserRouter>
        <Routes>
          <Route path="/Topology" element={<Topology />} />
          <Route path="/" element={<SignIn />} />
          <Route path="/Dashboard" element={<Dashboard />} />
       
        </Routes>
        <ToastContainer />
      </BrowserRouter>
      
    </div>
  );
}

export default App;