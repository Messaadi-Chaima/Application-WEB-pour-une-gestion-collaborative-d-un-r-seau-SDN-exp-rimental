import React from 'react';
import './App.css';
import {BrowserRouter, Route, Routes } from "react-router-dom";
import {Topology} from "./Pages/Topology";
import {SignIn} from "./Pages/SignIn";
import {Dashboard} from "./Pages/Dashboard";
import {Control_experimental_elements} from "./Pages/Control_experimental_elements";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <div className="containder">
      <BrowserRouter>
        <Routes>
          <Route path="/Topology" element={<Topology />} />
          <Route path="/" element={<SignIn />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Control_experimental_elements" element={<Control_experimental_elements />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
      
    </div>
  );
}

export default App;