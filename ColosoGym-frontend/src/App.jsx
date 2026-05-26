import { useState } from 'react'
import './App.css'
import 'tailwindcss';
import Layout from "./layouts/Layout.jsx";
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Dashboard from "./pages/Dashboard.jsx";
import Registros from "./pages/Registros.jsx";

function App() {

  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Layout/>}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="registro" element={<Registros />} />
              </Route>
          </Routes>
      </BrowserRouter>

  )
}

export default App
